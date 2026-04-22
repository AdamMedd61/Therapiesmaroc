import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import './PaymentSuccess.css';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const sessionId  = searchParams.get('session_id');
    const requestId  = searchParams.get('request_id');

    if (!sessionId || !requestId) {
      setStatus('error');
      return;
    }

    api.post('/payments/confirm-checkout', {
      session_id:  sessionId,
      request_id:  requestId,
    })
      .then(() => {
        setStatus('success');
        toast.success('Paiement confirmé ! Séance réservée. 🎉');
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, []);

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">

        {status === 'loading' && (
          <>
            <Loader2 size={56} className="spin success-icon loading" />
            <h2>Confirmation en cours...</h2>
            <p>Veuillez patienter quelques secondes.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon-wrap success">
              <CheckCircle2 size={56} />
            </div>
            <h2>Paiement confirmé !</h2>
            <p>Votre séance est maintenant réservée. Vous pouvez consulter les détails dans vos réservations.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 24, padding: '12px 32px' }}
              onClick={() => navigate('/reservations')}
            >
              Voir mes réservations
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="success-icon-wrap error">
              <XCircle size={56} />
            </div>
            <h2>Une erreur est survenue</h2>
            <p>Le paiement n'a pas pu être confirmé. Veuillez contacter le support ou réessayer.</p>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 24 }}
              onClick={() => navigate('/reservations')}
            >
              Retour aux réservations
            </button>
          </>
        )}

      </div>
    </div>
  );
}
