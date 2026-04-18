import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Lock, Bell, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './TherapistSettings.css';

const TABS = [
  { id: 'personal',      label: 'Informations personnelles', icon: <User size={16} /> },
  { id: 'security',      label: 'Sécurité',                 icon: <Lock size={16} /> },
  { id: 'notifications', label: 'Notifications',            icon: <Bell size={16} /> },
];

export default function PatientSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  /* ── Personal ── */
  const [personal, setPersonal] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    tel:   user?.tel   || '',
    city:  user?.city  || '',
  });

  /* ── Security ── */
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState({
    emailConfirmation: true,
    emailReminder:     true,
    emailNewMessage:   true,
    smsReminder:       false,
  });

  const savePersonal = () => toast.success('Informations mises à jour !');

  const savePassword = () => {
    if (!security.currentPassword) { toast.error('Veuillez saisir votre mot de passe actuel.'); return; }
    if (security.newPassword.length < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (security.newPassword !== security.confirmPassword) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    toast.success('Mot de passe mis à jour !');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const saveNotifs = () => toast.success('Préférences enregistrées !');

  return (
    <div className="settings-page">
      <div className="container">

        <Link to="/patient/dashboard" className="settings-back-btn" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>

        <div className="settings-layout">

          {/* ── Sidebar ── */}
          <aside className="settings-sidebar">
            {/* Profile card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-2)', gap: 'var(--space-2)' }}>
              <div className="settings-avatar-preview" style={{ width: 64, height: 64, fontSize: 26 }}>
                {(user?.name || 'P')[0].toUpperCase()}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--color-text)' }}>{user?.name || 'Patient'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Patient</p>
              </div>
            </div>

            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          {/* ── Content ── */}
          <div className="settings-panel">

            {/* Personal */}
            {activeTab === 'personal' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Informations personnelles</h2>
                  <p>Gérez vos informations de profil</p>
                </div>
                <div className="settings-row">
                  <div className="settings-field">
                    <label className="label">Nom complet</label>
                    <input className="input" value={personal.name} onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))} placeholder="Votre nom" />
                  </div>
                  <div className="settings-field">
                    <label className="label">Adresse e-mail</label>
                    <input className="input" type="email" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} placeholder="votre@email.com" />
                  </div>
                </div>
                <div className="settings-row">
                  <div className="settings-field">
                    <label className="label">Téléphone</label>
                    <input className="input" type="tel" value={personal.tel} onChange={e => setPersonal(p => ({ ...p, tel: e.target.value }))} placeholder="+212 6XX XXX XXX" />
                  </div>
                  <div className="settings-field">
                    <label className="label">Ville</label>
                    <input className="input" value={personal.city} onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))} placeholder="Casablanca" />
                  </div>
                </div>
                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={savePersonal}>
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Sécurité</h2>
                  <p>Modifiez votre mot de passe</p>
                </div>
                <div className="settings-field" style={{ maxWidth: 440 }}>
                  <label className="label">Mot de passe actuel</label>
                  <input className="input" type="password" value={security.currentPassword} onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="settings-field" style={{ maxWidth: 440 }}>
                  <label className="label">Nouveau mot de passe</label>
                  <input className="input" type="password" value={security.newPassword} onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="settings-field" style={{ maxWidth: 440 }}>
                  <label className="label">Confirmer le nouveau mot de passe</label>
                  <input className="input" type="password" value={security.confirmPassword} onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={savePassword}>
                    <Save size={16} /> Mettre à jour
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Notifications</h2>
                  <p>Choisissez comment vous souhaitez être notifié</p>
                </div>

                {[
                  { key: 'emailConfirmation', label: 'Confirmation de réservation',  sub: "Recevoir un e-mail lors de la confirmation d'une séance" },
                  { key: 'emailReminder',     label: 'Rappel de séance',             sub: 'Recevoir un rappel 24h avant chaque séance' },
                  { key: 'emailNewMessage',   label: 'Nouveau message',              sub: "Être notifié par e-mail lors d'un nouveau message" },
                  { key: 'smsReminder',       label: 'Rappel par SMS',               sub: 'Recevoir un SMS de rappel avant chaque séance' },
                ].map(({ key, label, sub }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>{label}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>
                    </div>
                    {/* Toggle switch */}
                    <div
                      onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 999, flexShrink: 0, cursor: 'pointer',
                        background: notifs[key] ? 'var(--color-primary)' : 'var(--color-border)',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 3,
                        left: notifs[key] ? 23 : 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </div>
                ))}

                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={saveNotifs}>
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
