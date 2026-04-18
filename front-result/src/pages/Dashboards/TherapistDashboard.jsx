import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Video, MessageSquare, Users, DollarSign, Star, ChevronRight, ChevronLeft, Copy, ClipboardPaste, Plus, X, Pencil, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import './TherapistDashboard.css';

const DURATIONS = ['30 min', '45 min', '50 min', '60 min', '90 min'];
const REASONS = ['Anxiété & stress', 'Dépression', 'TCC', 'EMDR', 'Thérapie de couple', 'Trauma & deuil', 'Suivi régulier', 'Autre'];

function NewBookingModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    clientName: '',
    date: '',
    time: '',
    type: 'online',
    duration: '50 min',
    reason: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.date || !form.time) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    onSave(form);
    toast.success('Séance ajoutée avec succès !');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle séance</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="settings-field">
            <label className="label">Nom du patient *</label>
            <input
              className="input"
              placeholder="ex: Sara L."
              value={form.clientName}
              onChange={e => set('clientName', e.target.value)}
            />
          </div>

          <div className="settings-row">
            <div className="settings-field">
              <label className="label">Date *</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="label">Heure *</label>
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={e => set('time', e.target.value)}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field">
              <label className="label">Type de séance</label>
              <select className="input select" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="online">En ligne (vidéo)</option>
                <option value="cabinet">En cabinet</option>
              </select>
            </div>
            <div className="settings-field">
              <label className="label">Durée</label>
              <select className="input select" value={form.duration} onChange={e => set('duration', e.target.value)}>
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="settings-field">
            <label className="label">Motif</label>
            <select className="input select" value={form.reason} onChange={e => set('reason', e.target.value)}>
              <option value="">— Choisir un motif —</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Ajouter la séance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const upcomingSessions = [
  { id: 's1', clientName: 'Sara L.', time: '14:00', date: 'Aujourd\'hui', duration: '50 min', type: 'online', reason: 'Gestion du stress' },
  { id: 's2', clientName: 'Karim M.', time: '16:30', date: 'Aujourd\'hui', duration: '60 min', type: 'cabinet', reason: 'Thérapie de couple' },
  { id: 's3', clientName: 'Yasmine R.', time: '10:00', date: 'Demain', duration: '50 min', type: 'online', reason: 'Suivi dépression' },
];

const recentClients = [
  { id: 'c1', name: 'Sara L.', lastSession: 'Il y a 2 jours', avatar: 'bg-primary-light text-primary' },
  { id: 'c2', name: 'Karim M.', lastSession: 'Il y a 1 semaine', avatar: 'bg-accent text-white' },
  { id: 'c3', name: 'Yasmine R.', lastSession: 'Il y a 3 jours', avatar: 'bg-gray text-muted' },
  { id: 'c4', name: 'Hassan T.', lastSession: 'Hier', avatar: 'bg-primary text-white' },
];

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [sessions, setSessions] = useState(upcomingSessions);

  /* ── Planning state ── */
  const DAYS = [
    { id: 'lun', label: 'Lundi' },
    { id: 'mar', label: 'Mardi' },
    { id: 'mer', label: 'Mercredi' },
    { id: 'jeu', label: 'Jeudi' },
    { id: 'ven', label: 'Vendredi' },
    { id: 'sam', label: 'Samedi' },
  ];


  const [weekOffset, setWeekOffset] = useState(0);
  const [planningByWeek, setPlanningByWeek] = useState({
    0: DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {})
  });
  const planning = planningByWeek[weekOffset] || DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {});

  // Clipboard: { type: 'day', dayId, slots } | { type: 'week', weeks }
  const [clipboard, setClipboard] = useState(null);

  const copyDay = (dayId) => {
    const slots = planning[dayId] || [];
    if (slots.length === 0) { toast.error('Ce jour est vide, rien à copier.'); return; }
    setClipboard({ type: 'day', dayId, slots: slots.map(s => ({ ...s })) });
    const day = DAYS.find(d => d.id === dayId);
    toast.success(`${day?.label} copié dans le presse-papier !`);
  };

  const copyWeek = () => {
    setClipboard({ type: 'week', week: planning });
    toast.success('Semaine copiée dans le presse-papier !');
  };

  const pasteClipboard = () => {
    if (!clipboard) return;
    if (weekOffset < 0) { toast.error('Impossible de coller dans une semaine passée.'); return; }
    if (clipboard.type === 'day') {
      setPlanning(prev => {
        const existing = prev[clipboard.dayId] || [];
        const newSlots = clipboard.slots
          .filter(s => !existing.some(e => e.startTime === s.startTime))
          .map(s => ({ ...s, id: `sl-${Date.now()}-${Math.random()}` }));
        return {
          ...prev,
          [clipboard.dayId]: [...existing, ...newSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
        };
      });
      const day = DAYS.find(d => d.id === clipboard.dayId);
      toast.success(`${day?.label} collé !`);
    } else {
      setPlanningByWeek(prev => {
        const current = prev[weekOffset] || DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {});
        const merged = { ...current };
        for (const [dayId, slots] of Object.entries(clipboard.week)) {
          const existing = merged[dayId] || [];
          const newSlots = slots
            .filter(s => !existing.some(e => e.startTime === s.startTime))
            .map(s => ({ ...s, id: `sl-${Date.now()}-${Math.random()}` }));
          merged[dayId] = [...existing, ...newSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return { ...prev, [weekOffset]: merged };
      });
      toast.success('Semaine collée !');
    }
  };

  // Paste clipboard contents into a specific day column
  const pasteToDay = (targetDayId) => {
    if (!clipboard) return;
    if (weekOffset < 0) { toast.error('Impossible de coller dans une semaine passée.'); return; }
    const slotsToInsert = clipboard.type === 'day'
      ? clipboard.slots
      : Object.values(clipboard.week).flat();
    setPlanning(prev => {
      const existing = prev[targetDayId] || [];
      const newSlots = slotsToInsert
        .filter(s => !existing.some(e => e.startTime === s.startTime))
        .map(s => ({ ...s, id: `sl-${Date.now()}-${Math.random()}` }));
      if (newSlots.length === 0) {
        toast.error('Tous les créneaux existent déjà dans ce jour.');
        return prev;
      }
      return {
        ...prev,
        [targetDayId]: [...existing, ...newSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    });
    const day = DAYS.find(d => d.id === targetDayId);
    toast.success(`Collé dans ${day?.label} !`);
  };

  const setPlanning = (updater) => {
    setPlanningByWeek(prev => {
        const current = prev[weekOffset] || DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {});
        const next = typeof updater === 'function' ? updater(current) : updater;
        return { ...prev, [weekOffset]: next };
    });
  };

  const copyPreviousWeek = () => {
    setPlanningByWeek(prev => {
        const prevWeek = prev[weekOffset - 1];
        if (!prevWeek) return prev;
        const copied = {};
        for (const [day, slots] of Object.entries(prevWeek)) {
           copied[day] = slots.map(s => ({ ...s, id: `sl-${Date.now()}-${Math.random()}` }));
        }
        return { ...prev, [weekOffset]: copied };
    });
    toast.success('Semaine précédente copiée !');
  };

  const getWeekLabel = (offset) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + (offset * 7));
    const startStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    d.setDate(d.getDate() + 6);
    const endStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `Du ${startStr} au ${endStr}`;
  };
  // 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
  const DAY_INDEX = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6 };
  const isDayInPast = (dayId) => {
    if (weekOffset !== 0) return false; // future weeks are always OK
    const todayJS = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
    const todayIso = todayJS === 0 ? 7 : todayJS; // convert to 1=Mon...7=Sun
    return DAY_INDEX[dayId] < todayIso;
  };

  // ── My services (name + duration + price + mode) ──
  const [myServices, setMyServices] = useState([
    { id: 'srv1', name: 'Consultation individuelle', duration: '55 min', price: 450, mode: 'both' },
    { id: 'srv2', name: 'Thérapie de couple',        duration: '60 min', price: 600, mode: 'both' },
    { id: 'srv3', name: 'Consultation initiale',     duration: '30 min', price: 300, mode: 'online' },
  ]);
  const emptyService = { name: '', duration: '45 min', price: '', mode: 'both' };
  const [addingService, setAddingService] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({});

  const commitAddService = () => {
    if (!newServiceForm.name.trim()) { toast.error('Veuillez saisir un nom de service.'); return; }
    if (!newServiceForm.price || isNaN(Number(newServiceForm.price))) { toast.error('Veuillez saisir un prix valide.'); return; }
    setMyServices(prev => [...prev, { ...newServiceForm, id: `srv-${Date.now()}`, price: Number(newServiceForm.price) }]);
    setNewServiceForm(emptyService);
    setAddingService(false);
    toast.success('Service ajouté !');
  };

  const removeService = (id) => {
    setMyServices(prev => prev.filter(s => s.id !== id));
  };

  const saveServiceEdit = () => {
    if (!editServiceForm.name.trim()) { toast.error('Veuillez saisir un nom.'); return; }
    setMyServices(prev => prev.map(s => s.id === editingServiceId ? { ...editServiceForm, price: Number(editServiceForm.price) } : s));
    setEditingServiceId(null);
    toast.success('Service mis à jour !');
  };

  const emptySlot = { day: 'lun', startTime: '', mode: 'online', serviceIds: [] };
  const [newSlot, setNewSlot] = useState(emptySlot);

  const toggleServiceInSlot = (srvId) => {
    setNewSlot(f => ({
      ...f,
      serviceIds: (f.serviceIds || []).includes(srvId)
        ? f.serviceIds.filter(id => id !== srvId)
        : [...(f.serviceIds || []), srvId]
    }));
  };
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* Lock body scroll when any modal is open */
  useEffect(() => {
    const isOpen = modalOpen || !!editingId;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen, editingId]);

  const addSlot = () => {
    if (!newSlot.startTime) {
      toast.error('Veuillez choisir une heure de début.'); return;
    }
    if (isDayInPast(newSlot.day)) {
      toast.error('Ce jour est déjà passé cette semaine. Choisissez un jour futur ou changez de semaine.');
      return;
    }
    if (!newSlot.serviceIds || newSlot.serviceIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un service pour ce créneau.'); return;
    }
    const existing = planning[newSlot.day] || [];
    if (existing.some(s => s.startTime === newSlot.startTime)) {
      toast.error('Un créneau à cette heure existe déjà ce jour-là.');
      return;
    }
    const slot = { id: `sl-${Date.now()}`, ...newSlot };
    setPlanning(prev => ({
      ...prev,
      [newSlot.day]: [...(prev[newSlot.day] || []), slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
    toast.success('Créneau ajouté !');
  };

  const removeSlot = (day, id) => {
    setPlanning(prev => ({ ...prev, [day]: prev[day].filter(s => s.id !== id) }));
  };

  const startEdit = (slot) => {
    setEditingId(slot.id);
    setEditForm({ ...slot, serviceIds: slot.serviceIds ? [...slot.serviceIds] : [] });
  };

  const saveEdit = (day) => {
    setPlanning(prev => ({
      ...prev,
      [day]: prev[day].map(s => s.id === editingId ? { ...editForm } : s)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
    setEditingId(null);
    toast.success('Créneau mis à jour !');
  };

  const toggleServiceInEdit = (srvId) => {
    setEditForm(f => ({
      ...f,
      serviceIds: (f.serviceIds || []).includes(srvId)
        ? f.serviceIds.filter(id => id !== srvId)
        : [...(f.serviceIds || []), srvId]
    }));
  };

  const addSession = (form) => {
    const dateLabel = new Date(form.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    setSessions(prev => [{
      id: `s${Date.now()}`,
      clientName: form.clientName,
      time: form.time,
      date: dateLabel,
      duration: form.duration,
      type: form.type,
      reason: form.reason || 'Consultation',
    }, ...prev]);
  };

  const displayName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Dr. B.';

  return (
    <div className="dashboard-page">
      {modalOpen && <NewBookingModal onClose={() => setModalOpen(false)} onSave={addSession} />}

      {/* Edit slot modal — rendered at top level for proper backdrop */}
      {editingId && (
        <div className="modal-backdrop" onClick={() => setEditingId(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>Modifier le créneau</h3>
              <button className="modal-close-btn" onClick={() => setEditingId(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">

              {/* Time + Mode */}
              <div className="settings-row">
                <div className="settings-field">
                  <label className="label">Début</label>
                  <input className="input" type="time" value={editForm.startTime} onChange={e => setEditForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div className="settings-field">
                  <label className="label">Mode</label>
                  <select className="input select" value={editForm.mode} onChange={e => setEditForm(f => ({ ...f, mode: e.target.value }))}>
                    <option value="online">En ligne (vidéo)</option>
                    <option value="cabinet">En cabinet</option>
                    <option value="both">Les deux</option>
                  </select>
                </div>
              </div>

              {/* Services offered at this slot */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <label className="label" style={{ marginBottom: 'var(--space-3)' }}>Services proposés à ce créneau</label>
                {myServices.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Aucun service défini.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {myServices.map(srv => {
                      const active = (editForm.serviceIds || []).includes(srv.id);
                      return (
                        <label key={srv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'rgba(35,95,57,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                          <input type="checkbox" checked={active} onChange={() => toggleServiceInEdit(srv.id)} style={{ accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{srv.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{srv.duration} · {srv.price} MAD</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: srv.mode === 'online' ? '#dbeafe' : srv.mode === 'cabinet' ? '#f3f4f6' : '#d4eddf', color: srv.mode === 'online' ? '#1e40af' : srv.mode === 'cabinet' ? '#374151' : '#1a6b3c' }}>
                            {srv.mode === 'online' ? 'Vidéo' : srv.mode === 'cabinet' ? 'Cabinet' : 'Les deux'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={() => saveEdit(editForm.day)}>
                  <Check size={16} /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="t-hero">
        <div className="container animate-fade-in-up">
          <div>
            <h1>Bienvenue, {displayName}</h1>
            <p className="text-muted text-lg">Gérez votre planning et vos patients en toute simplicité.</p>
          </div>
        </div>
      </div>

      <div className="t-tabs-wrapper animate-fade-in-up">
        <div className="t-tabs">
          <button className={`t-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Vue d'ensemble
          </button>
          <button className={`t-tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            <Calendar size={16} /> Consultations
          </button>
          <button className={`t-tab ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>
            <Users size={16} /> Dossiers Patients
          </button>
          <button className={`t-tab ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
            <DollarSign size={16} /> Revenus
          </button>
          <button className={`t-tab ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>
            <Calendar size={16} /> Mon Planning
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--space-20)' }}>
        {activeTab === 'overview' && (
          <div className="animate-fade-in-up">
            
            <div className="t-stats">
              <div className="t-stat-card">
                <div className="t-stat-icon bg-primary-light text-primary"><Calendar size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Aujourd'hui</span>
                  <div><span className="t-stat-value">3</span><span className="t-stat-trend text-green">+1</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-blue-light text-blue"><Users size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Patients Actifs</span>
                  <div><span className="t-stat-value">24</span><span className="t-stat-trend text-green">+3</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-green-light text-green"><DollarSign size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Revenus (Mois)</span>
                  <div><span className="t-stat-value">12.4k</span><span className="t-stat-trend text-green">+8%</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-orange-light text-orange"><Star size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Note Moyenne</span>
                  <div><span className="t-stat-value">4.9</span></div>
                </div>
              </div>
            </div>

            <div className="t-content-grid">
              
              <div className="t-main-col">
                <div className="t-section-title">
                  <h3>Prochaines séances</h3>
                  <button className="btn btn-ghost btn-sm text-primary font-bold" onClick={() => setActiveTab('sessions')}>
                    Voir tout <ChevronRight size={16} />
                  </button>
                </div>

                <div className="t-sessions">
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="t-session-line">
                      <div className="t-session-left">
                        <div className="t-session-time">{session.time}</div>
                        <div className="t-session-client">
                          <h4>{session.clientName}</h4>
                          <p>{session.date} ⬢ {session.reason}</p>
                        </div>
                      </div>
                      <div className="t-session-right">
                        {session.type === 'online' ? (
                          <span className="t-session-badge online"><Video size={12}/> Vidéo ({session.duration})</span>
                        ) : (
                          <span className="t-session-badge cabinet">Cabinet ({session.duration})</span>
                        )}
                        {session.date === 'Aujourd\'hui' && session.type === 'online' && (
                          <button className="btn btn-primary btn-sm ml-2" onClick={() => navigate(`/appel?with=${encodeURIComponent(session.clientName)}&type=${encodeURIComponent(session.reason)}`)}>Lancer</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="t-side-col">
                <div className="t-section-title">
                  <h3>Patients récents</h3>
                </div>
                
                <div className="t-clients">
                  {recentClients.map(client => (
                    <div key={client.id} className="t-client-line">
                      <div className="t-client-info">
                        <div className={`avatar ${client.avatar} font-bold`}>
                          {client.name.substring(0,2)}
                        </div>
                        <div>
                          <h4>{client.name}</h4>
                          <p>Dernière séance: {client.lastSession}</p>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm icon-btn" onClick={() => navigate('/messagerie')} title="Envoyer un message">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Consultations tab ── */}
        {activeTab === 'sessions' && (
          <div className="animate-fade-in-up">
            <div className="t-section-title" style={{ marginBottom: 'var(--space-4)' }}>
              <h3>Toutes les consultations</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="badge badge-primary-light">{sessions.length} à venir</span>
                <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
                  <Plus size={15} /> Nouvelle séance
                </button>
              </div>
            </div>
            <div className="t-sessions">
              {sessions.map(session => (
                <div key={session.id} className="t-session-line">
                  <div className="t-session-left">
                    <div className="t-session-time">{session.time}</div>
                    <div className="t-session-client">
                      <h4>{session.clientName}</h4>
                      <p>{session.date} · {session.reason} · {session.duration}</p>
                    </div>
                  </div>
                  <div className="t-session-right">
                    {session.type === 'online' ? (
                      <span className="t-session-badge online"><Video size={12}/> Vidéo</span>
                    ) : (
                      <span className="t-session-badge cabinet">Cabinet</span>
                    )}
                    {session.type === 'online' && (
                      <button className="btn btn-primary btn-sm ml-2" onClick={() => navigate(`/appel?with=${encodeURIComponent(session.clientName)}&type=${encodeURIComponent(session.reason)}`)}>Lancer</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="t-section-title" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
              <h3>Séances passées</h3>
            </div>
            <div className="t-sessions">
              {[
                { id: 'p1', clientName: 'Hassan T.', time: '11:00', date: 'Hier', duration: '50 min', type: 'cabinet', reason: 'TCC' },
                { id: 'p2', clientName: 'Nadia B.', time: '09:30', date: 'Lundi', duration: '60 min', type: 'online', reason: 'Anxiété' },
              ].map(session => (
                <div key={session.id} className="t-session-line" style={{ opacity: 0.7 }}>
                  <div className="t-session-left">
                    <div className="t-session-time" style={{ color: 'var(--color-text-muted)' }}>{session.time}</div>
                    <div className="t-session-client">
                      <h4>{session.clientName}</h4>
                      <p>{session.date} · {session.reason} · {session.duration}</p>
                    </div>
                  </div>
                  <div className="t-session-right">
                    <span className="badge badge-outline">Terminée</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dossiers Patients tab ── */}
        {activeTab === 'clients' && (
          <div className="animate-fade-in-up">
            <div className="t-section-title" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Dossiers patients</h3>
              <span className="badge badge-primary-light" style={{ fontSize: 13, padding: '5px 14px' }}>24 actifs</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'c1', name: 'Sara L.',     initials: 'SL', lastSession: 'Il y a 2 jours',   sessions: 8,  status: 'Actif',    color: '#1a6b3c', bg: '#d4eddf' },
                { id: 'c2', name: 'Karim M.',    initials: 'KM', lastSession: 'Il y a 1 semaine', sessions: 14, status: 'Actif',    color: '#1a6b3c', bg: '#d4eddf' },
                { id: 'c3', name: 'Yasmine R.',  initials: 'YR', lastSession: 'Il y a 3 jours',   sessions: 5,  status: 'Actif',    color: '#1a6b3c', bg: '#d4eddf' },
                { id: 'c4', name: 'Hassan T.',   initials: 'HT', lastSession: 'Hier',             sessions: 22, status: 'Actif',    color: '#1a6b3c', bg: '#d4eddf' },
                { id: 'c5', name: 'Nadia B.',    initials: 'NB', lastSession: 'Il y a 5 jours',   sessions: 3,  status: 'Nouveau',  color: '#92400e', bg: '#fef3c7' },
              ].map(client => (
                <div key={client.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                  cursor: 'default',
                  gap: 16,
                }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--color-primary-light, #7fbf9a)'; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: client.bg,
                    color: client.color,
                    fontWeight: 800,
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    letterSpacing: '0.02em',
                  }}>
                    {client.initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 3 }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>Dernière séance : {client.lastSession}</span>
                      <span style={{ color: 'var(--color-border)' }}>·</span>
                      <span>{client.sessions} séances au total</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: client.bg,
                      color: client.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {client.status}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate('/messagerie')}
                      title="Envoyer un message"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
                    >
                      <MessageSquare size={15} />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Revenus tab ── */}
        {activeTab === 'earnings' && (
          <div className="animate-fade-in-up">

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: <DollarSign size={22} />, label: 'Ce mois', value: '12 400', unit: 'MAD', trend: '+8%', trendUp: true,  iconBg: '#d1fae5', iconColor: '#065f46' },
                { icon: <Calendar size={22} />,    label: 'Cette semaine', value: '3 200',  unit: 'MAD', trend: null,   trendUp: null,  iconBg: '#dbeafe', iconColor: '#1e40af' },
                { icon: <Star size={22} />,        label: 'Séances ce mois', value: '31',  unit: '',    trend: '+4',   trendUp: true,  iconBg: '#fef3c7', iconColor: '#92400e' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: stat.iconBg, color: stat.iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      {stat.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{stat.value}</span>
                      {stat.unit && <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>{stat.unit}</span>}
                      {stat.trend && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: stat.trendUp ? '#059669' : '#dc2626', background: stat.trendUp ? '#d1fae5' : '#fee2e2', padding: '2px 7px', borderRadius: 999 }}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment list */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Détail des paiements</h3>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>5 transactions récentes</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { client: 'Sara L.',    initials: 'SL', date: "Aujourd'hui", amount: 450, mode: 'online'  },
                { client: 'Karim M.',   initials: 'KM', date: "Aujourd'hui", amount: 400, mode: 'cabinet' },
                { client: 'Yasmine R.', initials: 'YR', date: 'Demain',      amount: 450, mode: 'online'  },
                { client: 'Hassan T.',  initials: 'HT', date: 'Hier',        amount: 400, mode: 'cabinet' },
                { client: 'Nadia B.',   initials: 'NB', date: 'Lundi',       amount: 450, mode: 'online'  },
              ].map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: '14px 20px',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#d4eddf', color: '#1a6b3c',
                    fontWeight: 800, fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {p.initials}
                  </div>

                  {/* Client info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', marginBottom: 2 }}>{p.client}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.date}</div>
                  </div>

                  {/* Mode badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 999,
                    background: p.mode === 'online' ? '#dbeafe' : '#f3f4f6',
                    color:      p.mode === 'online' ? '#1e40af' : '#374151',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {p.mode === 'online' ? 'Vidéo' : 'Cabinet'}
                  </span>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{p.amount}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 4 }}>MAD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── Planning tab ── */}
        {activeTab === 'planning' && (
          <div className="animate-fade-in-up">


            <div className="t-section-title" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h3>Mes créneaux disponibles</h3>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  Cliquez sur un créneau pour le modifier
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {/* Copy week */}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={copyWeek}
                  title="Copier toute la semaine"
                  style={{ gap: 6 }}
                >
                  <Copy size={14} /> Copier semaine
                </button>

                {/* Paste week — always shown when clipboard has content and week is editable */}
                {clipboard && weekOffset >= 0 && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={pasteClipboard}
                    title="Coller dans cette semaine"
                    style={{ gap: 6 }}
                  >
                    <ClipboardPaste size={14} /> Coller ici
                  </button>
                )}

                <button className="btn btn-outline btn-sm icon-btn" onClick={() => setWeekOffset(o => o - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontWeight: 600, width: 220, textAlign: 'center', fontSize: '15px' }}>{getWeekLabel(weekOffset)}</span>
                <button className="btn btn-outline btn-sm icon-btn" onClick={() => setWeekOffset(o => o + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Paste banner */}
                {clipboard && (
              <div style={{ marginBottom: 'var(--space-4)', padding: '12px 18px', background: 'var(--color-primary-muted, rgba(35,95,57,0.08))', border: '1.5px solid var(--color-primary)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ClipboardPaste size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                    {clipboard.type === 'day'
                      ? `Presse-papier : ${DAYS.find(d => d.id === clipboard.dayId)?.label} (${clipboard.slots.length} créneau${clipboard.slots.length > 1 ? 'x' : ''})`
                      : 'Presse-papier : semaine complète'
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {weekOffset >= 0 && (
                    <button className="btn btn-primary btn-sm" onClick={pasteClipboard}>
                      <ClipboardPaste size={13} /> Coller ici
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setClipboard(null)}>
                    Effacer
                  </button>
                </div>
              </div>
            )}

            {/* Empty week CTA */}
            {weekOffset >= 0 && Object.values(planning).every(day => day.length === 0) && planningByWeek[weekOffset - 1] && Object.values(planningByWeek[weekOffset - 1]).some(day => day.length > 0) && (
              <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>C'est vide par ici ! Copier les horaires de la semaine précédente ?</span>
                <button className="btn btn-primary btn-sm" onClick={copyPreviousWeek}>
                  <Copy size={14} /> Dupliquer semaine précédente
                </button>
              </div>
            )}

            {/* ── Mes Services ── */}
            <div className="planning-add-card" style={{ marginBottom: 20 }}>
              <div className="pac-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                <div className="pac-header-icon"><Star size={18} /></div>
                <div className="pac-header-text">
                  <h4>Mes Services</h4>
                  <p>Définissez vos types de consultation, durées et tarifs</p>
                </div>
              </div>
              <div className="pac-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myServices.map(srv => (
                    <div key={srv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--color-surface-hover)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                      {editingServiceId === srv.id ? (
                        <>
                          <input className="input" style={{ flex: 2, minWidth: 0 }} value={editServiceForm.name} onChange={e => setEditServiceForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du service" autoFocus />
                          <select className="input" style={{ width: 100 }} value={editServiceForm.duration} onChange={e => setEditServiceForm(f => ({ ...f, duration: e.target.value }))}>
                            {['30 min','45 min','50 min','55 min','60 min','90 min'].map(d => <option key={d}>{d}</option>)}
                          </select>
                          <input className="input" style={{ width: 90 }} type="number" min="0" value={editServiceForm.price} onChange={e => setEditServiceForm(f => ({ ...f, price: e.target.value }))} placeholder="Prix" />
                          <select className="input" style={{ width: 120 }} value={editServiceForm.mode} onChange={e => setEditServiceForm(f => ({ ...f, mode: e.target.value }))}>
                            <option value="both">Les deux</option>
                            <option value="online">Vidéo</option>
                            <option value="cabinet">Cabinet</option>
                          </select>
                          <button className="btn btn-primary btn-sm" onClick={saveServiceEdit} style={{ gap: 4 }}><Check size={14} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditingServiceId(null)}><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{srv.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{srv.duration} · {srv.price} MAD</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: srv.mode === 'online' ? '#dbeafe' : srv.mode === 'cabinet' ? '#f3f4f6' : '#d4eddf', color: srv.mode === 'online' ? '#1e40af' : srv.mode === 'cabinet' ? '#374151' : '#1a6b3c' }}>
                            {srv.mode === 'online' ? 'Vidéo' : srv.mode === 'cabinet' ? 'Cabinet' : 'Les deux'}
                          </span>
                          <button className="btn btn-ghost btn-sm icon-btn" onClick={() => { setEditingServiceId(srv.id); setEditServiceForm({ ...srv }); }} title="Modifier"><Pencil size={14} /></button>
                          <button className="btn btn-ghost btn-sm icon-btn" onClick={() => removeService(srv.id)} title="Supprimer"><X size={14} /></button>
                        </>
                      )}
                    </div>
                  ))}
                  {myServices.length === 0 && !addingService && (
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Aucun service défini. Ajoutez votre premier service ci-dessous.</p>
                  )}
                </div>

                {addingService ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '12px 14px', background: 'rgba(35,95,57,0.04)', borderRadius: 10, border: '1.5px dashed var(--color-primary)', flexWrap: 'wrap' }}>
                    <input className="input" style={{ flex: 2, minWidth: 160 }} value={newServiceForm.name} onChange={e => setNewServiceForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom (ex : Thérapie de couple)" autoFocus />
                    <select className="input" style={{ width: 100 }} value={newServiceForm.duration} onChange={e => setNewServiceForm(f => ({ ...f, duration: e.target.value }))}>
                      {['30 min','45 min','50 min','55 min','60 min','90 min'].map(d => <option key={d}>{d}</option>)}
                    </select>
                    <input className="input" style={{ width: 90 }} type="number" min="0" value={newServiceForm.price} onChange={e => setNewServiceForm(f => ({ ...f, price: e.target.value }))} placeholder="Prix MAD" />
                    <select className="input" style={{ width: 120 }} value={newServiceForm.mode} onChange={e => setNewServiceForm(f => ({ ...f, mode: e.target.value }))}>
                      <option value="both">Les deux</option>
                      <option value="online">Vidéo</option>
                      <option value="cabinet">Cabinet</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={commitAddService} style={{ gap: 6 }}><Check size={14} /> Ajouter</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setAddingService(false); setNewServiceForm(emptyService); }}><X size={14} /></button>
                  </div>
                ) : (
                  <button className="pac-add-dur-btn" style={{ marginTop: 12 }} onClick={() => setAddingService(true)}>
                    <Plus size={14} /> Ajouter un service
                  </button>
                )}
              </div>
            </div>

            {/* ── Add slot form ── */}
            {weekOffset >= 0 ? (
              <div className="planning-add-card">

                {/* Green header */}
                <div className="pac-header">
                  <div className="pac-header-icon"><Plus size={18} /></div>
                  <div className="pac-header-text">
                    <h4>Ajouter un créneau</h4>
                    <p>Configurez votre disponibilité pour cette semaine</p>
                  </div>
                </div>

                {/* Body */}
                <div className="pac-body">

                  {/* Section 1 — Basic info */}
                  <div className="pac-section">
                    <p className="pac-section-label">Informations du créneau</p>
                    <div className="pac-fields-row">
                      <div className="pac-field">
                        <label className="pac-field-label">Jour</label>
                        <select className="input" value={newSlot.day} onChange={e => setNewSlot(s => ({ ...s, day: e.target.value }))}>
                          {DAYS.map(d => {
                            const past = isDayInPast(d.id);
                            return (
                              <option key={d.id} value={d.id} disabled={past}>
                                {d.label}{past ? ' (passé)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="pac-field">
                        <label className="pac-field-label">Heure de début</label>
                        <input className="input" type="time" value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))} />
                      </div>

                      <div className="pac-field">
                        <label className="pac-field-label">Mode de consultation</label>
                        <select className="input" value={newSlot.mode} onChange={e => setNewSlot(s => ({ ...s, mode: e.target.value }))}>
                        <option value="online">En ligne (vidéo)</option>
                          <option value="cabinet">En cabinet</option>
                          <option value="both">Les deux</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2 — Services */}
                  <div className="pac-section">
                    <p className="pac-section-label">Services proposés à ce créneau</p>
                    {myServices.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Aucun service défini. Ajoutez des services dans la section ci-dessus.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {myServices.map(srv => {
                          const active = (newSlot.serviceIds || []).includes(srv.id);
                          return (
                            <label key={srv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`, background: active ? 'rgba(35,95,57,0.05)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                              <input type="checkbox" checked={active} onChange={() => toggleServiceInSlot(srv.id)} style={{ accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{srv.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{srv.duration} · {srv.price} MAD</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: srv.mode === 'online' ? '#dbeafe' : srv.mode === 'cabinet' ? '#f3f4f6' : '#d4eddf', color: srv.mode === 'online' ? '#1e40af' : srv.mode === 'cabinet' ? '#374151' : '#1a6b3c' }}>
                                {srv.mode === 'online' ? 'Vidéo' : srv.mode === 'cabinet' ? 'Cabinet' : 'Les deux'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pac-footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => setNewSlot(emptySlot)}>
                    Réinitialiser
                  </button>
                  <button className="btn btn-primary" onClick={addSlot} style={{ padding: '0 28px', height: 44, fontSize: 14 }}>
                    <Plus size={16} /> Ajouter ce créneau
                  </button>
                </div>
              </div>
            ) : (
              <div className="planning-add-card" style={{ opacity: 0.6, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
                <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  Vous consultez une semaine passée. L'édition est verrouillée.
                </p>
              </div>
            )}

            {/* ── Day columns ── */}
            <div className="planning-grid">
              {DAYS.map(d => (
                <div key={d.id} className="planning-day-col">
                  <div className="planning-day-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
                    <span>{d.label}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {/* Paste into this day — only when clipboard is active and week is editable */}
                      {clipboard && weekOffset >= 0 && (
                        <button
                          onClick={() => pasteToDay(d.id)}
                          title={`Coller dans ${d.label}`}
                          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: '3px 5px', borderRadius: 4, transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                          <ClipboardPaste size={11} />
                        </button>
                      )}
                      {/* Copy this day */}
                      <button
                        onClick={() => copyDay(d.id)}
                        title={`Copier ${d.label}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 4, transition: 'color 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="planning-day-slots">
                    {(planning[d.id] || []).length === 0 ? (
                      <span className="planning-empty">Aucun créneau</span>
                    ) : (
                      (planning[d.id] || []).map(slot => (
                        <div key={slot.id} className="planning-slot-chip">
                          <button
                            className="planning-chip-label"
                            onClick={weekOffset >= 0 ? () => startEdit(slot) : undefined}
                            title={weekOffset >= 0 ? "Cliquer pour modifier" : ""}
                            style={{ cursor: weekOffset < 0 ? 'default' : 'pointer' }}
                          >
                            {slot.startTime}
                          </button>
                          {weekOffset >= 0 && (
                            <button
                              className="planning-slot-remove"
                              onClick={() => removeSlot(d.id, slot.id)}
                              title="Supprimer"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
