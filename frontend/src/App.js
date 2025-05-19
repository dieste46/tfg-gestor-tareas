import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [completada, setCompletada] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    setAutenticado(false);
    setTareas([]);
    setUsuarioNombre('');
    setEmail('');
    setPassword('');
    setNombre('');
  };

  const cargarTareas = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:4000/api/tareas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTareas(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        alert('Error al cargar las tareas');
      }
    }
  }, []);

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/login', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      setUsuarioNombre(res.data.nombre || email);
      setAutenticado(true);
      cargarTareas();
    } catch (error) {
      alert('Error al iniciar sesión');
    }
  };

  const registrar = async () => {
    try {
      await axios.post('http://localhost:4000/api/registro', {
        nombre,
        email,
        password
      });
      alert('Usuario registrado. Ahora puedes iniciar sesión.');
    } catch (error) {
      alert('Error al registrar usuario');
    }
  };

  const crearTarea = async () => {
    if (!titulo) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:4000/api/tareas', {
        titulo,
        descripcion,
        fecha_limite: fechaLimite,
        prioridad,
        completada: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      limpiarFormulario();
      cargarTareas();
    } catch (error) {
      if (error.response?.status === 401) logout();
      else alert('Error al crear tarea');
    }
  };

  const actualizarTarea = async () => {
    if (!titulo || !editandoId) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:4000/api/tareas/${editandoId}`, {
        titulo,
        descripcion,
        fecha_limite: fechaLimite,
        prioridad,
        completada
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      limpiarFormulario();
      cargarTareas();
    } catch (error) {
      if (error.response?.status === 401) logout();
      else alert('Error al actualizar tarea');
    }
  };

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:4000/api/tareas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarTareas();
    } catch (error) {
      if (error.response?.status === 401) logout();
      else alert('Error al eliminar tarea');
    }
  };

  const empezarEdicion = (tarea) => {
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion);
    setFechaLimite(tarea.fecha_limite?.split('T')[0] || '');
    setPrioridad(tarea.prioridad);
    setCompletada(tarea.completada);
    setEditandoId(tarea.id);
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setFechaLimite('');
    setPrioridad('media');
    setCompletada(false);
    setEditandoId(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAutenticado(true);
      setUsuarioNombre('(usuario)');
      cargarTareas();
    }
  }, [cargarTareas]);

  if (!autenticado) {
    return (
      <div className="container">
        <h1>Gestor de Tareas - Login</h1>
        <div className="form">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn create" onClick={login}>Iniciar sesión</button>
          <button className="btn update" onClick={registrar}>Registrarse</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Gestor de Tareas</h1>
        <div className="usuario-info">
          <span>Hola, {usuarioNombre}</span>
          <button onClick={logout} className="btn delete">Salir</button>
        </div>
      </div>

      <div className="form">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />

        <input
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />

        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {editandoId && (
          <label>
            <input
              type="checkbox"
              checked={completada}
              onChange={(e) => setCompletada(e.target.checked)}
            />
            Completada
          </label>
        )}

        {editandoId ? (
          <button className="btn update" onClick={actualizarTarea}>Actualizar</button>
        ) : (
          <button className="btn create" onClick={crearTarea}>Crear</button>
        )}
      </div>

      <ul className="tarea-lista">
        {tareas.map((tarea) => (
          <li key={tarea.id} className="tarea-item">
            <div>
              <strong>{tarea.titulo}</strong> - {tarea.descripcion}<br />
              <small>{tarea.prioridad} | {tarea.fecha_limite?.split('T')[0]} | {tarea.completada ? '✅' : '❌'}</small>
            </div>
            <div>
              <button onClick={() => empezarEdicion(tarea)} className="btn edit">Editar</button>
              <button onClick={() => eliminarTarea(tarea.id)} className="btn delete">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      <footer className="footer">
        <p>Desarrollado por Jorge Dieste © 2025</p>
      </footer>
    </div>
  );
}

export default App;
