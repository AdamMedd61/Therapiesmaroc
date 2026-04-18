import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-pattern" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#2D6A4F" />
              <path d="M8 14 Q14 8 20 14 Q14 20 8 14Z" fill="white" opacity="0.9" />
              <circle cx="14" cy="14" r="3" fill="white" />
            </svg>
            <span>Therapies<strong>Maroc</strong></span>
          </Link>
          <p className="footer-tagline">
            Votre santé mentale mérite le meilleur.<br />
            Trouvez un thérapeute certifié, où que vous soyez au Maroc.
          </p>
          <div className="footer-trust">
            <span className="badge badge-success">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0L9.5 5.5H16L11 8.5L12.5 14L8 11L3.5 14L5 8.5L0 5.5H6.5L8 0Z"/>
              </svg>
              +200 thérapeutes certifiés
            </span>
            <span className="badge badge-neutral">Données 100% sécurisées</span>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Plateforme</h4>
          <ul>
            <li><Link to="/therapeutes">Trouver un thérapeute</Link></li>
            <li><Link to="/inscription">Je suis thérapeute</Link></li>
            <li><a href="#comment-ca-marche">Comment ça marche</a></li>
            <li><Link to="/connexion">Se connecter</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Spécialités</h4>
          <ul>
            <li><Link to="/therapeutes">Anxiété & Stress</Link></li>
            <li><Link to="/therapeutes">Dépression</Link></li>
            <li><Link to="/therapeutes">Thérapie de couple</Link></li>
            <li><Link to="/therapeutes">Trauma & PTSD</Link></li>
            <li><Link to="/therapeutes">Adolescents</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Légal & Support</h4>
          <ul>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">Conditions d'utilisation</a></li>
            <li><a href="#">Cookies</a></li>
            <li><a href="#">Nous contacter</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2026 TherapiesMaroc.ma — Tous droits réservés</p>
          <p>Casablanca, Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
