import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Video, Building2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './BookingPage.css';

const REASONS = [
  { value: 'anxiete',    label: 'Anxiété & stress' },
  { value: 'depression', label: 'Dépression' },
  { value: 'couple',     label: 'Relation de couple' },
  { value: 'trauma',     label: 'Trauma & deuil' },
  { value: 'travail',    label: 'Stress professionnel / Burnout' },
  { value: 'autre',      label: 'Autre' },
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
  const { user } = useAuth();

  const [therapist, setTherapist] = useState(null);
  const [loadingTherapist, setLoadingTherapist] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');   // 'YYYY-MM-DD'
  const [selectedSlot, setSelectedSlot] = useState(null); // full slot object {id, session_date, mode}
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const res = await api.get(`/therapists/${id}`);
        setTherapist(res.data);
      } catch {
        toast.error('Erreur chargement thérapeute');
        navigate(-1);
      } finally {
        setLoadingTherapist(false);
      }
    };
    fetchTherapist();
  }, [id, navigate]);

  // ── Slot helpers ──────────────────────────────────────────────────────
  // Group available_slots by calendar date, optionally filtered by selected mode
  const slotsByDate = {};
  (therapist?.available_slots || []).forEach(slot => {
    if (selectedMode && slot.mode !== selectedMode && slot.mode !== 'both') return;
    const rawDate = slot.session_date || '';
    const dateKey = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.split(' ')[0];
    if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
    slotsByDate[dateKey].push(slot);
  });

  const availableDates = Object.keys(slotsByDate).sort();

  const timeSlotsForDate = selectedDate
    ? (slotsByDate[selectedDate] || []).sort((a, b) => a.session_date.localeCompare(b.session_date))
    : [];

  const formatDayLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (d.getTime() === today.getTime()) return "Aujourd'hui";
    if (d.getTime() === tomorrow.getTime()) return 'Demain';
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  const formatDayDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (sessionDate) => {
    const d = new Date(sessionDate);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Navigation ────────────────────────────────────────────────────────
  const canProceed =
    step === 1 ? !!selectedService :
    step === 2 ? !!selectedMode :
    step === 3 ? !!selectedDate && !!selectedSlot :
    true;

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (!selectedSlot) { toast.error('Veuillez choisir un créneau.'); return; }
      setIsSubmitting(true);
      try {
        await api.post('/requests', {
          therapist_id: Number(id),
          service_id: selectedService,
          session_date: selectedSlot.session_date,
          mode: selectedMode,
          commentary: notes ? `${reason ? `[${reason}] ` : ''}${notes}` : reason,
        });
        toast.success('Demande envoyée ! Le thérapeute va confirmer votre réservation.');
        navigate('/patient/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erreur lors de la réservation.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  if (loadingTherapist) return <div style={{ padding: '100px', textAlign: 'center' }}>Chargement...</div>;
  if (!therapist) return null;

  const initials = therapist.name.split(' ').slice(-2).map(n => n[0]).join('');
  const services = therapist.services || [];
  const service = services.find(s => s.id === selectedService);

  return (
    <div className="booking-page">
      <div className="container booking-inner">

        {/* Left - form */}
        <div className="booking-form-col">
          <button className="btn btn-ghost btn-sm booking-back" onClick={handleBack}>
            <ChevronLeft size={16} />
            {step === 1 ? 'Retour au profil' : 'Étape précédente'}
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

            {/* ── Step 1: Service ── */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Choisissez votre service</h2>
                <p className="booking-step-sub">Sélectionnez le type de consultation qui correspond à votre besoin.</p>
                <div className="booking-service-list">
                  {services.length === 0 ? (
                    <p>Aucun service défini par ce thérapeute.</p>
                  ) : services.map(svc => (
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
                        <p className="booking-service-dur">{svc.duration}</p>
                        <div className="booking-service-mods">
                          {['online', 'both'].includes(svc.mode) && (
                            <span className="badge badge-primary"><Video size={10} /> En ligne</span>
                          )}
                          {['cabinet', 'both'].includes(svc.mode) && (
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

            {/* ── Step 2: Mode ── */}
            {step === 2 && service && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Mode de consultation</h2>
                <p className="booking-step-sub">Comment souhaitez-vous rencontrer {therapist.name} ?</p>
                <div className="booking-mode-list">
                  {['online', 'both'].includes(service.mode) && (
                    <label className={`booking-mode-option ${selectedMode === 'online' ? 'selected' : ''}`}>
                      <input type="radio" className="radio-input" name="mode" value="online"
                        checked={selectedMode === 'online'} onChange={() => { setSelectedMode('online'); setSelectedDate(''); setSelectedSlot(null); }} />
                      <div className="booking-mode-icon booking-mode-online"><Video size={24} /></div>
                      <div>
                        <h4>En ligne</h4>
                        <p className="text-sm text-muted">Vidéo consultation depuis chez vous</p>
                      </div>
                    </label>
                  )}
                  {['cabinet', 'both'].includes(service.mode) && (
                    <label className={`booking-mode-option ${selectedMode === 'cabinet' ? 'selected' : ''}`}>
                      <input type="radio" className="radio-input" name="mode" value="cabinet"
                        checked={selectedMode === 'cabinet'} onChange={() => { setSelectedMode('cabinet'); setSelectedDate(''); setSelectedSlot(null); }} />
                      <div className="booking-mode-icon booking-mode-cabinet"><Building2 size={24} /></div>
                      <div>
                        <h4>En cabinet</h4>
                        <p className="text-sm text-muted">{therapist.location}</p>
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

            {/* ── Step 3: Date & Time (real slots) ── */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Date & heure</h2>
                <p className="booking-step-sub">Choisissez le créneau qui vous convient le mieux.</p>

                {availableDates.length === 0 ? (
                  <div className="booking-note" style={{ marginTop: 'var(--space-5)' }}>
                    <AlertCircle size={14} />
                    <span>Aucun créneau disponible pour ce mode. Le thérapeute n'a pas encore publié de disponibilités.</span>
                  </div>
                ) : (
                  <>
                    <label className="label" style={{ marginTop: 'var(--space-4)' }}>Jour de consultation</label>
                    <div className="booking-days-grid">
                      {availableDates.map(dateKey => (
                        <button
                          key={dateKey}
                          className={`booking-day-btn ${selectedDate === dateKey ? 'selected' : ''}`}
                          onClick={() => { setSelectedDate(dateKey); setSelectedSlot(null); }}
                        >
                          <span className="booking-day-name">{formatDayLabel(dateKey)}</span>
                          <span className="booking-day-date">{formatDayDate(dateKey)}</span>
                        </button>
                      ))}
                    </div>

                    {selectedDate && (
                      <div className="animate-fade-in">
                        <label className="label" style={{ marginTop: 'var(--space-5)' }}>Heure disponible</label>
                        <div className="booking-times-grid">
                          {timeSlotsForDate.map(slot => (
                            <button
                              key={slot.id}
                              className={`booking-time-btn ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {formatTime(slot.session_date)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Motif + Notes */}
                <div className="booking-optional" style={{ marginTop: 'var(--space-6)' }}>
                  <label className="label">Motif de consultation (facultatif)</label>
                  <select className="select" value={reason} onChange={e => setReason(e.target.value)}>
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

            {/* ── Step 4: Summary ── */}
            {step === 4 && service && (
              <div className="animate-fade-in">
                <h2 className="booking-step-title">Récapitulatif</h2>
                <p className="booking-step-sub">Vérifiez les détails de votre réservation avant de confirmer.</p>

                <div className="booking-summary">
                  <div className="booking-summary-therapist">
                    <div className="avatar avatar-md">{initials}</div>
                    <div>
                      <p className="font-bold">{therapist.name}</p>
                      <p className="text-sm text-muted">{therapist.specialization}</p>
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
                        {selectedMode === 'online' ? '🎥 En ligne' : '🏥 En cabinet'}
                      </span>
                    </div>
                    <div className="booking-summary-row">
                      <span>Date & heure</span>
                      <span className="font-semibold">
                        {selectedSlot
                          ? new Date(selectedSlot.session_date).toLocaleString('fr-FR', {
                              weekday: 'long', day: 'numeric', month: 'long',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '—'}
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

            {/* Navigation */}
            <div className="booking-nav">
              <button className="btn btn-outline" onClick={handleBack}>
                <ChevronLeft size={16} />
                {step === 1 ? 'Retour' : 'Précédent'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
              >
                {step === 4 ? (
                  <><Check size={16} /> Confirmer & envoyer</>
                ) : (
                  <>Suivant <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="booking-aside">
          <div className="booking-aside-card card">
            <div className="booking-aside-header">
              <div className="avatar avatar-lg">{initials}</div>
              <div>
                <p className="font-bold" style={{ fontSize: 'var(--font-size-base)' }}>{therapist.name}</p>
                <p className="text-sm text-muted">{therapist.specialization}</p>
              </div>
            </div>
            {availableDates.length > 0 && (
              <div className="booking-aside-avail">
                <span className="avail-dot" />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                  {availableDates.length} jour{availableDates.length > 1 ? 's' : ''} disponible{availableDates.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

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
                  {selectedDate && selectedSlot && (
                    <div className="booking-aside-row">
                      <span>Créneau</span>
                      <span>{formatDayLabel(selectedDate)} · {formatTime(selectedSlot.session_date)}</span>
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
