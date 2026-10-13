import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const RING_TIMEOUT_MS = 30000;

export function CallProvider({ children }) {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();

  // 'idle' | 'calling' (we called, ringing on their side) | 'incoming' | 'connected'
  const [callState, setCallState] = useState('idle');
  const [callType, setCallType] = useState('audio'); // 'audio' | 'video'
  const [peer, setPeer] = useState(null); // { id, name }
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const cleanup = useCallback(() => {
    clearTimeout(ringTimeoutRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingCandidatesRef.current = [];
    setCallState('idle');
    setPeer(null);
    setMuted(false);
    setVideoOff(false);
  }, []);

  const createPeerConnection = useCallback((toId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('ice-candidate', { to: toId, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (callType === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };
    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        if (callState !== 'idle') endCall();
      }
    };
    return pc;
  }, [socket, callType, callState]);

  const startCall = useCallback(async (toId, toName, type = 'audio') => {
    const myId = user?.id || user?._id;
    if (!socket || !myId) return;
    if (String(toId) === String(myId)) return;

    // Only show a real "ringing" state if the other person is actually
    // online right now — otherwise there's no device to ring.
    if (!isOnline(toId)) {
      setError(`${toName || 'This user'} is offline right now.`);
      setTimeout(() => setError(null), 3500);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;
      setCallType(type);
      setPeer({ id: toId, name: toName });
      setCallState('calling');

      const pc = createPeerConnection(toId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        to: toId,
        from: myId,
        fromName: user?.name,
        offer,
        callType: type,
      });

      ringTimeoutRef.current = setTimeout(() => {
        socket.emit('end-call', { to: toId });
        setError('No answer.');
        setTimeout(() => setError(null), 3000);
        cleanup();
      }, RING_TIMEOUT_MS);
    } catch (e) {
      setError('Could not access microphone/camera.');
      setTimeout(() => setError(null), 3500);
      cleanup();
    }
  }, [socket, user, isOnline, createPeerConnection, cleanup]);

  const acceptCall = useCallback(async () => {
    const incoming = window.__incomingCallData;
    if (!incoming || !socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incoming.callType === 'video',
      });
      localStreamRef.current = stream;

      const pc = createPeerConnection(incoming.from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      pendingCandidatesRef.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer-call', { to: incoming.from, answer });

      setCallState('connected');
    } catch (e) {
      setError('Could not access microphone/camera.');
      setTimeout(() => setError(null), 3500);
      socket.emit('reject-call', { to: incoming.from });
      cleanup();
    }
  }, [socket, createPeerConnection, cleanup]);

  const declineCall = useCallback(() => {
    const incoming = window.__incomingCallData;
    if (incoming && socket) socket.emit('reject-call', { to: incoming.from });
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    if (peer && socket) socket.emit('end-call', { to: peer.id });
    cleanup();
  }, [peer, socket, cleanup]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted((m) => !m);
  }, [muted]);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = videoOff; });
    setVideoOff((v) => !v);
  }, [videoOff]);

  // Wire up socket listeners for incoming calls / signaling.
  useEffect(() => {
    if (!socket) return;

    const onIncomingCall = ({ from, fromName, offer, callType: cType }) => {
      if (callState !== 'idle') {
        socket.emit('reject-call', { to: from }); // busy
        return;
      }
      window.__incomingCallData = { from, offer, callType: cType };
      setCallType(cType || 'audio');
      setPeer({ id: from, name: fromName });
      setCallState('incoming');
    };

    const onCallAnswered = async ({ answer }) => {
      clearTimeout(ringTimeoutRef.current);
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        pendingCandidatesRef.current.forEach((c) => pcRef.current.addIceCandidate(new RTCIceCandidate(c)));
        pendingCandidatesRef.current = [];
      }
      setCallState('connected');
    };

    const onIceCandidate = ({ candidate }) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const onCallRejected = () => {
      setError(`${peer?.name || 'They'} declined the call.`);
      setTimeout(() => setError(null), 3000);
      cleanup();
    };

    const onCallEnded = () => cleanup();

    socket.on('incoming-call', onIncomingCall);
    socket.on('call-answered', onCallAnswered);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('call-rejected', onCallRejected);
    socket.on('call-ended', onCallEnded);

    return () => {
      socket.off('incoming-call', onIncomingCall);
      socket.off('call-answered', onCallAnswered);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('call-rejected', onCallRejected);
      socket.off('call-ended', onCallEnded);
    };
  }, [socket, callState, peer, cleanup]);

  // Attach local video preview once the stream + DOM node both exist.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [callState]);

  return (
    <CallContext.Provider value={{
      callState, callType, peer, muted, videoOff, error,
      startCall, acceptCall, declineCall, endCall, toggleMute, toggleVideo,
      localVideoRef, remoteVideoRef, remoteAudioRef,
    }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within a CallProvider');
  return ctx;
}
