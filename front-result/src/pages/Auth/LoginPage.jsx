import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../../image.png';
import './AuthPages.css';

export default function LoginPage() {
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const therapistKeywords = ['pro', 'doc', 'dr', 'therapist', 'therapeute', 'medecin', 'psy'];
    const isTherapist = therapistKeywords.some(kw => email.toLowerCase().includes(kw));
    const role = isTherapist ? 'therapist' : 'patient';
    const name = email.split('@')[0];
    const id   = isTherapist ? 'therapist-demo-1' : 'patient-demo-1';
    login({ email, name, role, id });
    toast.success(`Bienvenue, ${name} !`);
    navigate(role === 'therapist' ? '/therapeute/dashboard' : '/patient/dashboard');
  };

  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-left">
        <div className="auth-left-overlay" />

        <div className="auth-left-inner">
          <Link to="/" className="auth-left-logo">
            <img src={logoImg} alt="TherapiesMaroc logo" className="auth-logo-img" />
          </Link>

          <div className="auth-left-copy">
            <h2>Therapies<span>Maroc</span></h2>
            <p>Retrouvez votre thérapeute,<br />vos séances et vos messages.</p>
          </div>

          <div className="auth-left-footer">
            <span>+200 thérapeutes certifiés</span>
            <span className="auth-left-dot" />
            <span>100 % confidentiel</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-right-inner">

          <div className="auth-form-head">
            <h1>Bon retour</h1>
            <p>Connectez-vous à votre espace personnel</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="label">Adresse e-mail</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email" className="input auth-input-padded"
                  placeholder="vous@exemple.ma"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-pwd-label">
                <label className="label">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="auth-forgot">Mot de passe oublié ?</Link>
              </div>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input auth-input-padded auth-input-pad-right"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required
                />
                <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : (
                <><span>Se connecter</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="auth-switch-link">Créer un compte gratuit</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
