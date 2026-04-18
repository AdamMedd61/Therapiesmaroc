import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Briefcase, Camera, Save, Upload, Calendar, Plus, X as XIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { specialtyList, languageList } from '../../data/therapists';
import './TherapistSettings.css';

const MODES_OPTIONS = [
  { value: 'online', label: 'En ligne (vidéo)' },
  { value: 'cabinet', label: 'En cabinet' },
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Agadir', 'Tanger', 'Meknès', 'Oujda'];

export default function TherapistSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);

  /* ── Personal tab state ── */
  const [personal, setPersonal] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    tel:     user?.tel     || '',
    city:    user?.city    || '',
    address: user?.address || '',
  });

  /* ── Professional tab state ── */
  const [professional, setProfessional] = useState({
    title:      user?.title      || '',
    bio:        user?.bio        || '',
    approach:   user?.approach   || '',
    price:      user?.price      || '',
    specialties: user?.specialties || [],
    languages:   user?.languages  || [],
    modes:       user?.modes      || [],
  });

  /* ── Avatar tab state ── */
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);

  /* ── Planning tab state ── */
  const DAYS = [
    { id: 'lun', label: 'Lundi' },
    { id: 'mar', label: 'Mardi' },
    { id: 'mer', label: 'Mercredi' },
    { id: 'jeu', label: 'Jeudi' },
    { id: 'ven', label: 'Vendredi' },
    { id: 'sam', label: 'Samedi' },
  ];

  const [planning, setPlanning] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {})
  );
  const [newSlot, setNewSlot] = useState({ day: 'lun', time: '' });

  const addSlot = () => {
    if (!newSlot.time) { toast.error('Veuillez choisir une heure.'); return; }
    setPlanning(prev => {
      const existing = prev[newSlot.day] || [];
      if (existing.includes(newSlot.time)) { toast.error('Ce créneau existe déjà.'); return prev; }
      return { ...prev, [newSlot.day]: [...existing, newSlot.time].sort() };
    });
    setNewSlot(s => ({ ...s, time: '' }));
  };

  const removeSlot = (day, time) => {
    setPlanning(prev => ({ ...prev, [day]: prev[day].filter(t => t !== time) }));
  };

  const savePlanning = () => {
    updateUser({ planning });
    toast.success('Planning mis à jour !');
  };

  /* ── Helpers ── */
  const toggleItem = (setter, key, value) => {
    setter(prev => {
      const list = prev[key] || [];
      const next = list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  /* ── Save handlers ── */
  const savePersonal = () => {
    if (!personal.name.trim() || !personal.email.trim()) {
      toast.error('Nom et email sont obligatoires.');
      return;
    }
    updateUser(personal);
    toast.success('Profil personnel mis à jour !');
  };

  const saveProfessional = () => {
    if (!professional.title.trim()) {
      toast.error('Le titre est obligatoire.');
      return;
    }
    updateUser(professional);
    toast.success('Profil professionnel mis à jour !');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveAvatar = () => {
    if (!avatarPreview) {
      toast.error('Veuillez choisir une photo.');
      return;
    }
    updateUser({ avatarUrl: avatarPreview });
    toast.success('Photo de profil mise à jour !');
  };

  const initials = (user?.name || 'T')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tabs = [
    { id: 'personal',      label: 'Profil personnel',      icon: <User size={16} /> },
    { id: 'professional',  label: 'Profil professionnel',  icon: <Briefcase size={16} /> },
    { id: 'avatar',        label: 'Photo de profil',        icon: <Camera size={16} /> },
    { id: 'planning',      label: 'Mon planning',           icon: <Calendar size={16} /> },
  ];

  return (
    <div className="settings-page">
      {/* Hero */}
      <div className="settings-hero">
        <div className="container settings-hero-inner">
          <div>
            <h1>Paramètres du profil</h1>
            <p>Gérez vos informations personnelles et professionnelles</p>
          </div>
          <Link to="/therapeute/dashboard" className="settings-back-btn">
            <ArrowLeft size={16} /> Retour au tableau de bord
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="settings-layout">

          {/* Sidebar navigation */}
          <aside className="settings-sidebar">
            {tabs.map(tab => (
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

          {/* Content panel */}
          <div className="settings-panel" key={activeTab}>

            {/* ── Personal tab ── */}
            {activeTab === 'personal' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Profil personnel</h2>
                  <p>Vos coordonnées de base visibles sur votre compte</p>
                </div>

                <div className="settings-row">
                  <div className="settings-field">
                    <label className="label">Nom complet *</label>
                    <input
                      className="input"
                      value={personal.name}
                      onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))}
                      placeholder="Dr. Prénom Nom"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="label">Adresse e-mail *</label>
                    <input
                      className="input"
                      type="email"
                      value={personal.email}
                      onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
                      placeholder="vous@exemple.ma"
                    />
                  </div>
                </div>

                <div className="settings-row">
                  <div className="settings-field">
                    <label className="label">Téléphone</label>
                    <input
                      className="input"
                      type="tel"
                      value={personal.tel}
                      onChange={e => setPersonal(p => ({ ...p, tel: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                  <div className="settings-field">
                    <label className="label">Ville</label>
                    <select
                      className="input select"
                      value={personal.city}
                      onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))}
                    >
                      <option value="">— Choisir une ville —</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="label">Adresse du cabinet</label>
                  <input
                    className="input"
                    value={personal.address}
                    onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))}
                    placeholder="ex: 14 Bd Anfa, Casablanca"
                  />
                </div>

                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={savePersonal}>
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* ── Professional tab ── */}
            {activeTab === 'professional' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Profil professionnel</h2>
                  <p>Ces informations apparaissent sur votre fiche publique</p>
                </div>

                <div className="settings-row">
                  <div className="settings-field full">
                    <label className="label">Titre professionnel *</label>
                    <input
                      className="input"
                      value={professional.title}
                      onChange={e => setProfessional(p => ({ ...p, title: e.target.value }))}
                      placeholder="ex: Psychologue Clinicienne, Doctorat"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label className="label">Biographie</label>
                  <textarea
                    className="input"
                    rows={5}
                    value={professional.bio}
                    onChange={e => setProfessional(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Décrivez votre parcours, votre approche et ce que vous proposez à vos patients…"
                  />
                </div>

                <div className="settings-field">
                  <label className="label">Approche thérapeutique</label>
                  <input
                    className="input"
                    value={professional.approach}
                    onChange={e => setProfessional(p => ({ ...p, approach: e.target.value }))}
                    placeholder="ex: TCC, EMDR, Pleine conscience…"
                  />
                </div>

                <div className="settings-row">
                  <div className="settings-field">
                    <label className="label">Prix par séance (MAD)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={professional.price}
                      onChange={e => setProfessional(p => ({ ...p, price: e.target.value }))}
                      placeholder="ex: 450"
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label className="label">Spécialités</label>
                  <div className="settings-chips">
                    {specialtyList.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        className={`settings-chip ${professional.specialties.includes(spec) ? 'active' : ''}`}
                        onClick={() => toggleItem(setProfessional, 'specialties', spec)}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <label className="label">Langues</label>
                  <div className="settings-checks">
                    {languageList.map(lang => (
                      <label key={lang} className="settings-check-label">
                        <input
                          type="checkbox"
                          checked={professional.languages.includes(lang)}
                          onChange={() => toggleItem(setProfessional, 'languages', lang)}
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-field">
                  <label className="label">Modes de consultation</label>
                  <div className="settings-checks">
                    {MODES_OPTIONS.map(m => (
                      <label key={m.value} className="settings-check-label">
                        <input
                          type="checkbox"
                          checked={professional.modes.includes(m.value)}
                          onChange={() => toggleItem(setProfessional, 'modes', m.value)}
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={saveProfessional}>
                    <Save size={16} /> Enregistrer
                  </button>
                </div>
              </div>
            )}

            {/* ── Avatar tab ── */}
            {activeTab === 'avatar' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Photo de profil</h2>
                  <p>Visible par les patients sur votre fiche publique</p>
                </div>

                <div className="settings-avatar-wrap">
                  <div className="settings-avatar-preview">
                    {avatarPreview
                      ? <img src={avatarPreview} alt="Aperçu" />
                      : initials
                    }
                  </div>
                  <div className="settings-avatar-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      className="settings-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={15} /> Choisir une photo
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        className="settings-upload-btn"
                        style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                        onClick={() => setAvatarPreview(null)}
                      >
                        Supprimer la photo
                      </button>
                    )}
                    <p>JPG, PNG ou WebP · Max 5 Mo</p>
                  </div>
                </div>

                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={saveAvatar}>
                    <Save size={16} /> Enregistrer la photo
                  </button>
                </div>
              </div>
            )}

            {/* ── Planning tab ── */}
            {activeTab === 'planning' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2>Mon planning</h2>
                  <p>Ajoutez vos créneaux disponibles par jour. Ils apparaissent sur votre fiche publique.</p>
                </div>

                {/* Add slot */}
                <div className="settings-row" style={{ alignItems: 'flex-end' }}>
                  <div className="settings-field">
                    <label className="label">Jour</label>
                    <select
                      className="input select"
                      value={newSlot.day}
                      onChange={e => setNewSlot(s => ({ ...s, day: e.target.value }))}
                    >
                      {DAYS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="settings-field">
                    <label className="label">Heure</label>
                    <input
                      className="input"
                      type="time"
                      value={newSlot.time}
                      onChange={e => setNewSlot(s => ({ ...s, time: e.target.value }))}
                    />
                  </div>
                  <div style={{ paddingBottom: 'var(--space-1)' }}>
                    <button className="btn btn-primary" onClick={addSlot}>
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </div>

                {/* Day-by-day grid */}
                <div className="planning-grid">
                  {DAYS.map(d => (
                    <div key={d.id} className="planning-day-col">
                      <div className="planning-day-header">{d.label}</div>
                      <div className="planning-day-slots">
                        {(planning[d.id] || []).length === 0 ? (
                          <span className="planning-empty">—</span>
                        ) : (
                          (planning[d.id] || []).map(time => (
                            <div key={time} className="planning-slot-chip">
                              {time}
                              <button
                                className="planning-slot-remove"
                                onClick={() => removeSlot(d.id, time)}
                                title="Supprimer"
                              >
                                <XIcon size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="settings-save-bar">
                  <button className="btn btn-primary" onClick={savePlanning}>
                    <Save size={16} /> Enregistrer le planning
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
