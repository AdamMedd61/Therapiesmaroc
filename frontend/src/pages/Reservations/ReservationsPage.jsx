import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  BellRing, Video, User, MessageSquare, Search, Trash2, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './ReservationsPage.css';

// ── Status Pill ──────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const config = {
    pending:  { label: 'En attente', cls: 'status-pending',  Icon: Clock },
    accepted: { label: 'Acceptée',   cls: 'status-accepted', Icon: CheckCircle2 },
    refused:  { label: 'Refusée',    cls: 'status-rejected', Icon: XCircle },
    paid:     { label: 'Payée ✓',    cls: 'status-accepted', Icon: CheckCircle2 },
  };
  const { label, cls, Icon } = config[status] || config.pending;
  return (
    <span className={`req-status-pill ${cls}`}>
      <Icon size={13} /> {label}
    </span>
  );
}

// ── Therapist Card ───────────────────────────────────────────────────────
function TherapistRequestCard({ req, onAccept, onRefuse, onDelete }) {
  const clientName = req.client?.user?.name || 'Patient';
  const sessionDate = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;

  return (
    <div className={`req-card req-card-${req.status}`}>
      <div className="req-card-header">
        <div className="req-card-person">
          <div className="req-avatar req-avatar-client">{clientName.substring(0, 2).toUpperCase()}</div>
          <div>
            <h4 className="req-name">{clientName}</h4>
            <p className="req-type">{req.schedule?.category || 'Consultation'}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="req-chips">
        <span className="req-chip">
          {req.schedule?.mode === 'online' ? <Video size={13} /> : <User size={13} />}
          {req.schedule?.mode === 'online' ? 'En ligne' : 'En cabinet'}
        </span>
        {sessionDate && (
          <>
            <span className="req-chip"><CalendarCheck size={13} />{sessionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="req-chip"><Clock size={13} />{sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </>
        )}
      </div>

      {req.commentary && (
        <div className="req-commentary">
          <MessageSquare size={14} />
          <p>{req.commentary}</p>
        </div>
      )}

      {req.status === 'pending' && (
        <div className="req-actions">
          <button className="btn req-refuse-btn" onClick={() => onRefuse(req.id)}>
            <XCircle size={16} /> Refuser
          </button>
          <button className="btn btn-primary req-accept-btn" onClick={() => onAccept(req.id)}>
            <CheckCircle2 size={16} /> Accepter
          </button>
        </div>
      )}
      {req.status === 'accepted' && (
        <div className="req-banner req-banner-accepted"><CheckCircle2 size={15} /><span>Vous avez confirmé cette séance. En attente du paiement du patient.</span></div>
      )}
      {req.status === 'paid' && (
        <div className="req-banner req-banner-accepted"><CheckCircle2 size={15} /><span>Paiement reçu ✓ Séance confirmée et réservée.</span></div>
      )}
      {req.status === 'refused' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="req-banner req-banner-refused" style={{ flex: 1 }}><XCircle size={15} /><span>Vous avez refusé cette demande.</span></div>
          <button className="btn req-refuse-btn" style={{ flexShrink: 0, padding: '8px 14px', width: 'auto', flex: 'none' }} onClick={() => onDelete(req.id)}>
            <Trash2 size={15} /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

// ── Patient Card ─────────────────────────────────────────────────────────
function PatientRequestCard({ req, onCancel, onDelete }) {
  const navigate = useNavigate();
  const therapistName = req.therapist?.user?.name || 'Thérapeute';
  const sessionDate = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;

  return (
    <div className={`req-card req-card-${req.status}`}>
      <div className="req-card-header">
        <div className="req-card-person">
          <div className="req-avatar req-avatar-therapist">{therapistName.substring(0, 2).toUpperCase()}</div>
          <div>
            <h4 className="req-name">{therapistName}</h4>
            <p className="req-type">{req.schedule?.category || 'Consultation'}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="req-chips">
        <span className="req-chip">
          {req.schedule?.mode === 'online' ? <Video size={13} /> : <User size={13} />}
          {req.schedule?.mode === 'online' ? 'En ligne' : 'En cabinet'}
        </span>
        {sessionDate && (
          <>
            <span className="req-chip"><CalendarCheck size={13} />{sessionDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="req-chip"><Clock size={13} />{sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </>
        )}
      </div>

      {req.commentary && (
        <div className="req-commentary">
          <MessageSquare size={14} />
          <p>{req.commentary}</p>
        </div>
      )}

      {req.status === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="req-banner req-banner-pending"><AlertCircle size={15} /><span>Votre demande est en cours d'examen par le thérapeute.</span></div>
          <button className="btn req-refuse-btn" style={{ alignSelf: 'flex-start', padding: '8px 20px' }} onClick={() => onCancel(req.id)}>
            <XCircle size={16} /> Annuler la demande
          </button>
        </div>
      )}
      {req.status === 'accepted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="req-banner req-banner-accepted"><CheckCircle2 size={15} /><span>Demande acceptée ! Finalisez votre réservation en payant maintenant.</span></div>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', padding: '10px 24px', gap: 8 }}
            onClick={() => navigate(`/paiement/${req.id}`)}
          >
            <CreditCard size={16} /> Payer et confirmer la séance
          </button>
        </div>
      )}
      {req.status === 'paid' && (
        <div className="req-banner req-banner-accepted"><CheckCircle2 size={15} /><span>Paiement reçu ✓ Votre séance est confirmée !</span></div>
      )}
      {req.status === 'refused' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="req-banner req-banner-refused" style={{ flex: 1 }}><XCircle size={15} /><span>Le thérapeute n'est pas disponible à ce créneau. Essayez un autre horaire.</span></div>
          <button className="btn req-refuse-btn" style={{ flexShrink: 0, padding: '8px 14px', width: 'auto', flex: 'none' }} onClick={() => onDelete(req.id)}>
            <Trash2 size={15} /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const { user } = useAuth();
  const isTherapist = user?.role === 'therapist';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, requestId: null, dates: '' });

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch {
      toast.error('Erreur de chargement des demandes.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = (id) => {
    const req = requests.find(r => r.id === id);
    if (req?.overlapping_schedules?.length > 0) {
      const dates = req.overlapping_schedules.map(s => {
        const d = new Date(s.session_date);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }).join(', ');
      setConfirmModal({ isOpen: true, requestId: id, dates });
    } else {
      handleAcceptConfirm(id);
    }
  };

  const handleAcceptConfirm = async (id) => {
    setConfirmModal({ isOpen: false, requestId: null, dates: '' });
    try { await api.put(`/requests/${id}`, { status: 'accepted' }); toast.success('Séance confirmée !'); loadRequests(); }
    catch { toast.error('Erreur lors de la confirmation.'); }
  };

  const handleRefuse = async (id) => {
    try { await api.put(`/requests/${id}`, { status: 'refused' }); toast.error('Demande refusée.'); loadRequests(); }
    catch { toast.error('Erreur lors du refus.'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Confirmer l'annulation ?")) return;
    try { await api.delete(`/requests/${id}`); toast.success('Demande annulée.'); loadRequests(); }
    catch { toast.error("Erreur lors de l'annulation."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette demande définitivement ?')) return;
    try { await api.delete(`/requests/${id}`); toast.success('Demande supprimée.'); if (selectedId === id) setSelectedId(null); loadRequests(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de la suppression.'); }
  };

  // Auto-select first when loaded
  useEffect(() => {
    if (requests.length > 0 && !selectedId) setSelectedId(requests[0].id);
  }, [requests]);

  const selected = requests.find(r => r.id === selectedId);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const getPersonName = (req) => isTherapist
    ? (req.client?.user?.name || 'Patient')
    : (req.therapist?.user?.name || 'Thérapeute');

  const getStatusDot = (status) => ({
    pending: 'req-dot-pending',
    accepted: 'req-dot-accepted',
    refused: 'req-dot-refused',
  }[status] || 'req-dot-pending');

  const filteredRequests = requests.filter(req =>
    getPersonName(req).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="reservations-page">
      <div className="container py-6 h-100">
        <div className="inbox-container card p-0">

          {/* ── Sidebar ── */}
          <div className="inbox-sidebar">
            <div className="inbox-sidebar-header">
              <h2>{isTherapist ? 'Demandes' : 'Mes réservations'}</h2>
              {pendingCount > 0 && (
                <div className="reservations-pending-badge" style={{ fontSize: 11 }}>
                  <BellRing size={13} /> {pendingCount} en attente
                </div>
              )}
              <div className="inbox-search">
                <Search size={15} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="input-unstyled"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="inbox-list">
              {loading ? (
                <div className="inbox-empty-sidebar">Chargement...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="inbox-empty-sidebar">
                  <CalendarCheck size={32} style={{ opacity: 0.3 }} />
                  <p>{search ? 'Aucun résultat' : 'Aucune demande'}</p>
                </div>
              ) : filteredRequests.map(req => {
                const name = getPersonName(req);
                const date = req.schedule?.session_date ? new Date(req.schedule.session_date) : null;
                return (
                  <div
                    key={req.id}
                    className={`inbox-item ${selectedId === req.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(req.id)}
                  >
                    <div className={`req-avatar req-avatar-${isTherapist ? 'client' : 'therapist'}`} style={{ width: 38, height: 38, fontSize: 12 }}>
                      {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="inbox-item-content">
                      <div className="inbox-item-header">
                        <h4>{name}</h4>
                        <span className={`req-dot ${getStatusDot(req.status)}`}></span>
                      </div>
                      <div className="inbox-item-footer">
                        <p className="inbox-preview">
                          {date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Main panel ── */}
          <div className="inbox-chat" style={{ overflowY: 'auto', padding: 'var(--space-6)' }}>
            {!selected ? (
              <div className="reservations-empty" style={{ height: '100%', justifyContent: 'center' }}>
                <CalendarCheck size={48} style={{ opacity: 0.2 }} />
                <p>Sélectionnez une demande</p>
              </div>
            ) : isTherapist ? (
              <TherapistRequestCard req={selected} onAccept={handleAcceptClick} onRefuse={handleRefuse} onDelete={handleDelete} />
            ) : (
              <PatientRequestCard req={selected} onCancel={handleCancel} onDelete={handleDelete} />
            )}
          </div>

        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card" style={{ maxWidth: 400, width: '90%', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-4)', color: 'var(--color-warning)' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0 }}>Attention : Chevauchement</h3>
            </div>
            <p style={{ marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              Accepter cette demande chevauchera avec le(s) créneau(x) disponible(s) de <strong>{confirmModal.dates}</strong>.<br/><br/>
              <em>Ces créneaux ne seront <strong>pas supprimés</strong> pour l'instant (jusqu'à l'implémentation du paiement), mais attention au double-booking.</em>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmModal({ isOpen: false, requestId: null, dates: '' })}>Annuler</button>
              <button className="btn btn-primary" onClick={() => handleAcceptConfirm(confirmModal.requestId)}>Accepter quand même</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

