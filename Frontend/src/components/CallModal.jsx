import React, { useEffect, useState } from 'react';
import {
  FaPhone, FaPhoneSlash, FaVideo, FaVideoSlash,
  FaMicrophone, FaMicrophoneSlash, FaUserCircle
} from 'react-icons/fa';
import { useCall } from '../context/CallContext';

const CallTimer = ({ active }) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return <span>{mm}:{ss}</span>;
};

export default function CallModal() {
  const {
    callState, callType, peer, muted, videoOff, error,
    acceptCall, declineCall, endCall, toggleMute, toggleVideo,
    localVideoRef, remoteVideoRef, remoteAudioRef,
  } = useCall();

  if (callState === 'idle' && !error) return null;

  const isVideo = callType === 'video';

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <audio ref={remoteAudioRef} autoPlay hidden={isVideo} />

      {error && callState === 'idle' && (
        <div className="bg-surface dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-2xl text-center max-w-xs">
          <p className="text-sm text-ink-soft dark:text-white">{error}</p>
        </div>
      )}

      {callState !== 'idle' && (
        <div className="w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 shadow-2xl">
          {/* Video area */}
          {isVideo ? (
            <div className="relative bg-black aspect-[4/5]">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {callState !== 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <FaUserCircle className="text-8xl text-white/30" />
                </div>
              )}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-24 h-32 rounded-xl object-cover border-2 border-white/20 shadow-lg"
              />
            </div>
          ) : (
            <div className="py-14 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <FaUserCircle className="text-6xl text-white/60" />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="px-6 pt-5 pb-2 text-center">
            <h3 className="text-lg font-semibold text-white">{peer?.name || 'Unknown'}</h3>
            <p className="text-sm text-white/50 mt-1">
              {callState === 'calling' && 'Ringing…'}
              {callState === 'incoming' && `Incoming ${isVideo ? 'video' : 'audio'} call…`}
              {callState === 'connected' && <CallTimer active={callState === 'connected'} />}
            </p>
          </div>

          {/* Controls */}
          <div className="px-6 pb-8 pt-4 flex items-center justify-center gap-4">
            {callState === 'incoming' ? (
              <>
                <button
                  onClick={declineCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition"
                  aria-label="Decline"
                >
                  <FaPhoneSlash />
                </button>
                <button
                  onClick={acceptCall}
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition animate-pulse"
                  aria-label="Accept"
                >
                  <FaPhone />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition ${muted ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
                  aria-label="Toggle mute"
                >
                  {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                {isVideo && (
                  <button
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition ${videoOff ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
                    aria-label="Toggle video"
                  >
                    {videoOff ? <FaVideoSlash /> : <FaVideo />}
                  </button>
                )}
                <button
                  onClick={endCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition"
                  aria-label="End call"
                >
                  <FaPhoneSlash />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
