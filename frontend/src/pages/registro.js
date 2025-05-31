import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ButtonSpinner } from '../components/LoadingComponents';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Registro() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validaciones básicas
    if (!email.trim()) {
      setError(t('auth.register.emailRequired'));
      return;
    }

    if (!password) {
      setError(t('auth.register.passwordRequired'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.register.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          nombre: nombre.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso
        setMessage(t('auth.register.success'));
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNombre('');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Error del servidor
        setError(data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(t('auth.register.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor-form">
      <div className="form-header">
        <h2>{t('auth.register.title')}</h2>
        <p>{t('auth.register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder={t('auth.register.name', { optional: t('common.optional') })}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={loading}
        />

        <input
          type="email"
          placeholder={t('auth.register.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={t('auth.register.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={t('auth.register.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <span>{t('auth.register.showPasswords')}</span>
        </label>

        <button 
          type="submit" 
          className={`btn primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <ButtonSpinner />
              {t('auth.register.createButtonLoading')}
            </>
          ) : (
            t('auth.register.createButton')
          )}
        </button>
        
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        
        <div className="form-footer">
          <p>
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="link">
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Registro;