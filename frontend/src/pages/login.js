import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ButtonSpinner } from '../components/LoadingComponents';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Login({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError(t('auth.login.emailRequired'));
      return false;
    }
    
    if (!validateEmail(email)) {
      setError(t('auth.login.emailInvalid'));
      return false;
    }
    
    if (!password.trim()) {
      setError(t('auth.login.passwordRequired'));
      return false;
    }
    
    if (password.length < 6) {
      setError(t('auth.login.passwordTooShort'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('auth.login.loginFailed'));
      }

      // Pasar token Y datos del usuario
      onLogin(data.token, data.user);
      navigate('/tareas');
      
    } catch (err) {
      console.error('Error en login:', err);
      
      if (err.message.includes('Failed to fetch')) {
        setError(t('auth.login.connectionError'));
      } else {
        setError(err.message || t('auth.login.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor-form">
      <div className="form-header">
        <h2>{t('auth.login.title')}</h2>
        <p>{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder={t('auth.login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('auth.login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            disabled={loading}
          />
          <span>{t('auth.login.showPassword')}</span>
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className={`btn primary ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <ButtonSpinner />
              {t('auth.login.loginButtonLoading')}
            </>
          ) : (
            t('auth.login.loginButton')
          )}
        </button>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-footer">
          <p>
            {t('auth.login.noAccount')}{' '}
            <Link to="/registro" className="link">
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;