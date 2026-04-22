import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Video, FileText, BookOpen, Settings, Sparkles, Clock, MapPin, Download, Play, CheckCircle2, TrendingUp, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import './PatientDashboard.css';

const upcomingSessions = [];

const myTherapists = [];

const advisingCourses = [];
const recentFiles = [];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sessions');
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setUpcomingSessions(res.data);
    } catch (err) {
      toast.error('Erreur de chargement des séances.');
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (id) => {
    if (!window.confirm('Voulez-vous annuler cette demande ?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Demande annulée.');
      fetchSessions();
    } catch (err) {
      toast.error('Erreur lors de l’annulation.');
    }
  };

  return (
    <div className="dashboard-page">
      {/* Hero / Header */}
      <div className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <div className="dashboard-welcome">
            <div className="badge badge-primary-light">
              <Sparkles size={14} /> De retour
            </div>
            <h1>Mon Espace Patient</h1>
            <p>Suivez votre parcours thérapeutique et gérez vos séances.</p>
          </div>
          <div className="dashboard-stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon-primary">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{upcomingSessions.length}</span>
                <span className="stat-label">Séances à venir</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-accent">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">12</span>
                <span className="stat-label">Séances terminées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Tabs Navigation */}
        <div className="dashboard-tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <Calendar size={18} /> Mes séances
          </button>
          <button 
            className={`tab-btn ${activeTab === 'therapists' ? 'active' : ''}`}
            onClick={() => setActiveTab('therapists')}
          >
            <Sparkles size={18} /> Mes thérapeutes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={18} /> Programmes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FileText size={18} /> Documents
          </button>
        </div>

        {/* Tab Content - Sessions */}
        {activeTab === 'sessions' && (
          <div className="dashboard-tab-content animate-fade-in-up">
            <div className="section-header">
              <h2>Prochaines consultations</h2>
              <p className="text-muted">Vos rendez-vous à venir et leur statut.</p>
            </div>
            
            <div className="sessions-list">
              {loading ? <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div> : upcomingSessions.map(session => (
                <div key={session.id} className="card session-card border" style={{ borderColor: session.status === 'accepted' ? 'var(--color-success)' : session.status === 'refused' ? 'var(--color-danger)' : 'var(--color-border)' }}>
                  <div className="session-card-main">
                    <div className="avatar avatar-lg">
                      <span>{(session.therapist?.user?.name || 'Inconnu').split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div className="session-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3>{session.therapist?.user?.name || 'Inconnu'}</h3>
                        {session.status === 'pending' && <span className="badge badge-warning-light">En attente</span>}
                        {session.status === 'accepted' && <span className="badge badge-success-light"><CheckCircle size={12}/> Acceptée</span>}
                        {session.status === 'refused' && <span className="badge badge-danger-light">Refusée</span>}
                      </div>
                      <p className="session-type">{session.schedule?.category || 'Consultation'}</p>
                      <div className="session-meta">
                        <span className="badge badge-outline"><Calendar size={12} /> {new Date(session.schedule?.session_date).toLocaleDateString('fr-FR')}</span>
                        <span className="badge badge-outline"><Clock size={12} /> {new Date(session.schedule?.session_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {session.schedule?.mode === 'online' ? (
                          <span className="badge badge-primary"><Video size={12} /> Vidéo</span>
                        ) : (
                          <span className="badge badge-accent"><MapPin size={12} /> En cabinet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="session-card-actions">
                    {session.schedule?.mode === 'online' && session.status === 'accepted' && (
                      <button className="btn btn-primary btn-full" onClick={() => navigate(`/appel?with=${encodeURIComponent(session.therapist?.user?.name)}`)}>
                        <Video size={16} /> Rejoindre l'appel
                      </button>
                    )}
                    
                    {session.status === 'pending' && (
                      <div className="session-actions-row">
                        <button className="btn btn-outline flex-1 text-danger" onClick={() => cancelRequest(session.id)}>
                          <Trash2 size={16} /> Annuler la demande
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!loading && upcomingSessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Aucune réservation pour le moment</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
                  Vous n'avez pas encore de séance planifiée. Trouvez un thérapeute et réservez votre première consultation.
                </p>
                <Link to="/therapeutes" className="btn btn-primary">
                  <Calendar size={16} /> Trouver un thérapeute
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Therapists */}
        {activeTab === 'therapists' && (
          <div className="dashboard-tab-content animate-fade-in-up">
            <div className="grid grid-2 gap-6">
              {myTherapists.map(t => (
                <div key={t.id} className="card therapist-card-mini">
                  <div className="therapist-card-mini-inner">
                    <div className="avatar avatar-xl">
                      <span>{t.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h3>{t.name}</h3>
                      <p>{t.title}</p>
                      <span className="badge badge-success-light mt-2"><CheckCircle2 size={12}/> Mon thérapeute</span>
                    </div>
                  </div>
                  <div className="actions-row mt-4 pt-4 border-t">
                    <Link to={`/therapeutes/${t.id}`} className="btn btn-outline flex-1">Voir profil</Link>
                    <Link to={`/reserver/${t.id}`} className="btn btn-primary flex-1">Réserver</Link>
                  </div>
                </div>
              ))}
            </div>
            {myTherapists.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Aucun thérapeute associé</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
                  Vous n'avez pas encore de thérapeute attitré. Explorez notre annuaire et prenez votre premier rendez-vous.
                </p>
                <Link to="/therapeutes" className="btn btn-primary">
                  <Sparkles size={16} /> Parcourir l'annuaire
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Courses */}
        {activeTab === 'courses' && (
          <div className="dashboard-tab-content animate-fade-in-up">
            <div className="courses-list space-y-4">
              {advisingCourses.map(course => (
                <div key={course.id} className="card course-card">
                  <div className="course-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="text-muted">{course.author}</p>
                    <div className="course-meta mt-2">
                      <span className="badge badge-outline"><Clock size={12}/> {course.duration}</span>
                      {course.enrolled && <span className="badge badge-success-light">Inscrit</span>}
                    </div>
                  </div>
                  <div className="course-actions">
                    <div className="course-price">{course.price === 0 ? 'Gratuit' : `${course.price} MAD`}</div>
                    {course.enrolled ? (
                      <button className="btn btn-outline"><Play size={16}/> Continuer</button>
                    ) : (
                      <button className="btn btn-primary">S'inscrire</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {advisingCourses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Aucun programme disponible</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 340, margin: '0 auto' }}>
                  Les programmes recommandés par vos thérapeutes apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content - Files */}
        {activeTab === 'files' && (
          <div className="dashboard-tab-content animate-fade-in-up">
            <div className="files-list bg-surface card p-0 overflow-hidden">
              {recentFiles.map(file => (
                <div key={file.id} className="file-row">
                  <div className="file-icon">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>{file.therapist} ⬢ {file.date}</p>
                  </div>
                  <button className="btn btn-outline btn-sm"><Download size={14}/> Télécharger</button>
                </div>
              ))}
            </div>
            {recentFiles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>Aucun document partagé</h3>
                <p style={{ color: 'var(--color-text-muted)', maxWidth: 340, margin: '0 auto' }}>
                  Les documents partagés par vos thérapeutes (notes, exercices, comptes rendus) apparaîtront ici.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="dashboard-quick-actions">
          <Link to="/therapeutes" className="quick-action-card">
            <div className="quick-action-icon gradient-primary"><Calendar size={24} color="#fff" /></div>
            <div>
              <h4>Nouvelle séance</h4>
              <p>Rechercher un thérapeute</p>
            </div>
          </Link>
          <Link to="/messagerie" className="quick-action-card">
            <div className="quick-action-icon gradient-accent"><MessageSquare size={24} color="#fff" /></div>
            <div>
              <h4>Messagerie</h4>
              <p>Échanger avec vos thérapeutes</p>
            </div>
          </Link>
          <Link to="/therapeutes" className="quick-action-card">
            <div className="quick-action-icon bg-gray"><Settings size={24} /></div>
            <div>
              <h4>Paramètres</h4>
              <p>Gérer mon compte</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
