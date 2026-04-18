import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Phone, MapPin } from 'lucide-react';
import * as authService from '../../services/auth';
import logoImg from '../../../image.png';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', tel: '', password: '', cin: '' });
  const [wantsCabinet, setWantsCabinet] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.prenom) {
      toast.error('Veuillez remplir tous les champs obligatoires.'); return;
    }
    if (wantsCabinet && (!form.cin || !/^[A-Za-z0-9]{6,10}$/.test(form.cin.trim()))) {
      toast.error('Veuillez entrer un numéro CIN valide (6 à 10 caractères).'); return;
    }
    setLoading(true);
    try {
      const userData = {
        name: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        password: form.password,
        role: 'patient',
        CIN: form.cin || null,
        location: null,
      };
      
      const response = await authService.register(userData);
      toast.success('Compte créé avec succès ! Bienvenue sur TherapiesMaroc.');
      navigate('/connexion');
    } catch (err) {
      toast.error('Erreur lors de la création du compte. Vérifiez vos informations.');
    } finally {
      setLoading(false);
    }
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
            <p>Rejoignez des milliers de personnes<br />qui prennent soin de leur santé mentale.</p>
          </div>
          <div className="auth-left-footer">
            <span>+5 000 patients accompagnés</span>
            <span className="auth-left-dot" />
            <span>Note moyenne 4.9 / 5</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-right-inner" style={{ maxWidth: 500 }}>

          <div className="auth-form-head">
            <h1>Créer un compte</h1>
            <p>Gratuit et sans engagement</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-row">
              <div className="auth-field">
                <label className="label">Prénom <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input type="text" className="input auth-input-padded" placeholder="Prénom"
                    value={form.prenom} onChange={set('prenom')} autoComplete="given-name" required />
                </div>
              </div>
              <div className="auth-field">
                <label className="label">Nom</label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input type="text" className="input auth-input-padded" placeholder="Nom"
                    value={form.nom} onChange={set('nom')} autoComplete="family-name" />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label className="label">Adresse e-mail <span className="auth-required">*</span></label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input type="email" className="input auth-input-padded" placeholder="vous@exemple.ma"
                  value={form.email} onChange={set('email')} autoComplete="email" required />
              </div>
            </div>

            <div className="auth-field">
              <label className="label">Téléphone <span className="auth-optional">(facultatif)</span></label>
              <div className="auth-input-wrap">
                <Phone size={15} className="auth-input-icon" />
                <input type="tel" className="input auth-input-padded" placeholder="+212 6XX XXX XXX"
                  value={form.tel} onChange={set('tel')} autoComplete="tel" />
              </div>
            </div>

            {/* Cabinet toggle */}
            <button
              type="button"
              className={`cabinet-toggle-btn ${wantsCabinet ? 'active' : ''}`}
              onClick={() => setWantsCabinet(v => !v)}
            >
              <span className="cabinet-toggle-icon"><MapPin size={15} /></span>
              <span className="cabinet-toggle-label">
                <strong>Consultation en cabinet</strong>
                <small>Je souhaite consulter en personne</small>
              </span>
              <span className={`cabinet-toggle-pill ${wantsCabinet ? 'active' : ''}`}>
                {wantsCabinet ? 'Activé' : 'Désactivé'}
              </span>
            </button>

            {wantsCabinet && (
              <div className="auth-field auth-cin-field">
                <label className="label">Numéro CIN <span className="auth-required">*</span></label>
                <input type="text" className="input" placeholder="ex: AB123456"
                  value={form.cin} onChange={set('cin')} maxLength={10} autoComplete="off" required />
                <span className="auth-field-hint">Requis pour les consultations en cabinet.</span>
              </div>
            )}

            <div className="auth-field">
              <label className="label">Mot de passe <span className="auth-required">*</span></label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input auth-input-padded auth-input-pad-right"
                  placeholder="8 caractères minimum"
                  value={form.password} onChange={set('password')}
                  autoComplete="new-password" required
                />
                <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p className="auth-terms">
              En créant un compte, vous acceptez nos{' '}
              <a href="#">Conditions d'utilisation</a> et notre <a href="#">Politique de confidentialité</a>.
            </p>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : (
                <><span>Créer mon compte</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <p className="auth-switch">
            Déjà inscrit(e) ?{' '}
            <Link to="/connexion" className="auth-switch-link">Se connecter</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
