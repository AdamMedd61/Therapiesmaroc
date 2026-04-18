import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Video, Building2, Star, Clock, Shield, MessageCircle, Calendar, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { therapists } from '../../data/therapists';
import './TherapistProfilePage.css';

const TABS = [
  { id: 'about',    label: 'À propos' },
  { id: 'services', label: 'Services & tarifs' },
  { id: 'schedule', label: 'Disponibilités' },
  { id: 'reviews',  label: 'Avis patients' },
];

export default function TherapistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [selectedSlotDay, setSelectedSlotDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

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

  const getDayDateLabel = (dayName, offset) => {
    const dayMap = { 'Lun': 1, 'Mar': 2, 'Mer': 3, 'Jeu': 4, 'Ven': 5, 'Sam': 6, 'Dim': 7 };
    const dayIndex = dayMap[dayName] || 1;
    const d = new Date();
    d.setHours(0, 0, 0, 0); const todayDay = d.getDay() || 7;
    d.setDate(d.getDate() - todayDay + dayIndex + (offset * 7));
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const therapist = therapists.find(t => t.id === id) || therapists[0];

  const initials = therapist.name.split(' ').slice(-2).map(n => n[0]).join('');

  return (
    <div className="profile-page">
      {/* Back */}
      <div className="container">
        <button className="btn btn-ghost btn-sm profile-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          Retour aux thérapeutes
        </button>
      </div>

      {/* ── SECTION ── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="container profile-hero-inner">
          <div className="profile-avatar-wrap">
            <div className="avatar avatar-2xl profile-avatar">{initials}</div>
            {therapist.verified && (
              <div className="profile-verified-badge" title="Thérapeute vérifié">
                <Shield size={14} />
              </div>
            )}
          </div>

          <div className="profile-hero-info">
            <div className="profile-hero-name-row">
              <h1 className="profile-name">{therapist.name}</h1>
              {therapist.verified && (
                <span className="badge badge-success">
                  <Shield size={10} />
                  Vérifié
                </span>
              )}
            </div>
            <p className="profile-title-text">{therapist.title}</p>

            <div className="profile-meta-row">
              <span className="profile-meta-item">
                <MapPin size={14} />
                {therapist.city}
              </span>
              <span className="profile-meta-item">
                <Clock size={14} />
                {therapist.yearsExperience} ans d'expérience
              </span>
              <span className="profile-meta-item">
                <Globe size={14} />
                {therapist.languages.join(', ')}
              </span>
            </div>

            <div className="profile-rating-row">
              <div className="profile-stars">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    size={16}
                    fill={i <= Math.round(therapist.rating) ? '#F4A623' : 'none'}
                    stroke={i <= Math.round(therapist.rating) ? '#F4A623' : '#D8D8D8'}
                  />
                ))}
              </div>
              <span className="profile-rating-val">{therapist.rating.toFixed(1)}</span>
              <span className="profile-rating-count">({therapist.reviewCount} avis)</span>
            </div>

            <div className="profile-specialties">
              {therapist.specialties.map(s => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>

            <div className="profile-modes">
              {therapist.modes.includes('online') && (
                <span className="profile-mode">
                  <Video size={14} /> En ligne
                </span>
              )}
              {therapist.modes.includes('cabinet') && (
                <span className="profile-mode">
                  <Building2 size={14} /> En cabinet · {therapist.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION ── */}
      <div className="container profile-body">
        {/* Main col */}
        <div className="profile-main">
          {/* Tabs */}
          <div className="tabs-list">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="profile-tab-content">

            {/* ── SECTION ── */}
            {activeTab === 'about' && (
              <div className="animate-fade-in">
                <div className="profile-section">
                  <h3 className="profile-section-title">À propos</h3>
                  {therapist.bio.split('\n\n').map((para, i) => (
                    <p key={i} style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
                      {para}
                    </p>
                  ))}
                </div>

                <div className="profile-section">
                  <h3 className="profile-section-title">Approche thérapeutique</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                    {therapist.approach}
                  </p>
                </div>

                <div className="profile-section">
                  <h3 className="profile-section-title">Formation & certifications</h3>
                  <ul className="profile-edu-list">
                    {therapist.education.map((edu, i) => (
                      <li key={i} className="profile-edu-item">
                        <div className="profile-edu-dot" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ── SECTION ── */}
            {activeTab === 'services' && (
              <div className="animate-fade-in">
                <div className="profile-services">
                  {therapist.services.map(service => (
                    <div key={service.id} className="profile-service-card card">
                      <div className="profile-service-header">
                        <div>
                          <h4 className="profile-service-name">{service.name}</h4>
                          <p className="profile-service-dur">{service.duration} minutes</p>
                        </div>
                        <div className="profile-service-price">{service.price} MAD</div>
                      </div>
                      <div className="profile-service-modes">
                        {service.modes.includes('online') && (
                          <span className="badge badge-primary"><Video size={11} /> En ligne</span>
                        )}
                        {service.modes.includes('cabinet') && (
                          <span className="badge badge-neutral"><Building2 size={11} /> En cabinet</span>
                        )}
                      </div>
                      <Link to={`/reserver/${therapist.id}`} className="btn btn-primary">
                        Réserver cette séance
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* ── SECTION : Disponibilités ── */}
            {activeTab === 'schedule' && (
              <div className="animate-fade-in">
                <div className="profile-section">
                  <h3 className="profile-section-title">Disponibilités cette semaine</h3>

                  {/* Week navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
                      disabled={weekOffset === 0}
                    >
                      <ChevronLeft size={16} /> Semaine précédente
                    </button>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {getWeekLabel(weekOffset)}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setWeekOffset(o => o + 1)}
                    >
                      Semaine suivante <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Slots table */}
                  {therapist.availableSlots && therapist.availableSlots.length > 0 ? (
                    <div className="profile-slots-grid" style={{ gridTemplateColumns: `repeat(${therapist.availableSlots.length}, 1fr)` }}>
                      {therapist.availableSlots.map(dayObj => (
                        <div key={dayObj.day} className="profile-day-col">
                          <div className={`profile-day-header ${selectedSlotDay === dayObj.day ? 'active' : ''}`}>
                            <span className="profile-day-name">{dayObj.day}</span>
                            <span className="profile-day-date">{getDayDateLabel(dayObj.day, weekOffset)}</span>
                          </div>
                          <div className="profile-slots">
                            {dayObj.slots.map(slot => (
                              <button
                                key={slot}
                                className={`profile-slot ${
                                  selectedSlotDay === dayObj.day && selectedSlot === slot ? 'selected' : ''
                                }`}
                                onClick={() => {
                                  setSelectedSlotDay(dayObj.day);
                                  setSelectedSlot(slot);
                                }}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      Aucun créneau disponible pour cette semaine.
                    </p>
                  )}

                  {/* Booking CTA after slot selection */}
                  {selectedSlot && (
                    <div className="profile-slot-cta animate-fade-in">
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Créneau sélectionné : <strong>{selectedSlotDay} à {selectedSlot}</strong>
                      </p>
                      <Link
                        to={`/reserver/${therapist.id}?day=${selectedSlotDay}&time=${selectedSlot}`}
                        className="btn btn-primary"
                      >
                        <Calendar size={16} />
                        Réserver ce créneau
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION ── */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                <div className="profile-reviews-summary">
                  <div className="profile-reviews-big">
                    <span className="profile-reviews-score">{therapist.rating.toFixed(1)}</span>
                    <div>
                      <div className="profile-stars">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={18} fill="#F4A623" stroke="#F4A623" />
                        ))}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {therapist.reviewCount} avis vérifiés
                      </p>
                    </div>
                  </div>
                </div>

                <div className="profile-reviews">
                  {therapist.reviews.map(review => (
                    <div key={review.id} className="profile-review card">
                      <div className="profile-review-header">
                        <div>
                          <p className="profile-review-author">{review.author}</p>
                          <p className="profile-review-date">{review.date}</p>
                        </div>
                        <div className="profile-stars">
                          {[1,2,3,4,5].map(i => (
                            <Star
                              key={i}
                              size={13}
                              fill={i <= review.rating ? '#F4A623' : 'none'}
                              stroke={i <= review.rating ? '#F4A623' : '#D8D8D8'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="profile-review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-booking-card card">
            <div className="profile-avail-row">
              <span className="avail-dot" />
              <span className="profile-avail-text">{therapist.availability}</span>
            </div>

            <Link to={`/reserver/${therapist.id}`} className="btn btn-primary btn-full btn-lg">
              <Calendar size={18} />
              Réserver une séance
            </Link>

            <button className="btn btn-outline btn-full">
              <MessageCircle size={16} />
              Envoyer un message
            </button>

            <hr className="divider" />

            <div className="profile-booking-info">
              <div className="profile-booking-info-row">
                <span className="profile-booking-info-label">Modes</span>
                <span className="profile-booking-info-val">
                  {therapist.modes.map(m => m === 'online' ? 'En ligne' : 'En cabinet').join(' · ')}
                </span>
              </div>
              <div className="profile-booking-info-row">
                <span className="profile-booking-info-label">Langues</span>
                <span className="profile-booking-info-val">{therapist.languages.join(', ')}</span>
              </div>
              <div className="profile-booking-info-row">
                <span className="profile-booking-info-label">Expérience</span>
                <span className="profile-booking-info-val">{therapist.yearsExperience} ans</span>
              </div>
              {therapist.address && (
                <div className="profile-booking-info-row">
                  <span className="profile-booking-info-label">Adresse</span>
                  <span className="profile-booking-info-val">{therapist.address}</span>
                </div>
              )}
            </div>

            <div className="profile-trust-note">
              <Shield size={14} />
              <span>Thérapeute vérifié par TherapiesMaroc</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
