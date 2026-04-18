import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Globe, Heart, Star, CheckCircle, Users, Award } from 'lucide-react';
import { therapists } from '../../data/therapists';
import TherapistCard from '../../components/TherapistCard';
import './HomePage.css';

export default function HomePage() {
  const featured = therapists.filter(t => t.rating >= 4.9).slice(0, 3);

  return (
    <div className="home">

      {/*  HERO  */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-bg-blur hero-bg-blur-1" />
        <div className="hero-bg-blur hero-bg-blur-2" />

        <div className="container hero-inner">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-eyebrow">
              <span className="avail-dot" />
              <span>+200 thérapeutes certifiés au Maroc</span>
            </div>

            <h1 className="hero-title">
              <span style={{ display: 'block' }}>Votre équilibre mental</span>
              <span className="hero-title-accent">à portée de main</span>
            </h1>

            <p className="hero-subtitle">
              Trouvez le thérapeute qui vous correspond parmi des professionnels certifiés
              à Casablanca, Rabat, Marrakech et partout au Maroc. En cabinet ou en ligne.
            </p>

            <div className="hero-actions">
              <Link to="/therapeutes" className="btn btn-primary btn-lg">
                Trouver mon thérapeute
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">+200</span>
                <span className="hero-stat-label">Thérapeutes certifiés</span>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat">
                <span className="hero-stat-value">5 000+</span>
                <span className="hero-stat-label">Séances réalisées</span>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat">
                <span className="hero-stat-value">4.9 / 5</span>
                <span className="hero-stat-label">Note moyenne</span>
              </div>
            </div>
          </div>

          <div className="hero-visual animate-fade-in delay-2">
            <div className="hero-card-stack">
              {/* Floating therapist card */}
              <div className="hero-card hero-card-main">
                <div className="hero-card-avatar">SB</div>
                <div className="hero-card-info">
                  <p className="hero-card-name">Dr. Salma Benkirane</p>
                  <p className="hero-card-title">Psychologue Clinicienne</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={12} fill="#F4A623" stroke="#F4A623" />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 4 }}>4.9 (138)</span>
                  </div>
                </div>
                <div className="hero-card-avail">
                  <span className="avail-dot" />
                  <span>Aujourd'hui</span>
                </div>
              </div>

              {/* Floating tags */}
              <div className="hero-float hero-float-1">
                <Shield size={14} />
                <span>Thérapeutes vérifiés</span>
              </div>
              <div className="hero-float hero-float-2">
                <Clock size={14} />
                <span>Réservation en 2 min</span>
              </div>
              <div className="hero-float hero-float-3">
                <Heart size={14} />
                <span>100% confidentiel</span>
              </div>

              {/* Background decoration */}
              <div className="hero-bg-circle" />
            </div>
          </div>
        </div>
      </section>

      {/*  TRUSTS SECTION  */}
      <section className="trust-bar">
        <p className="trust-label">Disponible dans vos villes :</p>
        <div className="marquee-track" aria-hidden="true">
          <div className="marquee-inner">
            {[...Array(3)].map((_, gi) =>
              ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Laâyoune', 'Guelmim', 'Dakhla', 'Tan-Tan', 'Ouarzazate', 'Errachidia', 'Zagora', 'Tiznit'].map(city => (
                <Link key={`${gi}-${city}`} to={`/therapeutes?ville=${city}`} className="marquee-city">
                  {city}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="section how-it-works" id="comment-ca-marche">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Simple & rapide</p>
            <h2 className="section-title">Commencer en 3 étapes</h2>
            <p className="section-subtitle">
              De la recherche à la première séance, nous rendons le processus aussi simple et serein que possible.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card animate-fade-in-up">
              <div className="step-number">01</div>
              <div className="step-icon-wrap step-icon-1">
                <Users size={28} />
              </div>
              <h3 className="step-title">Trouvez votre thérapeute</h3>
              <p className="step-desc">
                Parcourez notre annuaire de thérapeutes certifiés. Filtrez par spécialité, ville,
                langue ou tarif pour trouver le professionnel idéal.
              </p>
            </div>

            <div className="step-connector" />

            <div className="step-card animate-fade-in-up delay-1">
              <div className="step-number">02</div>
              <div className="step-icon-wrap step-icon-2">
                <Clock size={28} />
              </div>
              <h3 className="step-title">Réservez votre créneau</h3>
              <p className="step-desc">
                Choisissez la date, l'heure et le mode de consultation (en ligne ou en cabinet)
                directement depuis le profil du thérapeute.
              </p>
            </div>

            <div className="step-connector" />

            <div className="step-card animate-fade-in-up delay-2">
              <div className="step-number">03</div>
              <div className="step-icon-wrap step-icon-3">
                <Heart size={28} />
              </div>
              <h3 className="step-title">Démarrez votre parcours</h3>
              <p className="step-desc">
                Préparez-vous à votre séance et commencez votre chemin vers le bien-être,
                dans un espace totalement confidentiel et bienveillant.
              </p>
            </div>
          </div>

          <div className="steps-cta">
            <Link to="/therapeutes" className="btn btn-primary btn-lg">
              Commencer maintenant
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/*  FEATURED THERAPISTS  */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Nos meilleurs professionnels</p>
            <h2 className="section-title">Thérapeutes en vedette</h2>
            <p className="section-subtitle">
              Des professionnels de santé mentale hautement qualifiés, disponibles pour vous accompagner.
            </p>
          </div>

          <div className="featured-grid">
            {featured.map((therapist, i) => (
              <div key={therapist.id} className={`animate-fade-in-up delay-${i + 1}`}>
                <TherapistCard therapist={therapist} />
              </div>
            ))}
          </div>

          <div className="featured-cta">
            <Link to="/therapeutes" className="btn btn-outline btn-lg">
              Voir tous les thérapeutes
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/*  WHY US  */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-content">
              <p className="section-eyebrow">Pourquoi TherapiesMaroc</p>
              <h2 className="section-title">Une plateforme conçue<br />avec soin</h2>
              <p className="section-subtitle">
                Nous avons pensé chaque détail pour vous offrir une expérience de soin mentale
                sécurisée, accessible et profondément humaine.
              </p>

              <div className="why-features">
                {[
                  {
                    icon: <Shield size={20} />,
                    title: 'Thérapeutes vérifiés',
                    desc: 'Chaque professionnel est vérifié : diplômes, accréditations et identité contrôlés.'
                  },
                  {
                    icon: <Globe size={20} />,
                    title: 'En ligne & en cabinet',
                    desc: 'Consultez depuis chez vous ou rencontrez votre thérapeute en personne, selon votre confort.'
                  },
                  {
                    icon: <Award size={20} />,
                    title: 'Multilingue',
                    desc: 'Thérapeutes disponibles en Français, Arabe, Darija, Tamazight et Anglais.'
                  },
                  {
                    icon: <CheckCircle size={20} />,
                    title: 'Confidentialité absolue',
                    desc: 'Vos données et échanges sont protégés. Votre vie privée est notre priorité.'
                  },
                ].map((feat, i) => (
                  <div key={i} className="why-feature">
                    <div className="why-feature-icon">{feat.icon}</div>
                    <div>
                      <h4 className="why-feature-title">{feat.title}</h4>
                      <p className="why-feature-desc">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-visual">
              <div className="why-card-grid">
                <div className="why-stat-card why-stat-accent">
                  <span className="why-stat-num">98%</span>
                  <span className="why-stat-label">taux de satisfaction</span>
                </div>
                <div className="why-stat-card">
                  <span className="why-stat-num">48h</span>
                  <span className="why-stat-label">délai moyen de RDV</span>
                </div>
                <div className="why-stat-card">
                  <span className="why-stat-num">12+</span>
                  <span className="why-stat-label">villes couvertes</span>
                </div>
                <div className="why-stat-card why-stat-primary">
                  <span className="why-stat-num">5 000+</span>
                  <span className="why-stat-label">séances réalisées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  CTA BAND  */}
      <section className="cta-band">
        <div className="cta-band-bg" />
        <div className="container cta-band-inner">
          <div className="cta-band-content">
            <h2 className="cta-band-title">Prêt(e) à faire le premier pas ?</h2>
            <p className="cta-band-subtitle">
              Des milliers de personnes au Maroc ont déjà transformé leur vie grâce à TherapiesMaroc.
              C'est votre tour.
            </p>
          </div>
          <div className="cta-band-actions">
            <Link to="/therapeutes" className="btn btn-accent btn-lg">
              Trouver mon thérapeute
              <ArrowRight size={18} />
            </Link>
            <Link to="/inscription" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
