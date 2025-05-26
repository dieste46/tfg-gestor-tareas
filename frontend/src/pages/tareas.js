import { useState, useEffect } from 'react';

function Tareas({ token }) {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState('');

  const cargarTareas = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/tareas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) setTareas(data);
      else setError(data.error || 'Error al cargar tareas');
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, prioridad: 'media' })
      });

      const data = await res.json();
      if (res.ok) {
        setTitulo('');
        cargarTareas();
      } else {
        setError(data.error || 'Error al crear tarea');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Mis Tareas</h2>

      <form onSubmit={crearTarea} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Nueva tarea"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            {tarea.titulo} - {tarea.completada ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tareas;
