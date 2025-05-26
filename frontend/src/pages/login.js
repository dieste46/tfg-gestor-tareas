import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('https://tfg-gestor-tareas.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        return setError(data.error || 'Error al iniciar sesión');
      }

      onLogin(data.token);
      navigate('/tareas');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="contenedor-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={manejarSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type={verPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={verPassword}
            onChange={(e) => setVerPassword(e.target.checked)}
          />
          Mostrar contraseña
        </label>

        <button type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
