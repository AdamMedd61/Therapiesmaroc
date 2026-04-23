import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Video, MessageSquare, Users, DollarSign, Star, ChevronRight, ChevronLeft, Copy, ClipboardPaste, Plus, X, Pencil, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import * as scheduleApi from '../../services/schedule';
import * as serviceApi from '../../services/serviceApi';
import api from '../../services/api';
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

const upcomingSessions = [];

const recentClients = [];

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [sessions, setSessions] = useState(upcomingSessions);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  // ── Stats ──
  const [stats, setStats] = useState({ sessions_this_month: 0, active_patients: 0, revenue_this_month: 0, avg_rating: null });
  useEffect(() => {
    api.get('/therapist/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
    // Load paid requests on mount for overview tab
    api.get('/requests')
      .then(res => setPaidRequests((res.data || []).filter(r => r.status === 'paid')))
      .catch(() => {});
  }, []);

  // ── Cancel session handler ──
  const cancelSession = async (reqId) => {
    if (!window.confirm('Annuler cette séance ? Cette action est irréversible.')) return;
    try {
      await api.post(`/requests/${reqId}/cancel`);
      setPaidRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de l\'annulation.';
      alert(msg);
    }
  };

  // ── Paid requests (consultations tab) + payments (revenus tab) ──
  const [paidRequests, setPaidRequests] = useState([]);
  const [paidReqLoading, setPaidReqLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sessions' && paidRequests.length === 0) {
      setPaidReqLoading(true);
      api.get('/requests')
        .then(res => setPaidRequests((res.data || []).filter(r => r.status === 'paid')))
        .catch(() => {})
        .finally(() => setPaidReqLoading(false));
    }
    if (activeTab === 'earnings' && payments.length === 0) {
      setPaymentsLoading(true);
      api.get('/payments')
        .then(res => setPayments(res.data || []))
        .catch(() => {})
        .finally(() => setPaymentsLoading(false));
    }
  }, [activeTab]);

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

  // ── Load schedules from API on mount ──
  useEffect(() => {
    setScheduleLoading(true);
    scheduleApi.getMySchedule()
      .then(slots => {
        const byWeek = {};
        slots.forEach(slot => {
          const wo = slot.weekOffset ?? 0;
          if (!byWeek[wo]) byWeek[wo] = DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {});
          byWeek[wo][slot.day] = [...(byWeek[wo][slot.day] || []), slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });
        if (Object.keys(byWeek).length === 0) byWeek[0] = DAYS.reduce((acc, d) => ({ ...acc, [d.id]: [] }), {});
        setPlanningByWeek(byWeek);
      })
      .catch(() => toast.error('Impossible de charger le planning.'))
      .finally(() => setScheduleLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [myServices, setMyServices] = useState([]);
  const emptyService = { name: '', duration: '45 min', price: '', mode: 'both' };
  const [addingService, setAddingService] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({});

  // Load services from API on mount
  useEffect(() => {
    setServicesLoading(true);
    serviceApi.getMyServices()
      .then(data => setMyServices(data.map(s => ({ ...s, id: String(s.id) }))))
      .catch(() => toast.error('Impossible de charger les services.'))
      .finally(() => setServicesLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitAddService = async () => {
    if (!newServiceForm.name.trim()) { toast.error('Veuillez saisir un nom de service.'); return; }
    if (!newServiceForm.price || isNaN(Number(newServiceForm.price))) { toast.error('Veuillez saisir un prix valide.'); return; }
    try {
      const created = await serviceApi.createService({
        name: newServiceForm.name,
        duration: newServiceForm.duration,
        price: Number(newServiceForm.price),
        mode: newServiceForm.mode,
      });
      setMyServices(prev => [...prev, { ...created, id: String(created.id) }]);
      setNewServiceForm(emptyService);
      setAddingService(false);
      toast.success('Service ajouté !');
    } catch {
      toast.error('Erreur lors de la création du service.');
    }
  };

  const removeService = async (id) => {
    try {
      await serviceApi.deleteService(id);
      setMyServices(prev => prev.filter(s => s.id !== id));
      toast.success('Service supprimé.');
    } catch {
      toast.error('Erreur lors de la suppression du service.');
    }
  };

  const saveServiceEdit = async () => {
    if (!editServiceForm.name.trim()) { toast.error('Veuillez saisir un nom.'); return; }
    try {
      const updated = await serviceApi.updateService(editingServiceId, {
        name: editServiceForm.name,
        duration: editServiceForm.duration,
        price: Number(editServiceForm.price),
        mode: editServiceForm.mode,
      });
      setMyServices(prev => prev.map(s => s.id === editingServiceId ? { ...updated, id: String(updated.id) } : s));
      setEditingServiceId(null);
      toast.success('Service mis à jour !');
    } catch {
      toast.error('Erreur lors de la mise à jour du service.');
    }
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

  const addSlot = async () => {
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
    try {
      const created = await scheduleApi.createSlot({
        day: newSlot.day,
        week_offset: weekOffset,
        start_time: newSlot.startTime,
        mode: newSlot.mode,
        service_ids: newSlot.serviceIds,
      });
      const slot = { id: String(created.id), day: newSlot.day, startTime: newSlot.startTime, mode: newSlot.mode, serviceIds: newSlot.serviceIds, weekOffset };
      setPlanning(prev => ({
        ...prev,
        [newSlot.day]: [...(prev[newSlot.day] || []), slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
      }));
      toast.success('Créneau ajouté !');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la création du créneau.';
      toast.error(msg);
    }
  };

  const removeSlot = async (day, id) => {
    try {
      await scheduleApi.deleteSlot(id);
      setPlanning(prev => ({ ...prev, [day]: prev[day].filter(s => s.id !== id) }));
      toast.success('Créneau supprimé.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la suppression.';
      toast.error(msg);
    }
  };

  const startEdit = (slot) => {
    setEditingId(slot.id);
    setEditForm({ ...slot, serviceIds: slot.serviceIds ? [...slot.serviceIds] : [] });
  };

  const saveEdit = async (day) => {
    try {
      await scheduleApi.updateSlot(editingId, {
        day,
        week_offset: weekOffset,
        start_time: editForm.startTime,
        mode: editForm.mode,
        service_ids: editForm.serviceIds,
      });
      setPlanning(prev => ({
        ...prev,
        [day]: prev[day].map(s => s.id === editingId ? { ...editForm } : s)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
      }));
      setEditingId(null);
      toast.success('Créneau mis à jour !');
    } catch {
      toast.error('Erreur lors de la mise à jour du créneau.');
    }
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
                  <span className="t-stat-label">Séances ce mois</span>
                  <div><span className="t-stat-value">{stats.sessions_this_month}</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-blue-light text-blue"><Users size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Patients Actifs</span>
                  <div><span className="t-stat-value">{stats.active_patients}</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-green-light text-green"><DollarSign size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Revenus (Mois)</span>
                  <div><span className="t-stat-value">{stats.revenue_this_month.toFixed(2)} €</span></div>
                </div>
              </div>
              <div className="t-stat-card">
                <div className="t-stat-icon bg-orange-light text-orange"><Star size={24} /></div>
                <div className="t-stat-info">
                  <span className="t-stat-label">Note Moyenne</span>
                  <div><span className="t-stat-value">{stats.avg_rating ?? '—'}</span></div>
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
                  {(() => {
                    const upcoming = paidRequests
                      .filter(req => req.schedule?.session_date && new Date(req.schedule.session_date) >= new Date())
                      .sort((a, b) => new Date(a.schedule.session_date) - new Date(b.schedule.session_date))
                      .slice(0, 4);
                    return upcoming.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>Aucune séance planifiée</p>
                        <p style={{ fontSize: 13 }}>Vos prochaines consultations apparaîtront ici.</p>
                      </div>
                    ) : upcoming.map(req => {
                      const date = new Date(req.schedule.session_date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div key={req.id} className="t-session-line">
                          <div className="t-session-left">
                            <div className="t-session-time">{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="t-session-client">
                              <h4>{req.client?.user?.name || 'Patient'}</h4>
                              <p>{isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} ⋄ {req.service?.name || 'Consultation'}</p>
                            </div>
                          </div>
                          <div className="t-session-right">
                            {req.schedule?.mode === 'online'
                              ? <span className="t-session-badge online"><Video size={12}/> Vidéo</span>
                              : <span className="t-session-badge cabinet">Cabinet</span>
                            }
                            {(() => {
                              const hoursUntil = (new Date(req.schedule?.session_date) - new Date()) / 36e5;
                              const locked = hoursUntil < 48;
                              return (
                                <button
                                  className="btn btn-sm ml-2"
                                  style={{ background: locked ? '#f3f4f6' : '#fee2e2', color: locked ? '#9ca3af' : '#dc2626', border: '1px solid', borderColor: locked ? '#e5e7eb' : '#fca5a5', cursor: locked ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                                  disabled={locked}
                                  title={locked ? 'Annulation impossible moins de 48h avant la séance' : 'Annuler cette séance'}
                                  onClick={() => !locked && cancelSession(req.id)}
                                >Annuler</button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="t-side-col">
                <div className="t-section-title">
                  <h3>Patients récents</h3>
                </div>
                
                <div className="t-clients">
                  {(() => {
                    const avatarColors = ['av-teal', 'av-blue', 'av-orange', 'av-purple', 'av-green'];
                    const seen = new Set();
                    const recentReal = paidRequests
                      .sort((a, b) => new Date(b.schedule?.session_date) - new Date(a.schedule?.session_date))
                      .filter(req => {
                        const id = req.client_id;
                        if (seen.has(id)) return false;
                        seen.add(id); return true;
                      })
                      .slice(0, 4);
                    return recentReal.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>Aucun patient récent</p>
                        <p style={{ fontSize: 13 }}>Vos patients apparaîtront ici après leur première séance.</p>
                      </div>
                    ) : recentReal.map((req, i) => {
                      const name = req.client?.user?.name || 'Patient';
                      const date = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;
                      return (
                        <div key={req.id} className="t-client-line">
                          <div className="t-client-info">
                            <div className={`avatar ${avatarColors[i % avatarColors.length]} font-bold`}>
                              {name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4>{name}</h4>
                              <p>Dernière séance: {date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}</p>
                            </div>
                          </div>
                          <button className="btn btn-outline btn-sm icon-btn" onClick={() => navigate('/messagerie')} title="Envoyer un message">
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Consultations tab ── */}
        {activeTab === 'sessions' && (() => {
          // ── local filter state (hoisted via ref so it doesn't reset on re-render) ──
          const [cSearch,  setCSearch]  = React.useState('');
          const [cPeriod,  setCPeriod]  = React.useState('all');   // all | today | week | month
          const [cMode,    setCMode]    = React.useState('all');   // all | online | cabinet

          const now  = new Date();
          const sow  = new Date(now); sow.setDate(now.getDate() - now.getDay() + 1); sow.setHours(0,0,0,0);
          const eow  = new Date(sow); eow.setDate(sow.getDate() + 6); eow.setHours(23,59,59,999);
          const som  = new Date(now.getFullYear(), now.getMonth(), 1);
          const eom  = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

          const filtered = paidRequests
            .filter(req => {
              const d = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;
              const name = (req.client?.user?.name || '').toLowerCase();
              if (cSearch && !name.includes(cSearch.toLowerCase())) return false;
              if (cMode === 'online'  && req.schedule?.mode !== 'online')  return false;
              if (cMode === 'cabinet' && req.schedule?.mode !== 'cabinet') return false;
              if (!d) return cPeriod === 'all';
              if (cPeriod === 'today') return d.toDateString() === now.toDateString();
              if (cPeriod === 'week')  return d >= sow && d <= eow;
              if (cPeriod === 'month') return d >= som && d <= eom;
              return true;
            })
            .sort((a, b) => new Date(a.schedule?.session_date) - new Date(b.schedule?.session_date));

          // Group by date key
          const groups = {};
          filtered.forEach(req => {
            const d = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;
            const key = d ? d.toDateString() : 'no-date';
            if (!groups[key]) groups[key] = { label: '', items: [], date: d };
            if (d) {
              const isToday    = d.toDateString() === now.toDateString();
              const tomorrow   = new Date(now); tomorrow.setDate(now.getDate() + 1);
              const isTomorrow = d.toDateString() === tomorrow.toDateString();
              groups[key].label = isToday
                ? "Aujourd'hui"
                : isTomorrow
                  ? 'Demain'
                  : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
            } else {
              groups[key].label = 'Date inconnue';
            }
            groups[key].items.push(req);
          });

          const upcoming = filtered.filter(r => r.schedule?.session_date && new Date(r.schedule.session_date) >= now).length;
          const past     = filtered.filter(r => r.schedule?.session_date && new Date(r.schedule.session_date) <  now).length;

          const filterBtnStyle = (active) => ({
            padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
            background:   active ? 'var(--color-primary)' : 'transparent',
            color:        active ? '#fff' : 'var(--color-text-muted)',
            borderColor:  active ? 'var(--color-primary)' : 'var(--color-border)',
            transition: 'all 0.15s',
          });

          return (
            <div className="animate-fade-in-up">

              {/* ── Header ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Consultations</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{upcoming}</span> à venir &nbsp;·&nbsp; {past} passées
                    </p>
                  </div>
                  {/* Search */}
                  <div style={{ position: 'relative', flex: '0 0 220px' }}>
                    <input
                      type="text"
                      placeholder="Rechercher un patient…"
                      value={cSearch}
                      onChange={e => setCSearch(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 999, border: '1px solid var(--color-border)', fontSize: 13, outline: 'none', background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>🔍</span>
                  </div>
                </div>

                {/* Filter rows */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Period */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[['all','Tout'], ['today',"Aujourd'hui"], ['week','Cette semaine'], ['month','Ce mois']].map(([v,l]) => (
                      <button key={v} style={filterBtnStyle(cPeriod === v)} onClick={() => setCPeriod(v)}>{l}</button>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />
                  {/* Mode */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[['all','Tous'], ['online','📹 Vidéo'], ['cabinet','🏢 Cabinet']].map(([v,l]) => (
                      <button key={v} style={filterBtnStyle(cMode === v)} onClick={() => setCMode(v)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Loading / Empty ── */}
              {paidReqLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Chargement…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Aucune consultation trouvée</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: 320, margin: '0 auto' }}>Essayez de modifier les filtres ou la période sélectionnée.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {Object.values(groups).map(group => {
                    const isToday = group.date && group.date.toDateString() === now.toDateString();
                    return (
                      <div key={group.label}>
                        {/* Day header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{
                            fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
                            color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          }}>{group.label}</div>
                          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>{group.items.length} séance{group.items.length > 1 ? 's' : ''}</div>
                        </div>

                        {/* Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {group.items.map(req => {
                            const d    = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;
                            const past = d && d < now;
                            const hrs  = d ? (d - now) / 36e5 : Infinity;
                            const locked = hrs < 48 && !past;
                            const name = req.client?.user?.name || 'Patient';
                            const initials = name.substring(0, 2).toUpperCase();
                            const avatarBgs = ['#d1fae5','#dbeafe','#fef3c7','#fce7f3','#ede9fe'];
                            const avatarColors2 = ['#065f46','#1e40af','#92400e','#9d174d','#5b21b6'];
                            const ci = (req.client_id || 0) % 5;

                            return (
                              <div key={req.id} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                background: 'var(--color-surface)', border: `1px solid ${isToday && !past ? 'var(--color-primary-light, #a7d7b8)' : 'var(--color-border)'}`,
                                borderLeft: isToday && !past ? '4px solid var(--color-primary)' : '4px solid transparent',
                                borderRadius: 14, padding: '14px 20px',
                                opacity: past ? 0.65 : 1,
                                transition: 'box-shadow 0.15s',
                              }}
                                onMouseOver={e => !past && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                                onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
                              >
                                {/* Time block */}
                                <div style={{ textAlign: 'center', minWidth: 52, flexShrink: 0 }}>
                                  <div style={{ fontSize: 18, fontWeight: 800, color: past ? 'var(--color-text-muted)' : 'var(--color-text)', lineHeight: 1 }}>
                                    {d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                  </div>
                                </div>

                                {/* Divider */}
                                <div style={{ width: 1, height: 44, background: 'var(--color-border)', flexShrink: 0 }} />

                                {/* Avatar */}
                                <div style={{ width: 42, height: 42, borderRadius: '50%', background: avatarBgs[ci], color: avatarColors2[ci], fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {initials}
                                </div>

                                {/* Patient info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 3 }}>{name}</div>
                                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{req.service?.name || 'Consultation'}</div>
                                </div>

                                {/* Mode badge */}
                                {req.schedule?.mode === 'online'
                                  ? <span className="t-session-badge online"><Video size={12}/> Vidéo</span>
                                  : <span className="t-session-badge cabinet">Cabinet</span>
                                }

                                {/* Status / Action */}
                                {past ? (
                                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>Terminée</span>
                                ) : (
                                  <button
                                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 999, border: '1px solid', background: locked ? '#f9fafb' : '#fef2f2', color: locked ? '#9ca3af' : '#dc2626', borderColor: locked ? '#e5e7eb' : '#fca5a5', cursor: locked ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                                    disabled={locked}
                                    title={locked ? 'Annulation impossible moins de 48h avant la séance' : 'Annuler cette séance'}
                                    onClick={() => !locked && cancelSession(req.id)}
                                  >Annuler</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}



        {/* ── Dossiers Patients tab ── */}
        {activeTab === 'clients' && (
          <div className="animate-fade-in-up">
            <div className="t-section-title" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Dossiers patients</h3>
              <span className="badge badge-primary-light" style={{ fontSize: 13, padding: '5px 14px' }}>24 actifs</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[].map(client => (
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
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Aucun dossier patient</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 340, margin: '0 auto' }}>
                  Les dossiers de vos patients apparaîtront ici dès qu'ils auront réservé une séance avec vous.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Revenus tab ── */}
        {activeTab === 'earnings' && (
          <div className="animate-fade-in-up">

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: <DollarSign size={22} />, label: 'Ce mois', value: `${stats.revenue_this_month.toFixed(2)} €`, iconBg: '#d1fae5', iconColor: '#065f46' },
                { icon: <Calendar size={22} />, label: 'Séances ce mois', value: stats.sessions_this_month, iconBg: '#dbeafe', iconColor: '#1e40af' },
                { icon: <DollarSign size={22} />, label: 'Total encaissé', value: `${payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount || 0), 0).toFixed(2)} €`, iconBg: '#fef3c7', iconColor: '#92400e' },
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
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: stat.iconBg, color: stat.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment list */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Détail des paiements</h3>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{payments.length} transaction{payments.length !== 1 ? 's' : ''}</span>
            </div>

            {paymentsLoading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Chargement...</div>
            ) : payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>💳</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>Aucune transaction</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 320, margin: '0 auto' }}>L'historique de vos paiements apparaîtra ici dès que vous aurez des séances facturées.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payments.map((p, i) => {
                  const paidAt = p.paid_at ? new Date(p.paid_at) : null;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 12, padding: '14px 20px', gap: 16,
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.client?.user?.name || 'Patient'}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {paidAt ? paidAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)' }}>{parseFloat(p.amount).toFixed(2)} €</span>
                        {p.status === 'refunded' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#f3f4f6', color: '#4b5563', textTransform: 'uppercase', border: '1px solid #d1d5db' }}>Remboursé</span>
                        ) : p.status === 'failed' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#fee2e2', color: '#991b1b', textTransform: 'uppercase' }}>Échoué</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#d1fae5', color: '#065f46', textTransform: 'uppercase' }}>Payé</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                      (planning[d.id] || []).map(slot => {
                        const isBooked = slot.status === 'booked';
                        return (
                          <div
                            key={slot.id}
                            className="planning-slot-chip"
                            style={isBooked ? {
                              background: 'rgba(15,15,15,0.7)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              opacity: 0.85,
                            } : {}}
                          >
                            <button
                              className="planning-chip-label"
                              onClick={!isBooked && weekOffset >= 0 ? () => startEdit(slot) : undefined}
                              title={isBooked ? 'Créneau réservé — non modifiable' : (weekOffset >= 0 ? 'Cliquer pour modifier' : '')}
                              style={{ cursor: isBooked || weekOffset < 0 ? 'default' : 'pointer', gap: 4 }}
                            >
                              {isBooked && <span style={{ fontSize: 10 }}>🔒</span>}
                              {slot.startTime}
                            </button>
                            {weekOffset >= 0 && !isBooked && (
                              <button
                                className="planning-slot-remove"
                                onClick={() => removeSlot(d.id, slot.id)}
                                title="Supprimer"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })
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
