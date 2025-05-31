import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
 // TaskListSkeleton, 
  ButtonSpinner, 
  // StatsLoading, 
  PageLoading 
} from '../components/LoadingComponents';
import useLoading from '../hooks/useLoading';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Tareas({ token, onLogout }) {
  const { t } = useTranslation();
  const [tareas, setTareas] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    fecha_limite: ''
  });
  const [filtros, setFiltros] = useState({
    completadas: 'todas',
    prioridad: 'todas'
  });
  const [error, setError] = useState('');
  const [loadingTareas, setLoadingTareas] = useState(true);
  
  // Estados de carga específicos usando el hook personalizado
  const createTaskLoading = useLoading();
  const updateTaskLoading = useLoading();
  const deleteTaskLoading = useLoading();
  
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  }, [onLogout, navigate]);

  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error(t('tasks.errors.sessionExpired'));
    }

    return response;
  }, [token, handleUnauthorized, t]);

  const cargarTareas = useCallback(async () => {
    try {
      setLoadingTareas(true);
      const response = await makeAuthenticatedRequest(`${API_URL}/api/tareas`);
      
      const data = await response.json();
      
      if (response.ok) {
        setTareas(Array.isArray(data) ? data : []);
        setError('');
      } else {
        throw new Error(data.error || t('tasks.errors.loadFailed'));
      }
    } catch (err) {
      console.error('Error cargando tareas:', err);
      if (err.message !== t('tasks.errors.sessionExpired')) {
        setError(err.message || t('tasks.errors.loadFailed'));
      }
    } finally {
      setLoadingTareas(false);
    }
  }, [makeAuthenticatedRequest, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      setError(t('tasks.form.titleRequired'));
      return;
    }

    try {
      await createTaskLoading.withLoading(async () => {
        const tareaData = {
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim() || null,
          prioridad: formData.prioridad
        };

        if (formData.fecha_limite) {
          tareaData.fecha_limite = formData.fecha_limite;
        }

        const response = await makeAuthenticatedRequest(`${API_URL}/api/tareas`, {
          method: 'POST',
          body: JSON.stringify(tareaData)
        });

        const data = await response.json();
        
        if (response.ok) {
          // Actualización optimista: añadir la nueva tarea al estado local
          const nuevaTarea = {
            ...data,
            completada: false,
            createdAt: new Date().toISOString()
          };
          
          setTareas(prevTareas => [nuevaTarea, ...prevTareas]);
          setFormData({ titulo: '', descripcion: '', prioridad: 'media', fecha_limite: '' });
          setError('');
          
          // Hacer scroll suave al inicio para ver la nueva tarea
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          throw new Error(data.error || t('tasks.errors.createFailed'));
        }
      }, t('tasks.form.addButtonLoading'));
    } catch (err) {
      console.error('Error creando tarea:', err);
      if (err.message !== t('tasks.errors.sessionExpired')) {
        setError(err.message || t('tasks.errors.createFailed'));
      }
    }
  };

  const toggleCompletada = async (id, completada) => {
    // Actualización optimista inmediata
    setTareas(prevTareas => 
      prevTareas.map(tarea => 
        tarea.id === id 
          ? { ...tarea, completada: !tarea.completada }
          : tarea
      )
    );

    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/api/tareas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completada: !completada })
      });

      if (!response.ok) {
        // Si hay error, revertir el cambio
        setTareas(prevTareas => 
          prevTareas.map(tarea => 
            tarea.id === id 
              ? { ...tarea, completada: completada }
              : tarea
          )
        );
        
        const data = await response.json();
        throw new Error(data.error || t('tasks.errors.updateFailed'));
      }
    } catch (err) {
      console.error('Error actualizando tarea:', err);
      if (err.message !== t('tasks.errors.sessionExpired')) {
        setError(err.message || t('tasks.errors.updateFailed'));
        // Mostrar el error por 3 segundos
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const eliminarTarea = async (id, titulo) => {
    if (!window.confirm(t('tasks.item.deleteConfirm', { title: titulo }))) {
      return;
    }

    // Guardar la tarea por si necesitamos restaurarla
    const tareaEliminada = tareas.find(t => t.id === id);
    
    // Actualización optimista: eliminar inmediatamente
    setTareas(prevTareas => prevTareas.filter(tarea => tarea.id !== id));

    try {
      const response = await makeAuthenticatedRequest(`${API_URL}/api/tareas/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Si hay error, restaurar la tarea
        if (tareaEliminada) {
          setTareas(prevTareas => [...prevTareas, tareaEliminada].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          ));
        }
        
        const data = await response.json();
        throw new Error(data.error || t('tasks.errors.deleteFailed'));
      }
    } catch (err) {
      console.error('Error eliminando tarea:', err);
      if (err.message !== t('tasks.errors.sessionExpired')) {
        setError(err.message || t('tasks.errors.deleteFailed'));
        // Mostrar el error por 3 segundos
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Funciones auxiliares
  const getPrioridadColor = (prioridad) => {
    const colores = {
      alta: '#e53e3e',
      media: '#ed8936',
      baja: '#38a169'
    };
    return colores[prioridad] || colores.media;
  };

  const getPrioridadIcon = (prioridad) => {
    const iconos = {
      alta: '🔴',
      media: '🟡',
      baja: '🟢'
    };
    return iconos[prioridad] || iconos.media;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const esHoy = fechaObj.toDateString() === ahora.toDateString();
    const esMañana = fechaObj.toDateString() === new Date(ahora.getTime() + 24*60*60*1000).toDateString();
    
    if (esHoy) return t('tasks.item.today');
    if (esMañana) return t('tasks.item.tomorrow');
    
    return fechaObj.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const estaVencida = (fecha) => {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  };

  const tareasFiltradas = tareas.filter(tarea => {
    const filtroCompletadas = filtros.completadas === 'todas' ||
      (filtros.completadas === 'completadas' && tarea.completada) ||
      (filtros.completadas === 'pendientes' && !tarea.completada);
    
    const filtroPrioridad = filtros.prioridad === 'todas' || 
      tarea.prioridad === filtros.prioridad;
    
    return filtroCompletadas && filtroPrioridad;
  });

  const estadisticas = {
    total: tareas.length,
    completadas: tareas.filter(t => t.completada).length,
    pendientes: tareas.filter(t => !t.completada).length,
    vencidas: tareas.filter(t => !t.completada && estaVencida(t.fecha_limite)).length
  };

  // Effect para cargar tareas
  useEffect(() => {
    if (token) {
      cargarTareas();
    }
  }, [token, cargarTareas]);

  // Pantalla de carga inicial
  if (loadingTareas) {
    return <PageLoading message={t('tasks.loading')} />;
  }

  return (
    <div className="container">
      {/* Header con estadísticas */}
      <div className="dashboard-header">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{estadisticas.total}</span>
            <span className="stat-label">{t('tasks.stats.total')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{estadisticas.pendientes}</span>
            <span className="stat-label">{t('tasks.stats.pending')}</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{estadisticas.completadas}</span>
            <span className="stat-label">{t('tasks.stats.completed')}</span>
          </div>
          <div className="stat-card urgent">
            <span className="stat-number">{estadisticas.vencidas}</span>
            <span className="stat-label">{t('tasks.stats.overdue')}</span>
          </div>
        </div>
      </div>

      {/* Formulario para crear tarea */}
      <div className="task-form-container">
        <h3>{t('tasks.form.newTask')}</h3>
        <form onSubmit={crearTarea} className="task-form">
          <div className="form-column">
            <input
              type="text"
              name="titulo"
              placeholder={t('tasks.form.titlePlaceholder')}
              value={formData.titulo}
              onChange={handleInputChange}
              disabled={createTaskLoading.isLoading}
              className="task-input"
              maxLength={255}
              required
            />
            
            <textarea
              name="descripcion"
              placeholder={t('tasks.form.descriptionPlaceholder', { optional: t('common.optional') })}
              value={formData.descripcion}
              onChange={handleInputChange}
              disabled={createTaskLoading.isLoading}
              className="task-description"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={handleInputChange}
              disabled={createTaskLoading.isLoading}
              className="date-input"
              min={new Date().toISOString().split('T')[0]}
              title="Fecha límite (opcional)"
            />
            
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleInputChange}
              disabled={createTaskLoading.isLoading}
              className="priority-select"
            >
              <option value="baja">🟢 {t('tasks.form.priority.baja')}</option>
              <option value="media">🟡 {t('tasks.form.priority.media')}</option>
              <option value="alta">🔴 {t('tasks.form.priority.alta')}</option>
            </select>
            
            <button 
              type="submit" 
              disabled={createTaskLoading.isLoading || !formData.titulo.trim()}
              className={`btn primary ${createTaskLoading.isLoading ? 'loading' : ''}`}
            >
              {createTaskLoading.isLoading ? (
                <>
                  <ButtonSpinner />
                  {t('tasks.form.addButtonLoading')}
                </>
              ) : (
                t('tasks.form.addButton')
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="filter-group">
          <label>{t('tasks.filters.status')}</label>
          <select
            value={filtros.completadas}
            onChange={(e) => setFiltros(prev => ({ ...prev, completadas: e.target.value }))}
          >
            <option value="todas">{t('tasks.filters.statusOptions.todas')}</option>
            <option value="pendientes">{t('tasks.filters.statusOptions.pendientes')}</option>
            <option value="completadas">{t('tasks.filters.statusOptions.completadas')}</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>{t('tasks.filters.priority')}</label>
          <select
            value={filtros.prioridad}
            onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
          >
            <option value="todas">{t('tasks.filters.priorityOptions.todas')}</option>
            <option value="alta">{t('tasks.filters.priorityOptions.alta')}</option>
            <option value="media">{t('tasks.filters.priorityOptions.media')}</option>
            <option value="baja">{t('tasks.filters.priorityOptions.baja')}</option>
          </select>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {/* Lista de tareas */}
      <div className="tasks-container">
        {tareasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              {tareas.length === 0 
                ? t('tasks.empty.noTasks.title')
                : t('tasks.empty.noFiltered.title')}
            </h3>
            <p>
              {tareas.length === 0
                ? t('tasks.empty.noTasks.description')
                : t('tasks.empty.noFiltered.description')}
            </p>
          </div>
        ) : (
          <div className="tasks-list">
            {tareasFiltradas.map((tarea) => (
              <div
                key={tarea.id}
                className={`task-item ${tarea.completada ? 'completed' : ''} ${
                  estaVencida(tarea.fecha_limite) && !tarea.completada ? 'overdue' : ''
                }`}
                style={{ borderLeftColor: getPrioridadColor(tarea.prioridad) }}
              >
                <div className="task-content">
                  <div className="task-title">
                    {tarea.completada && <span className="check-icon">✅</span>}
                    <span className={tarea.completada ? 'completed-text' : ''}>
                      {tarea.titulo}
                    </span>
                  </div>
                  
                  {tarea.descripcion && (
                    <div className="task-description-display">
                      {tarea.descripcion}
                    </div>
                  )}
                  
                  <div className="task-meta">
                    <span className="priority-badge">
                      {getPrioridadIcon(tarea.prioridad)} {t(`tasks.form.priority.${tarea.prioridad}`)}
                    </span>
                    
                    {tarea.fecha_limite && (
                      <span className={`date-badge ${estaVencida(tarea.fecha_limite) && !tarea.completada ? 'overdue' : ''}`}>
                        📅 {formatearFecha(tarea.fecha_limite)}
                      </span>
                    )}
                    
                    <span className="task-date">
                      {t('tasks.item.createdOn', { date: new Date(tarea.createdAt).toLocaleDateString('es-ES') })}
                    </span>
                  </div>
                </div>
                
                <div className="task-actions">
                  <button
                    onClick={() => toggleCompletada(tarea.id, tarea.completada)}
                    className={`btn-icon ${tarea.completada ? 'btn-undo' : 'btn-complete'}`}
                    title={tarea.completada ? t('tasks.item.markPending') : t('tasks.item.markComplete')}
                    disabled={updateTaskLoading.isLoading}
                  >
                    {updateTaskLoading.isLoading ? '⏳' : (tarea.completada ? '↩️' : '✅')}
                  </button>
                  
                  <button
                    onClick={() => eliminarTarea(tarea.id, tarea.titulo)}
                    className="btn-icon btn-delete"
                    title={t('tasks.item.deleteTask')}
                    disabled={deleteTaskLoading.isLoading}
                  >
                    {deleteTaskLoading.isLoading ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tareas;