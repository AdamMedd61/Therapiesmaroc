import { useState } from 'react';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  MessageSquare, BellRing, User, Video
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useReservations, THERAPIST_DEMO_ID, PATIENT_DEMO_ID } from '../../context/ReservationContext';
import '../Inbox/InboxPage.css'; // Reuse the excellent CSS

//  ── ──  REASON LABELS  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── 
const REASON_LABELS = {
  anxiete: 'Anxiété & stress',
  depression: 'Dépression',
  couple: 'Relation de couple',
  trauma: 'Trauma & deuil',
  travail: 'Stress professionnel / Burnout',
  autre: 'Autre',
};

//  ── ──  Status pill component  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── 
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

//  ── ──  Client: Reservation card  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── 
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
        <p className="req-notes">« {req.notes} »</p>
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

//  ── ──  Therapist: Reservation request card  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── 
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
        <p className="req-notes">« {req.notes} »</p>
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

//  ── ──  Main ReservationsPage  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── 
export default function ReservationsPage() {
  const { user } = useAuth();
  const { requests, updateStatus, getRequestsForTherapist, getRequestsForClient } = useReservations();

  const isTherapist = user?.role === 'therapist';

  const myTherapistId = user?.id || THERAPIST_DEMO_ID;
  const myClientId    = user?.id || PATIENT_DEMO_ID;

  const myRequests = isTherapist
    ? getRequestsForTherapist(myTherapistId)
    : getRequestsForClient(myClientId);

  const pendingCount = myRequests.filter(r => r.status === 'pending').length;

  const handleAccept = (id) => {
    updateStatus(id, 'accepted');
    toast.success('Séance confirmée ! Le patient a été notifié.');
  };

  const handleReject = (id) => {
    updateStatus(id, 'rejected');
    toast.error('Demande refusée. Le patient a été notifié.');
  };

  return (
    <div className="inbox-page">
      <div className="container py-6 h-100">
        <div className="inbox-container card p-0">

          <div className="inbox-sidebar">
            <div className="inbox-sidebar-header">
              <h2>{isTherapist ? 'Demandes' : 'Réservations'}</h2>
            </div>
            
            <div className="inbox-list" style={{ marginTop: '16px' }}>
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
          </div>

          <div className="inbox-chat">
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
          </div>
        </div>
      </div>
    </div>
  );
}
