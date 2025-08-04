import React, { useState } from 'react';

// API Base URL for all operations - now uses a Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // <--- UPDATED THIS LINE

const LoginPage = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to decode JWT payload
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT:", e);
      return null;
    }
  };

  const handleAuthRequest = async (endpoint) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      console.log('Raw API Response Text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse API response as JSON:", responseText);
        setError('An unexpected response was received from the API. Please check console for details.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        console.log('API Response Data (on success):', data);

        let extractedUserId = null;
        let token = null;

        if (data.access) { // Check if 'access' token is present
          token = data.access;
          const decodedToken = decodeJwt(token);
          if (decodedToken && decodedToken.id) { // Extract 'id' from the decoded token
            extractedUserId = decodedToken.id;
          }
        }

        if (extractedUserId && token) {
          console.log(`${endpoint} successful. Extracted userId:`, extractedUserId, 'Token:', token);
          onAuthSuccess(extractedUserId, token); // Pass BOTH userId and token back to App.jsx
        } else {
          setError('Authentication successful, but no identifiable user ID or access token found in the response.');
        }
      } else {
        setError(data.message || `Authentication failed: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`Fetch error for ${endpoint}:`, err);
      setError('Network error or API is unreachable. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    handleAuthRequest('login');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    handleAuthRequest('register');
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="app-title">
          <span className="app-title-blue">Fit</span>Track
        </h1>
        <p className="app-subtitle">Your journey to a healthier you starts here.</p>

        <h2 className="form-heading">Login or Register</h2>
        <form className="form-group">
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'none' }}>Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" style={{ display: 'none' }}>Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="error-message">{error}</p>
          )}
          <div className="button-group">
            <button
              type="submit"
              onClick={handleLogin}
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
            <button
              type="submit"
              onClick={handleRegister}
              disabled={loading}
              className="auth-button register-button"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
