import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMountain } from 'react-icons/fa';

// Landing page for GET /api/auth/google/callback's redirect:
// http://.../oauth-success?accessToken=...&refreshToken=...
// Stores the tokens, loads the account, then sends the user on their way.
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken) {
      setError('Google sign-in did not return a valid session. Please try again.');
      return;
    }

    loginWithTokens(accessToken, refreshToken)
      .then((user) => {
        if (user.role === 'farmer') navigate('/farmer/dashboard', { replace: true });
        else if (user.role === 'homestay_owner' || user.role === 'homestay') navigate('/homestay/dashboard', { replace: true });
        else navigate('/', { replace: true });
      })
      .catch(() => {
        setError('We could not sign you in with Google. Please try again or use email/password.');
      });

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-4">
      <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <FaMountain className="text-5xl text-green-600 mx-auto mb-4" />
        {error ? (
          <>
            <p className="text-red-500 font-semibold mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-ink-soft dark:text-ink-soft font-medium">Signing you in with Google...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;
