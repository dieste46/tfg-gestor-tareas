import { Link, useNavigate } from 'react-router-dom';

function Navbar({ token, onLogout }) {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', backgroundColor: '#eee' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Inicio</Link>
      {token ? (
        <>
          <Link to="/tareas" style={{ marginRight: '1rem' }}>Mis tareas</Link>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
          <Link to="/registro">Registro</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
