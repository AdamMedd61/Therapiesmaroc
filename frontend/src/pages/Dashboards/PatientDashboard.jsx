import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Video, FileText, BookOpen, Settings, Sparkles, Clock, MapPin, Download, Play, CheckCircle2, TrendingUp, MessageSquare } from 'lucide-react';
import './PatientDashboard.css';

const upcomingSessions = [
  {
    id: '1',
    therapist: 'Dr. Salma Benkirane',
    therapistAvatar: null,
    type: 'Consultation individuelle',
    date: '14 Nov 2026',
    time: '14:00',
    mode: 'online',
    status: 'confirmé',
  },
  {
    id: '2',
    therapist: 'Dr. Youssef Alami',
    therapistAvatar: null,
    type: 'Suivi psychologique',
    date: '17 Nov 2026',
    time: '16:00',
    mode: 'cabinet',
    status: 'confirmé',
  },
];

const myTherapists = [
  { id: '1', name: 'Dr. Salma Benkirane', title: 'Psychologue Clinicienne' },
  { id: '2', name: 'Dr. Youssef Alami', title: 'Psychiatre' },
];

const advisingCourses = [
  {
    id: '1',
    title: 'Gérer l\'anxiété au quotidien',
    author: 'Dr. Salma Benkirane',
    price: 250,
    duration: '2 heures',
    enrolled: false,
  },
  {
    id: '2',
    title: 'Communication en couple',
    author: 'Dr. Youssef Alami',
    price: 350,
    duration: '3 heures',
    enrolled: true,
  },
];

const recentFiles = [
  { id: '1', name: 'Notes de séance - Nov.pdf', therapist: 'Dr. Salma Benkirane', date: '10 Nov' },
  { id: '2', name: 'Exercices de respiration.pdf', therapist: 'Dr. Salma Benkirane', date: '15 Oct' },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sessions');

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
                <span className="stat-value">2</span>
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
              {upcomingSessions.map(session => (
                <div key={session.id} className="card session-card">
                  <div className="session-card-main">
                    <div className="avatar avatar-lg">
                      {session.therapistAvatar ? (
                        <img src={session.therapistAvatar} alt={session.therapist} />
                      ) : (
                        <span>{session.therapist.split(' ').map(n => n[0]).join('')}</span>
                      )}
                    </div>
                    <div className="session-info">
                      <h3>{session.therapist}</h3>
                      <p className="session-type">{session.type}</p>
                      <div className="session-meta">
                        <span className="badge badge-outline"><Calendar size={12} /> {session.date}</span>
                        <span className="badge badge-outline"><Clock size={12} /> {session.time}</span>
                        {session.mode === 'online' ? (
                          <span className="badge badge-primary"><Video size={12} /> Vidéo</span>
                        ) : (
                          <span className="badge badge-accent"><MapPin size={12} /> En cabinet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="session-actions">
                    {session.mode === 'online' && (
                      <button className="btn btn-primary btn-full" onClick={() => navigate(`/appel?with=${encodeURIComponent(session.therapist)}&type=${encodeURIComponent(session.type)}`)}>
                        <Video size={16} /> Rejoindre l'appel
                      </button>
                    )}
                    <div className="session-actions-row">
                      <button className="btn btn-outline flex-1">Déplacer</button>
                      <button className="btn btn-outline flex-1 text-danger">Annuler</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
