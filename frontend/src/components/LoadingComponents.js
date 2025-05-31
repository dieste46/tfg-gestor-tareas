// src/components/LoadingComponents.js
import React from 'react';

// Skeleton para una tarea individual
export const TaskSkeleton = () => (
  <div className="task-skeleton">
    <div className="skeleton skeleton-line skeleton-title"></div>
    <div className="skeleton skeleton-line skeleton-subtitle"></div>
    <div className="skeleton-meta">
      <div className="skeleton skeleton-badge"></div>
      <div className="skeleton skeleton-badge"></div>
    </div>
  </div>
);

// Skeleton para múltiples tareas
export const TaskListSkeleton = ({ count = 3 }) => (
  <div className="tasks-list">
    {Array.from({ length: count }, (_, i) => (
      <TaskSkeleton key={i} />
    ))}
  </div>
);

// Spinner simple para botones
export const ButtonSpinner = () => (
  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
);

// Loading overlay para formularios
export const FormLoading = ({ message = 'Guardando...' }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--border-radius-lg)',
    zIndex: 10
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner-large"></div>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  </div>
);

// Loading para estadísticas
export const StatsLoading = () => (
  <div className="stats-grid">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="stat-card">
        <div className="skeleton" style={{ width: '40px', height: '24px', margin: '0 auto 8px' }}></div>
        <div className="skeleton" style={{ width: '60px', height: '14px', margin: '0 auto' }}></div>
      </div>
    ))}
  </div>
);

// Componente de carga para página completa
export const PageLoading = ({ message = 'Cargando...' }) => (
  <div className="loading-container">
    <div className="spinner-large"></div>
    <p>{message}</p>
  </div>
);

// Export por defecto corregido
const LoadingComponents = {
  TaskSkeleton,
  TaskListSkeleton,
  ButtonSpinner,
  FormLoading,
  StatsLoading,
  PageLoading
};

export default LoadingComponents;