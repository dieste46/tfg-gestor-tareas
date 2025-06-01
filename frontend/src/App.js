import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n'; // Importar configuración de i18n

// Componentes
import Login from './pages/login';
import Registro from './pages/registro';
import Tareas from './pages/tareas';
import Navbar from './components/navbar';

// Validar si un JWT ha expirado decodificando su payload
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decodificar payload del JWT (parte central en base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Verificar expiración comparando con timestamp actual
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    // Token malformado, considerar como expirado
    return true;
  }
};
// Limpiar sesión eliminando token y usuario del localStorage

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Componente de Loading
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-content">
      <div className="spinner-large"></div>
      <h2>Gestor de Tareas</h2>
      <p>Cargando aplicación...</p>
    </div>
  </div>
);

// Componente de Error 404
const NotFound = () => (
  <div className="error-page">
    <div className="error-content">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>La página que buscas no existe o ha sido movida.</p>
      <div className="error-actions">
        <button 
          onClick={() => window.history.back()}
          className="btn secondary"
        >
          ← Volver atrás
        </button>
        <Navigate to="/" className="btn primary">
          🏠 Ir al inicio
        </Navigate>
      </div>
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState(null);
  const { t } = useTranslation();

  // Verificar token almacenado al cargar la app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken) {
          // Validar token antes de establecer sesión
          if (isTokenExpired(storedToken)) {
            clearSession();
          } else {
            setToken(storedToken);
            
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (error) {
                console.error('Error al parsear usuario almacenado:', error);
                localStorage.removeItem('user');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        setAppError('Error al inicializar la aplicación');
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [t]);

  // Manejar login con datos de usuario
  const handleLogin = (newToken, userData = null) => {
    try {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      
      setAppError(null);
    } catch (error) {
      console.error('Error al guardar token:', error);
      setAppError('Error al guardar la sesión');
    }
  };
  
// Limpiar sesión al cerrar sesión
  const handleLogout = () => {
    try {
      clearSession();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Componente para rutas públicas (solo sin autenticar)
  const PublicRoute = ({ children }) => {
    if (token) {
      return <Navigate to="/tareas" replace />;
    }
    return children;
  };

  // Pantalla de carga inicial
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error de aplicación
  if (appError) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h1>⚠️</h1>
          <h2>Error de aplicación</h2>
          <p>{appError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn primary"
          >
            🔄 Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* ← CORREGIDO: Pasar user correctamente */}
        <Navbar token={token} user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            {/* Ruta raíz - redirige según autenticación */}
            <Route
              path="/"
              element={token ? <Navigate to="/tareas" replace /> : <Navigate to="/login" replace />}
            />
            
            {/* Rutas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login onLogin={handleLogin} />
                </PublicRoute>
              }
            />
            
            <Route
              path="/registro"
              element={
                <PublicRoute>
                  <Registro />
                </PublicRoute>
              }
            />
            
            {/* Rutas protegidas */}
            <Route
              path="/tareas"
              element={
                <ProtectedRoute>
                  <Tareas token={token} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer opcional */}
        <footer className="app-footer">
          <p>
            Gestor de Tareas Web - TFG {new Date().getFullYear()} | 
            Desarrollado por Jorge Dieste Fuentes
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;