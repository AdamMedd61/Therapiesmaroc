import { Link } from 'react-router-dom';
import { MapPin, Video, Building2, Star } from 'lucide-react';
import './TherapistCard.css';

export default function TherapistCard({ therapist }) {
  const initials = therapist.name.split(' ').slice(-2).map(n => n[0]).join('');

  return (
    <Link to={`/therapeutes/${therapist.id}`} className="tcard card card-hoverable">
      {therapist.rating >= 4.9 && (
        <div className="tcard-top-badge">
          <Star size={10} fill="currentColor" />
          Très recommandé
        </div>
      )}

      <div className="tcard-header">
        <div className="avatar avatar-lg tcard-avatar">{initials}</div>
        <div className="tcard-meta">
          <h3 className="tcard-name">{therapist.name}</h3>
          <p className="tcard-title">{therapist.title}</p>
          <div className="tcard-location">
            <MapPin size={12} />
            {therapist.city}
          </div>
        </div>
      </div>

      <div className="tcard-specialties">
        {therapist.specialties.slice(0, 3).map(s => (
          <span key={s} className="badge badge-primary">{s}</span>
        ))}
        {therapist.specialties.length > 3 && (
          <span className="badge badge-neutral">+{therapist.specialties.length - 3}</span>
        )}
      </div>

      <div className="tcard-modes">
        {therapist.modes.includes('online') && (
          <span className="tcard-mode">
            <Video size={13} />
            En ligne
          </span>
        )}
        {therapist.modes.includes('cabinet') && (
          <span className="tcard-mode">
            <Building2 size={13} />
            En cabinet
          </span>
        )}
      </div>

      <div className="tcard-footer">
        <div className="tcard-rating">
          <Star size={14} fill="#F4A623" stroke="#F4A623" />
          <span className="tcard-rating-val">{therapist.rating.toFixed(1)}</span>
          <span className="tcard-rating-count">({therapist.reviewCount})</span>
        </div>
        <div className="tcard-price">
          <span className="tcard-price-val">{therapist.price} MAD</span>
          <span className="tcard-price-label">/séance</span>
        </div>
      </div>

      <div className="tcard-avail">
        <span className="avail-dot" />
        <span>{therapist.availability}</span>
      </div>

      <div className="tcard-cta">
        Voir le profil
      </div>
    </Link>
  );
}
