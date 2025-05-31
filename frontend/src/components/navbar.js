import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Componente selector de idioma compacto
const LanguageSelector = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  const getCurrentLanguageFlag = () => {
    return i18n.language.startsWith('es') ? '🇪🇸' : '🇺🇸';
  };
  
  return (
    <button 
      onClick={() => changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')}
      className="language-toggle"
      aria-label="Cambiar idioma"
      title={`Switch to ${i18n.language.startsWith('es') ? 'English' : 'Español'}`}
    >
      <span className="language-flag">
        {getCurrentLanguageFlag()}
      </span>
    </button>
  );
};

function Navbar({ token, user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.nombre) {
      return user.nombre;
    }
    
    return user.email ? user.email.split('@')[0] : '';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.navbar')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">📋</span>
          <span className="brand-text">{t('navbar.brand')}</span>
        </Link>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {token ? (
            <>
              <Link 
                to="/tareas" 
                className={`navbar-link ${isActiveRoute('/tareas') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {t('navbar.myTasks')}
              </Link>
              
              {user && (
                <span className="navbar-greeting">
                  {t('navbar.greeting', { name: getDisplayName() })}
                </span>
              )}
              
              <button 
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={t('navbar.toggleTheme', { 
                  mode: t(`navbar.${theme === 'light' ? 'dark' : 'light'}`) 
                })}
                title={t('navbar.toggleTheme', { 
                  mode: t(`navbar.${theme === 'light' ? 'dark' : 'light'}`) 
                })}
              >
                <span className="theme-icon">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
              </button>

              {/* Selector de idioma compacto */}
              <LanguageSelector />
              
              <button 
                onClick={handleLogout}
                className="navbar-button logout"
                aria-label={t('navbar.logout')}
              >
                {t('navbar.logout')}
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`navbar-link ${isActiveRoute('/login') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {t('navbar.login')}
              </Link>
              
              <Link 
                to="/registro" 
                className={`navbar-link register ${isActiveRoute('/registro') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {t('navbar.register')}
              </Link>

              <button 
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={t('navbar.toggleTheme', { 
                  mode: t(`navbar.${theme === 'light' ? 'dark' : 'light'}`) 
                })}
                title={t('navbar.toggleTheme', { 
                  mode: t(`navbar.${theme === 'light' ? 'dark' : 'light'}`) 
                })}
              >
                <span className="theme-icon">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
              </button>

              {/* Selector de idioma compacto también en público */}
              <LanguageSelector />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;