import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
  Monitor, MoreVertical, Clock, Shield, Maximize2, Minimize2,
  Send, X, Users
} from 'lucide-react';
import './VideoCallPage.css';

export default function VideoCallPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const participantName = searchParams.get('with') || 'Participant';
  const sessionType = searchParams.get('type') || 'Consultation individuelle';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'system', text: 'La séance a commencé. Tout ce qui est partagé ici est strictement confidentiel.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [callStatus, setCallStatus] = useState('connecting'); // connecting | active | ended

  const containerRef = useRef(null);

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => setCallStatus('active'), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Timer
  useEffect(() => {
    if (callStatus !== 'active') return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'me',
      text: chatInput.trim(),
    }]);
    setChatInput('');
    // Simulate response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'other',
        text: 'Merci pour votre message. Continuons la séance.',
      }]);
    }, 2500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const displayName = user?.name || 'Vous';
  const initials = participantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const myInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Call ended screen
  if (callStatus === 'ended') {
    return (
      <div className="vc-page">
        <div className="vc-ended animate-fade-in-up">
          <div className="vc-ended-icon">
            <PhoneOff size={48} />
          </div>
          <h1>Séance terminée</h1>
          <p className="text-muted text-lg">
            Durée de l'appel : <strong>{formatTime(elapsed)}</strong>
          </p>
          <div className="vc-ended-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate(-1)}>
              Retour au tableau de bord
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/messagerie')}>
              <MessageSquare size={18} /> Envoyer un message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-page" ref={containerRef}>

      {/* Top Bar */}
      <div className="vc-topbar">
        <div className="vc-topbar-left">
          <div className="vc-secure-badge">
            <Shield size={14} />
            <span>Chiffré de bout en bout</span>
          </div>
          <span className="vc-session-type">{sessionType}</span>
        </div>
        <div className="vc-topbar-center">
          {callStatus === 'active' && (
            <div className="vc-timer">
              <span className="vc-rec-dot" />
              <Clock size={14} />
              <span>{formatTime(elapsed)}</span>
            </div>
          )}
          {callStatus === 'connecting' && (
            <div className="vc-connecting-label">
              <span className="vc-pulse" />
              Connexion en cours...
            </div>
          )}
        </div>
        <div className="vc-topbar-right">
          <button className="vc-icon-btn" onClick={toggleFullscreen} title="Plein écran">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className={`vc-video-area ${showChat ? 'with-chat' : ''}`}>

        {/* Main Video (Remote) */}
        <div className="vc-main-video">
          {callStatus === 'connecting' ? (
            <div className="vc-connecting">
              <div className="vc-avatar-lg animate-pulse-slow">
                {initials}
              </div>
              <p>Appel de <strong>{participantName}</strong>...</p>
              <div className="vc-loader" />
            </div>
          ) : (
            <div className="vc-participant-placeholder">
              <div className="vc-avatar-lg">
                {initials}
              </div>
              <p className="vc-participant-name">{participantName}</p>
              <span className="vc-participant-status">Connecté</span>
            </div>
          )}
        </div>

        {/* Self Video (PiP) */}
        <div className={`vc-self-video ${isVideoOff ? 'video-off' : ''}`}>
          {isVideoOff ? (
            <div className="vc-self-avatar">
              <VideoOff size={20} />
            </div>
          ) : (
            <div className="vc-self-placeholder">
              <span>{myInitials}</span>
            </div>
          )}
          <div className="vc-self-label">{displayName}</div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="vc-chat animate-slide-in">
            <div className="vc-chat-header">
              <h3>Discussion</h3>
              <button className="vc-icon-btn" onClick={() => setShowChat(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="vc-chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`vc-chat-msg ${msg.sender}`}>
                  {msg.sender === 'system' ? (
                    <div className="vc-chat-system">
                      <Shield size={12} /> {msg.text}
                    </div>
                  ) : (
                    <>
                      <div className="vc-chat-bubble">{msg.text}</div>
                      <span className="vc-chat-time">
                        {msg.sender === 'me' ? 'Vous' : participantName}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <form className="vc-chat-input" onSubmit={handleSendChat}>
              <input
                type="text"
                placeholder="0crire un message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="vc-send-btn" disabled={!chatInput.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="vc-controls">
        <div className="vc-controls-inner">
          <div className="vc-controls-group">
            <button
              className={`vc-ctrl-btn ${isMuted ? 'active' : ''}`}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Activer le micro' : 'Couper le micro'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? 'Muet' : 'Micro'}</span>
            </button>
            <button
              className={`vc-ctrl-btn ${isVideoOff ? 'active' : ''}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              <span>{isVideoOff ? 'Caméra off' : 'Caméra'}</span>
            </button>
            <button
              className={`vc-ctrl-btn ${isScreenSharing ? 'sharing' : ''}`}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              title="Partager l'écran"
            >
              <Monitor size={20} />
              <span>0cran</span>
            </button>
            <button
              className={`vc-ctrl-btn ${showChat ? 'active' : ''}`}
              onClick={() => setShowChat(!showChat)}
              title="Chat"
            >
              <MessageSquare size={20} />
              <span>Chat</span>
            </button>
          </div>

          <button className="vc-end-btn" onClick={handleEndCall} title="Terminer l'appel">
            <PhoneOff size={22} />
            <span>Terminer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
