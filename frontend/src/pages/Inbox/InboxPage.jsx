import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Paperclip, Search, MoreVertical, Phone, Video,
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  MessageSquare, BellRing, User
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useReservations, THERAPIST_DEMO_ID, PATIENT_DEMO_ID } from '../../context/ReservationContext';
import './InboxPage.css';


// ──── Static chat mock data ──────────────────────────────────────────────────────────────────────────────────────────────────
const conversations = [
  {
    id: '1',
    name: 'Dr. Salma Benkirane',
    therapistId: '1',
    lastMessage: 'Je vous envoie les notes de notre dernière séance...',
    timestamp: 'Auj, 10:30',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Dr. Youssef Alami',
    therapistId: '2',
    lastMessage: "N'oubliez pas vos exercices respiratoires ce soir.",
    timestamp: 'Hier',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Support TherapiesMaroc',
    therapistId: null,
    lastMessage: 'Votre facture a été générée avec succès.',
    timestamp: 'Lun.',
    unread: 0,
    online: true,
  },
];

const patientConversations = [
  {
    id: 'p1',
    name: 'Sara L.',
    clientId: 'client-1',
    lastMessage: 'Bonjour Docteur, est-ce que vous avez vu ma demande ?',
    timestamp: 'Auj, 09:15',
    unread: 1,
    online: true,
  },
  {
    id: 'p2',
    name: 'Karim M.',
    clientId: 'client-2',
    lastMessage: 'Merci pour la confirmation de notre séance.',
    timestamp: 'Hier',
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  { id: '1', sender: 'other', content: 'Bonjour ! Comment vous sentez-vous depuis notre séance de mardi ?', time: '10:00' },
  { id: '2', sender: 'me', content: "Bonjour Docteur. Je me sens un peu mieux, j'ai commencé à appliquer les méthodes de respiration.", time: '10:15' },
  { id: '3', sender: 'other', content: "Excellent. C'est un très bon début. Je vous envoie un document PDF avec quelques variations à essayer pour ce week-end.", time: '10:30' },
];

// ──── REASON LABELS ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const REASON_LABELS = {
  anxiete: 'Anxiété & stress',
  depression: 'Dépression',
  couple: 'Relation de couple',
  trauma: 'Trauma & deuil',
  travail: 'Stress professionnel / Burnout',
  autre: 'Autre',
};

// ──── Status pill component ──────────────────────────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const config = {
    pending: { label: 'En attente', cls: 'status-pending', Icon: Clock },
    accepted: { label: 'Acceptée', cls: 'status-accepted', Icon: CheckCircle2 },
    rejected: { label: 'Refusée', cls: 'status-rejected', Icon: XCircle },
  };
  const { label, cls, Icon } = config[status] || config.pending;
  return (
    <span className={`req-status-pill ${cls}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}

// ──── Client: Reservation card ────────────────────────────────────────────────────────────────────────────────────────────
function ClientReservationCard({ req }) {
  return (
    <div className={`req-card req-card-${req.status}`}>
      <div className="req-card-header">
        <div className="req-card-therapist">
          <div className="avatar avatar-sm req-avatar">
            {req.therapistName.split(' ').slice(-1)[0]?.substring(0, 2)}
          </div>
          <div>
            <h4>{req.therapistName}</h4>
            <p className="text-xs text-muted">{req.service}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="req-card-details">
        <span className="req-detail-chip">
          {req.mode === 'online' ? <Video size={12} /> : <User size={12} />}
          {req.mode === 'online' ? 'En ligne' : 'En cabinet'}
        </span>
        <span className="req-detail-chip">
          <CalendarCheck size={12} />
          {req.date?.replace('-', ' ')} Mars
        </span>
        <span className="req-detail-chip">
          <Clock size={12} />
          {req.time}
        </span>
      </div>

      {req.notes && (
        <p className="req-notes">«&nbsp;{req.notes}&nbsp;»</p>
      )}

      {req.status === 'pending' && (
        <div className="req-banner req-banner-pending">
          <AlertCircle size={14} />
          <span>Votre demande est en cours d'examen par le thérapeute.</span>
        </div>
      )}
      {req.status === 'accepted' && (
        <div className="req-banner req-banner-accepted">
          <CheckCircle2 size={14} />
          <span>Séance confirmée ! Vous recevrez un rappel avant la séance.</span>
        </div>
      )}
      {req.status === 'rejected' && (
        <div className="req-banner req-banner-rejected">
          <XCircle size={14} />
          <span>Le thérapeute n'est pas disponible à ce créneau. Essayez un autre horaire.</span>
        </div>
      )}
    </div>
  );
}

// ──── Therapist: Reservation request card ────────────────────────────────────────────────────────────────────
function TherapistRequestCard({ req, onAccept, onReject }) {
  return (
    <div className={`req-card req-card-${req.status}`}>
      <div className="req-card-header">
        <div className="req-card-therapist">
          <div className="avatar avatar-sm req-avatar-client">
            {req.clientName?.substring(0, 2)}
          </div>
          <div>
            <h4>{req.clientName}</h4>
            <p className="text-xs text-muted">{req.service}</p>
          </div>
        </div>
        <StatusPill status={req.status} />
      </div>

      <div className="req-card-details">
        <span className="req-detail-chip">
          {req.mode === 'online' ? <Video size={12} /> : <User size={12} />}
          {req.mode === 'online' ? 'En ligne' : 'En cabinet'}
        </span>
        <span className="req-detail-chip">
          <CalendarCheck size={12} />
          {req.date?.replace('-', ' ')} Mars
        </span>
        <span className="req-detail-chip">
          <Clock size={12} />
          {req.time}
        </span>
        {req.reason && (
          <span className="req-detail-chip">
            <MessageSquare size={12} />
            {REASON_LABELS[req.reason] || req.reason}
          </span>
        )}
      </div>

      {req.notes && (
        <p className="req-notes">«&nbsp;{req.notes}&nbsp;»</p>
      )}

      {req.status === 'pending' && (
        <div className="req-actions-row">
          <button
            className="btn btn-outline req-reject-btn"
            onClick={() => onReject(req.id)}
          >
            <XCircle size={15} /> Refuser
          </button>
          <button
            className="btn btn-primary req-accept-btn"
            onClick={() => onAccept(req.id)}
          >
            <CheckCircle2 size={15} /> Accepter
          </button>
        </div>
      )}
      {req.status === 'accepted' && (
        <div className="req-banner req-banner-accepted">
          <CheckCircle2 size={14} />
          <span>Vous avez confirmé cette séance.</span>
        </div>
      )}
      {req.status === 'rejected' && (
        <div className="req-banner req-banner-rejected">
          <XCircle size={14} />
          <span>Vous avez refusé cette demande.</span>
        </div>
      )}
    </div>
  );
}

// ──── Main InboxPage ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { user } = useAuth();
  const { requests, updateStatus, getRequestsForTherapist, getRequestsForClient } = useReservations();
  const location = useLocation();

  const isTherapist = user?.role === 'therapist';

  // Hardcoded to chat since this is now standalone Messagerie page
  const mainTab = 'chat';

  // Chat state
  const convList = isTherapist ? patientConversations : conversations;
  const [activeConv, setActiveConv] = useState(convList[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  // Reservation requests  use user.id if set, fall back to stable demo IDs
  const myTherapistId = user?.id || THERAPIST_DEMO_ID;
  const myClientId    = user?.id || PATIENT_DEMO_ID;

  const myRequests = isTherapist
    ? getRequestsForTherapist(myTherapistId)
    : getRequestsForClient(myClientId);

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: 'me',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const handleAccept = (id) => {
    updateStatus(id, 'accepted');
    toast.success('S& Séance confirmée ! Le patient a été notifié.');
  };

  const handleReject = (id) => {
    updateStatus(id, 'rejected');
    toast.error('R Demande refusée. Le patient a été notifié.');
  };

  return (
    <div className="inbox-page">
      <div className="container py-6 h-100">
        <div className="inbox-container card p-0">

          {/* ── SECTION ── */}
          <div className="inbox-sidebar">
            <div className="inbox-sidebar-header">
              <h2 style={{ marginBottom: 12 }}>Messagerie</h2>

              {mainTab === 'chat' && (
                <div className="inbox-search">
                  <Search size={16} className="text-muted" />
                  <input type="text" placeholder="Rechercher..." className="input-unstyled" />
                </div>
              )}
            </div>

            {/* Chat list */}
            {mainTab === 'chat' && (
              <div className="inbox-list">
                {convList.map(conv => (
                  <div
                    key={conv.id}
                    className={`inbox-item ${activeConv?.id === conv.id ? 'active' : ''}`}
                    onClick={() => setActiveConv(conv)}
                  >
                    <div className="relative">
                      <div className="avatar avatar-md bg-primary-light text-primary font-bold">
                        {conv.name.substring(0, 2)}
                      </div>
                      {conv.online && <div className="online-indicator"></div>}
                    </div>
                    <div className="inbox-item-content">
                      <div className="inbox-item-header">
                        <h4>{conv.name}</h4>
                        <span className="inbox-time">{conv.timestamp}</span>
                      </div>
                      <div className="inbox-item-footer">
                        <p className="inbox-preview">{conv.lastMessage}</p>
                        {conv.unread > 0 && <span className="inbox-badge">{conv.unread}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reservation list (sidebar mini-preview) */}
            {mainTab === 'reservations' && (
              <div className="inbox-list">
                {myRequests.length === 0 ? (
                  <div className="inbox-empty-sidebar">
                    <CalendarCheck size={32} className="text-muted" />
                    <p>Aucune demande</p>
                  </div>
                ) : (
                  myRequests.map(req => (
                    <div key={req.id} className="inbox-item req-sidebar-item">
                      <div className="avatar avatar-sm req-avatar-sm">
                        {isTherapist
                          ? req.clientName?.substring(0, 2)
                          : req.therapistName?.split(' ').slice(-1)[0]?.substring(0, 2)}
                      </div>
                      <div className="inbox-item-content">
                        <div className="inbox-item-header">
                          <h4>{isTherapist ? req.clientName : req.therapistName}</h4>
                          <span className={`req-dot req-dot-${req.status}`}></span>
                        </div>
                        <div className="inbox-item-footer">
                          <p className="inbox-preview">{req.service} · {req.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── SECTION ── */}
          <div className="inbox-chat">

            {/* ── SECTION ── */}
            {mainTab === 'chat' && activeConv && (
              <>
                <div className="chat-header">
                  <div className="flex items-center gap-4">
                    <div className="avatar avatar-sm bg-primary-light text-primary font-bold">
                      {activeConv.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold">{activeConv.name}</h3>
                      <span className="text-xs text-success font-medium">En ligne</span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="btn btn-outline icon-btn"><Phone size={18} /></button>
                    <button className="btn btn-outline icon-btn"><Video size={18} /></button>
                    <button className="btn btn-outline icon-btn border-none"><MoreVertical size={18} /></button>
                  </div>
                </div>

                <div className="chat-messages">
                  <div className="text-center text-xs text-muted my-4">Aujourd'hui</div>
                  {messages.map(msg => (
                    <div key={msg.id} className={`message-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                      {msg.sender === 'other' && (
                        <div className="avatar avatar-xs bg-primary-light text-primary font-bold flex-shrink-0 animate-fade-in-up">
                          {activeConv.name.substring(0, 1)}
                        </div>
                      )}
                      <div className="message-bubble animate-fade-in-up">
                        <p>{msg.content}</p>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                  <button type="button" className="btn icon-btn text-muted hover-primary">
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="0crivez votre message..."
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary icon-btn rounded-full" disabled={!input.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}

            {/* ── SECTION ── */}
            {mainTab === 'reservations' && (
              <div className="reservations-panel">
                <div className="reservations-header">
                  <div>
                    <h3>
                      {isTherapist ? 'Demandes de réservation' : 'Mes réservations'}
                    </h3>
                    <p className="text-sm text-muted">
                      {isTherapist
                        ? 'Acceptez ou refusez les demandes de vos patients.'
                        : 'Suivez le statut de vos demandes de séance.'}
                    </p>
                  </div>
                  {pendingCount > 0 && (
                    <div className="reservations-pending-badge">
                      <BellRing size={15} />
                      {pendingCount} en attente
                    </div>
                  )}
                </div>

                <div className="reservations-list">
                  {myRequests.length === 0 ? (
                    <div className="reservations-empty">
                      <CalendarCheck size={48} className="text-muted" />
                      <h4>Aucune demande</h4>
                      <p className="text-muted">
                        {isTherapist
                          ? 'Vos patients pourront envoyer des demandes de séance ici.'
                          : 'Rendez-vous sur le profil d\'un thérapeute pour réserver une séance.'}
                      </p>
                    </div>
                  ) : (
                    myRequests.map(req =>
                      isTherapist ? (
                        <TherapistRequestCard
                          key={req.id}
                          req={req}
                          onAccept={handleAccept}
                          onReject={handleReject}
                        />
                      ) : (
                        <ClientReservationCard key={req.id} req={req} />
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
