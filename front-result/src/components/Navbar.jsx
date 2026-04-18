import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Settings, ChevronDown, MessageSquare, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReservations, THERAPIST_DEMO_ID } from '../context/ReservationContext';
import logoImg from '../../image.png';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { pendingCount } = useReservations();
  const therapistId = user?.id || THERAPIST_DEMO_ID;
  const notifCount = user?.role === 'therapist' ? pendingCount(therapistId) : 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setHidden(false);
      } else if (currentY > lastScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
        <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <span className="navbar-logo-mark">
            <img src={logoImg} alt="TherapiesMaroc logo" className="navbar-logo-img" />
          </span>
          <span className="navbar-logo-text">
            Therapies<span className="navbar-logo-accent">Maroc</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            end
          >
            Accueil
          </NavLink>
          <NavLink
            to="/therapeutes"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Trouver un thérapeute
          </NavLink>
          
          {user?.role === 'patient' && (
            <NavLink
              to="/patient/dashboard"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              Espace Patient
            </NavLink>
          )}
          
          {user?.role === 'therapist' && (
            <NavLink
              to="/therapeute/dashboard"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              Espace Thérapeute
            </NavLink>
          )}
          
          {user && (
            <NavLink
              to="/messagerie"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              Messagerie
              {notifCount > 0 && (
                <span className="navbar-notif-badge">{notifCount}</span>
              )}
            </NavLink>
          )}
          
          {!user && (
            <a href="#comment-ca-marche" className="navbar-link">Comment ça marche</a>
          )}
        </nav>

        {/* CTA buttons */}
        <div className="navbar-actions">
          {user ? (
            <button
              className="navbar-user-btn"
              onClick={() => setUserMenuOpen(v => !v)}
              aria-expanded={userMenuOpen}
              aria-label="Menu utilisateur"
            >
              <span className="navbar-user-avatar">
                {(user.name || 'U')[0].toUpperCase()}
              </span>
              <Menu size={16} />
            </button>
          ) : (
            <>
              <Link to="/connexion" className="btn btn-outline btn-sm hidden-mobile">
                Connexion
              </Link>
              <Link to="/inscription" className="btn btn-primary btn-sm hidden-mobile">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="navbar-burger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>


    </header>

      {/* Desktop User Drawer */}
      {user && (
        <>
          {userMenuOpen && (
            <div
              className="drawer-backdrop"
              onClick={() => setUserMenuOpen(false)}
            />
          )}
          <div className={`navbar-drawer ${userMenuOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="drawer-header">
              <div className="drawer-header-inner">
                <div className="drawer-avatar">
                  {(user.name || 'U')[0].toUpperCase()}
                </div>
                <div className="drawer-user-info">
                  <span className="drawer-user-name">{user.name || user.email}</span>
                  <span className="drawer-user-role">
                    {user.role === 'therapist' ? 'Thérapeute' : 'Patient'}
                  </span>
                </div>
              </div>
              <button
                className="drawer-close"
                onClick={() => setUserMenuOpen(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="drawer-nav">
              <Link
                to="/reservations"
                className="drawer-item"
                onClick={() => setUserMenuOpen(false)}
                style={{ position: 'relative' }}
              >
                <CalendarCheck size={18} />
                <span>Demandes</span>
                {notifCount > 0 && (
                  <span className="navbar-notif-badge" style={{ position: 'static', marginLeft: 'auto' }}>{notifCount}</span>
                )}
              </Link>
              
              <Link
                to="/messagerie"
                className="drawer-item"
                onClick={() => setUserMenuOpen(false)}
              >
                <MessageSquare size={18} />
                <span>Messagerie</span>
              </Link>

              <Link
                to={user.role?.toLowerCase() === 'therapist' ? "/therapeute/parametres" : "/parametres"}
                className="drawer-item"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={18} />
                <span>Paramètres</span>
              </Link>
            </nav>

            {/* Footer */}
            <div className="drawer-footer">
              <button
                className="drawer-logout"
                onClick={() => { handleLogout(); setUserMenuOpen(false); }}
              >
                <LogOut size={18} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div className="navbar-mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        <nav className="navbar-mobile-nav">
          <NavLink to="/" className="navbar-mobile-link" onClick={() => setMobileOpen(false)} end>
            Accueil
          </NavLink>
          <NavLink to="/therapeutes" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
            Trouver un thérapeute
          </NavLink>
          
          {user?.role === 'patient' && (
            <NavLink to="/patient/dashboard" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              Espace Patient
            </NavLink>
          )}
          
          {user?.role === 'therapist' && (
            <NavLink to="/therapeute/dashboard" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              Espace Thérapeute
            </NavLink>
          )}

          {user && (
            <>
              <NavLink 
                to="/reservations" 
                className="navbar-mobile-link" 
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarCheck size={18} style={{ marginRight: 8, opacity: 0.8 }} />
                  Demandes
                </span>
                {notifCount > 0 && (
                  <span className="navbar-notif-badge" style={{ position: 'static', alignSelf: 'center' }}>{notifCount}</span>
                )}
              </NavLink>

              <NavLink 
                to="/messagerie" 
                className="navbar-mobile-link" 
                onClick={() => setMobileOpen(false)}
              >
                <MessageSquare size={18} style={{ marginRight: 8, opacity: 0.8 }} />
                Messagerie
              </NavLink>

              <NavLink 
                to={user.role?.toLowerCase() === 'therapist' ? "/therapeute/parametres" : "/parametres"} 
                className="navbar-mobile-link" 
                onClick={() => setMobileOpen(false)}
              >
                <Settings size={18} style={{ marginRight: 8, opacity: 0.8 }} />
                Paramètres
              </NavLink>
            </>
          )}

          {!user && (
            <a href="#comment-ca-marche" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              Comment ça marche
            </a>
          )}
          
          <div className="navbar-mobile-actions">
            {user ? (
              <button 
                className="btn btn-outline btn-full" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ff8e8b', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => { handleLogout(); setMobileOpen(false); }}
              >
                <LogOut size={18} /> Se déconnecter
              </button>
            ) : (
              <>
                <Link to="/connexion" className="btn btn-outline btn-full" onClick={() => setMobileOpen(false)}>
                  Connexion
                </Link>
                <Link to="/inscription" className="btn btn-primary btn-full" onClick={() => setMobileOpen(false)}>
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
