import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Tareas from './pages/Tareas';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const almacenado = localStorage.getItem('token');
    if (almacenado) {
      setToken(almacenado);
    }
  }, []);

  const manejarLogin = (nuevoToken) => {
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
  };

  const manejarLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} onLogout={manejarLogout} />
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/tareas" /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={token ? <Navigate to="/tareas" /> : <Login onLogin={manejarLogin} />}
        />
        <Route
          path="/registro"
          element={token ? <Navigate to="/tareas" /> : <Registro />}
        />
        <Route
          path="/tareas"
          element={token ? <Tareas token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={<h2 style={{ padding: "2rem" }}>404 - Página no encontrada</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;
