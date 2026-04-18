import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Calendar, Video, Building2, Check, AlertCircle } from 'lucide-react';
import { therapists } from '../../data/therapists';
import { useReservations } from '../../context/ReservationContext';
import { useAuth } from '../../context/AuthContext';
import './BookingPage.css';

const SERVICES = [
  { id: 's1', name: 'Consultation individuelle', desc: 'Séance individuelle de psychothérapie', duration: 55, price: null, modes: ['online', 'cabinet'] },
  { id: 's2', name: 'Thérapie de couple', desc: 'Séance pour deux partenaires', duration: 60, price: null, modes: ['online', 'cabinet'] },
  { id: 's3', name: 'Consultation initiale', desc: 'Première rencontre et évaluation (tarif réduit)', duration: 30, price: null, modes: ['online'] },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const REASONS = [
  { value: 'anxiete', label: 'Anxiété & stress' },
  { value: 'depression', label: 'Dépression' },
  { value: 'couple', label: 'Relation de couple' },
  { value: 'trauma', label: 'Trauma & deuil' },
  { value: 'travail', label: 'Stress professionnel / Burnout' },
  { value: 'autre', label: 'Autre' },
];

const STEPS = [
  { n: 1, label: 'Service' },
  { n: 2, label: 'Mode' },
  { n: 3, label: 'Date & Heure' },
  { n: 4, label: 'Confirmation' },
];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const therapist = therapists.find(t => t.id === id) || therapists[0];
  const { addRequest } = useReservations();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // Build human-readable week label for the select
  const getWeekLabel = (offset) => {
    if (offset === 0) return 'Cette semaine';
    if (offset === 1) return 'Semaine prochaine';
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + offset * 7);
    const start = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    d.setDate(d.getDate() + 6);
    const end = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${start} – ${end}`;
  };

  // Get actual date label for a day within the chosen week
  const getDayDateLabel = (dayName) => {
    const dayMap = { 'Lun': 1, 'Mar': 2, 'Mer': 3, 'Jeu': 4, 'Ven': 5, 'Sam': 6, 'Dim': 7 };
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const todayDay = d.getDay() || 7;
    d.setDate(d.getDate() - todayDay + (dayMap[dayName] || 1) + weekOffset * 7);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const initials = therapist.name.split(' ').slice(-2).map(n => n[0]).join('');

  // Use therapist-specific services, merge price
  const services = therapist.services.map((s, i) => ({
    ...SERVICES[i] || {},
    ...s,
    price: s.price,
  }));

  const service = therapist.services.find(s => s.id === selectedService);

  const canProceed =
    step === 1 ? !!selectedService :
    step === 2 ? !!selectedMode :
    step === 3 ? !!selectedDate && !!selectedTime :
    true;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Submit reservation request  therapist must accept/reject
      addRequest({
        clientName: user?.name || 'Patient',
        clientId: user?.id || `client-${Date.now()}`,
        therapistId: therapist.id,
        therapistName: therapist.name,
        service: service?.name || selectedService,
        mode: selectedMode,
        date: selectedDate,
        time: selectedTime,
        reason,
        notes,
      });
      toast.success('S& Demande envoyée ! Le thérapeute va confirmer votre réservation.');
      navigate('/messagerie');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  return (
    <div className="booking-page">
      <div className="container booking-inner">

        {/* Left - form */}
        <div className="booking-form-col">
          {/* Back */}
          <button className="btn btn-ghost btn-sm booking-back" onClick={handleBack}>
            <ChevronLeft size={16} />
            {step === 1 ? 'Retour au profil' : '0tape précédente'}
          </button>

          {/* Progress */}
          <div className="booking-progress">
            {STEPS.map(s => (
              <div key={s.n} className="booking-step-item">
                <div className={`booking-step-circle ${step > s.n ? 'done' : step === s.n ? 'active' : ''}`}>
                  {step > s.n ? <Check size={14} /> : s.n}
                </div>
                <span className={`booking-step-label ${step === s.n ? 'active' : ''}`}>{s.label}</span>
                {s.n < 4 && <div className={`booking-step-line ${step > s.n ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          <div className="booking-card card">

            {/* ── SECTION ── */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Choisissez votre service</h2>
                <p className="booking-step-sub">Sélectionnez le type de consultation qui correspond à votre besoin.</p>
                <div className="booking-service-list">
                  {therapist.services.map(svc => (
                    <label
                      key={svc.id}
                      className={`booking-service-option ${selectedService === svc.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        className="radio-input"
                        name="service"
                        value={svc.id}
                        checked={selectedService === svc.id}
                        onChange={() => setSelectedService(svc.id)}
                      />
                      <div className="booking-service-info">
                        <h4 className="booking-service-name">{svc.name}</h4>
                        <p className="booking-service-dur">{svc.duration} minutes</p>
                        <div className="booking-service-mods">
                          {svc.modes.includes('online') && (
                            <span className="badge badge-primary"><Video size={10} /> En ligne</span>
                          )}
                          {svc.modes.includes('cabinet') && (
                            <span className="badge badge-neutral"><Building2 size={10} /> En cabinet</span>
                          )}
                        </div>
                      </div>
                      <div className="booking-service-price">{svc.price} MAD</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION ── */}
            {step === 2 && service && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Mode de consultation</h2>
                <p className="booking-step-sub">Comment souhaitez-vous rencontrer {therapist.name} ?</p>
                <div className="booking-mode-list">
                  {service.modes.includes('online') && (
                    <label className={`booking-mode-option ${selectedMode === 'online' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        className="radio-input"
                        name="mode"
                        value="online"
                        checked={selectedMode === 'online'}
                        onChange={() => setSelectedMode('online')}
                      />
                      <div className="booking-mode-icon booking-mode-online">
                        <Video size={24} />
                      </div>
                      <div>
                        <h4>En ligne</h4>
                        <p className="text-sm text-muted">Vidéo consultation depuis chez vous</p>
                      </div>
                    </label>
                  )}
                  {service.modes.includes('cabinet') && (
                    <label className={`booking-mode-option ${selectedMode === 'cabinet' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        className="radio-input"
                        name="mode"
                        value="cabinet"
                        checked={selectedMode === 'cabinet'}
                        onChange={() => setSelectedMode('cabinet')}
                      />
                      <div className="booking-mode-icon booking-mode-cabinet">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h4>En cabinet</h4>
                        <p className="text-sm text-muted">{therapist.address}</p>
                      </div>
                    </label>
                  )}
                </div>

                {selectedMode === 'cabinet' && (
                  <div className="booking-note">
                    <AlertCircle size={14} />
                    <span>Une pièce d'identité valide peut vous être demandée lors de votre première visite en cabinet.</span>
                  </div>
                )}
              </div>
            )}

            {/* ── SECTION ── */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Date & heure</h2>
                <p className="booking-step-sub">Choisissez le créneau qui vous convient le mieux.</p>

                <div className="booking-dates">
                  {/* Week selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Semaine :</label>
                    <select
                      className="select"
                      value={weekOffset}
                      onChange={e => {
                        setWeekOffset(Number(e.target.value));
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      style={{ flex: 1 }}
                    >
                      {[0, 1, 2, 3].map(offset => (
                        <option key={offset} value={offset}>{getWeekLabel(offset)}</option>
                      ))}
                    </select>
                  </div>

                  <label className="label">Jour de consultation</label>
                  <div className="booking-days-grid">
                    {therapist.availableSlots.map(day => (
                      <button
                        key={day.day}
                        className={`booking-day-btn ${selectedDate === `${day.day}-${weekOffset}` ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedDate(`${day.day}-${weekOffset}`);
                          setSelectedTime('');
                        }}
                      >
                        <span className="booking-day-name">{day.day}</span>
                        <span className="booking-day-date">{getDayDateLabel(day.day)}</span>
                      </button>
                    ))}
                  </div>

                  {selectedDate && (
                    <div className="animate-fade-in">
                      <label className="label" style={{ marginTop: 'var(--space-5)' }}>Heure disponible</label>
                      <div className="booking-times-grid">
                        {(therapist.availableSlots.find(d => `${d.day}-${weekOffset}` === selectedDate)?.slots || []).map(slot => (
                          <button
                            key={slot}
                            className={`booking-time-btn ${selectedTime === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional reason */}
                <div className="booking-optional">
                  <label className="label">Motif de consultation (facultatif)</label>
                  <select
                    className="select"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  >
                    <option value="">Choisir un motif...</option>
                    {REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <label className="label" style={{ marginTop: 'var(--space-4)' }}>Notes pour le thérapeute (facultatif)</label>
                  <textarea
                    className="textarea"
                    placeholder="Partagez ce que vous souhaitez aborder lors de cette première séance..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* ── SECTION ── */}
            {step === 4 && service && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Récapitulatif</h2>
                <p className="booking-step-sub">Vérifiez les détails de votre réservation avant de confirmer.</p>

                <div className="booking-summary">
                  <div className="booking-summary-therapist">
                    <div className="avatar avatar-md">{initials}</div>
                    <div>
                      <p className="font-bold">{therapist.name}</p>
                      <p className="text-sm text-muted">{therapist.title}</p>
                    </div>
                  </div>

                  <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />

                  <div className="booking-summary-rows">
                    <div className="booking-summary-row">
                      <span>Service</span>
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    <div className="booking-summary-row">
                      <span>Durée</span>
                      <span className="font-semibold">{service.duration} minutes</span>
                    </div>
                    <div className="booking-summary-row">
                      <span>Mode</span>
                      <span className="font-semibold">
                        {selectedMode === 'online' ? 'x En ligne' : 'x── En cabinet'}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span>Date & heure</span>
                      <span className="font-semibold">
                        {selectedDate.replace('-', ' ')} mars à {selectedTime}
                      </span>
                    </div>
                    {reason && (
                      <div className="booking-summary-row">
                        <span>Motif</span>
                        <span className="font-semibold">{REASONS.find(r => r.value === reason)?.label}</span>
                      </div>
                    )}
                  </div>

                  <hr className="divider" style={{ margin: 'var(--space-4) 0' }} />

                  <div className="booking-summary-total">
                    <span>Total à payer</span>
                    <span className="booking-total-price">{service.price} MAD</span>
                  </div>
                </div>

                <div className="booking-payment-note">
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>Votre demande sera envoyée au thérapeute. Le paiement sera traité après confirmation de la séance.</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="booking-nav">
              <button className="btn btn-outline" onClick={handleBack}>
                <ChevronLeft size={16} />
                {step === 1 ? 'Retour' : 'Précédent'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed}
              >
                {step === 4 ? (
                  <>
                    <Check size={16} />
                    Confirmer & payer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right - therapist summary */}
        <aside className="booking-aside">
          <div className="booking-aside-card card">
            <div className="booking-aside-header">
              <div className="avatar avatar-lg">{initials}</div>
              <div>
                <p className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>{therapist.name}</p>
                <p className="text-sm text-muted">{therapist.title}</p>
              </div>
            </div>
            <div className="booking-aside-avail">
              <span className="avail-dot" />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                {therapist.availability}
              </span>
            </div>

            {service && (
              <>
                <hr className="divider" />
                <div className="booking-aside-summary">
                  <div className="booking-aside-row">
                    <span>Service</span>
                    <span>{service.name}</span>
                  </div>
                  {selectedMode && (
                    <div className="booking-aside-row">
                      <span>Mode</span>
                      <span>{selectedMode === 'online' ? 'En ligne' : 'En cabinet'}</span>
                    </div>
                  )}
                  {selectedDate && selectedTime && (
                    <div className="booking-aside-row">
                      <span>Créneau</span>
                      <span>{selectedDate.replace('-', ' ')} · {selectedTime}</span>
                    </div>
                  )}
                  <div className="booking-aside-price-row">
                    <span>Total</span>
                    <span className="booking-aside-price">{service.price} MAD</span>
                  </div>
                </div>
              </>
            )}

            <div className="booking-aside-help">
              Besoin d'aide ? <a href="#">Contactez-nous</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
