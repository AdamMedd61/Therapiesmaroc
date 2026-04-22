import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard, CalendarCheck, Clock, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import './PaymentPage.css';

export default function PaymentPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(true);
  const [redirecting, setRedirecting]   = useState(false);
  const [bookingInfo, setBookingInfo]   = useState(null);
  const [amount, setAmount]             = useState(0);

  useEffect(() => {
    api.get(`/requests/${requestId}`)
      .then(res => {
        setBookingInfo(res.data);
        setAmount(Number(res.data.service?.price || 0));
      })
      .catch(() => {
        toast.error('Impossible de charger la réservation.');
        navigate('/reservations');
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  const handlePay = async () => {
    setRedirecting(true);
    try {
      const res = await api.post('/payments/checkout', { request_id: requestId });
      window.location.href = res.data.checkout_url; // redirect to Stripe
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du paiement.');
      setRedirecting(false);
    }
  };

  const sessionDate = bookingInfo?.schedule?.session_date
    ? new Date(bookingInfo.schedule.session_date)
    : null;

  return (
    <div className="payment-page">
      <div className="payment-container">

        {/* ── Left: Summary ── */}
        <div className="payment-summary-panel">
          <button className="btn btn-ghost btn-sm payment-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Retour
          </button>

          <div className="payment-brand">
            <ShieldCheck size={32} className="payment-brand-icon" />
            <h1>TherapiesMaroc</h1>
            <p>Paiement sécurisé par Stripe</p>
          </div>

          {bookingInfo && (
            <div className="payment-booking-info">
              <h3>{bookingInfo.service?.name || 'Consultation'}</h3>
              <div className="payment-booking-rows">
                {sessionDate && (
                  <>
                    <div className="payment-booking-row">
                      <span><CalendarCheck size={14} /> Date</span>
                      <strong>{sessionDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                    </div>
                    <div className="payment-booking-row">
                      <span><Clock size={14} /> Heure</span>
                      <strong>{sessionDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </>
                )}
                <div className="payment-booking-row">
                  <span>Thérapeute</span>
                  <strong>{bookingInfo.therapist?.user?.name || '—'}</strong>
                </div>
              </div>
              <div className="payment-total">
                <span>Total</span>
                <span className="payment-total-amount">{amount.toFixed(2)} €</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Pay Button ── */}
        <div className="payment-form-panel">
          <h2>Finaliser la réservation</h2>
          <p className="payment-form-sub">
            Vous allez être redirigé vers la page de paiement sécurisée de Stripe.
          </p>

          {loading ? (
            <div className="payment-loading">
              <Loader2 size={32} className="spin" />
              <p>Chargement...</p>
            </div>
          ) : (
            <div className="payment-cta-box">
              <div className="payment-cta-amount">{amount.toFixed(2)} €</div>
              <p className="payment-cta-desc">
                Après le paiement, votre séance sera définitivement confirmée et le créneau réservé.
              </p>

              <button
                className="btn btn-primary checkout-pay-btn"
                onClick={handlePay}
                disabled={redirecting}
              >
                {redirecting
                  ? <><Loader2 size={18} className="spin" /> Redirection vers Stripe...</>
                  : <><CreditCard size={18} /> Payer {amount.toFixed(2)} € en toute sécurité <ExternalLink size={15} /></>
                }
              </button>

              <div className="checkout-test-note" style={{ marginTop: 12 }}>
                <ShieldCheck size={14} />
                Mode test — carte : <strong>4242 4242 4242 4242</strong> &nbsp;|&nbsp; Date : <strong>12/26</strong> &nbsp;|&nbsp; CVC : <strong>123</strong>
              </div>

              <p className="checkout-secure-note" style={{ marginTop: 16 }}>
                <ShieldCheck size={12} /> Paiement 100% sécurisé par Stripe. Vos données ne passent pas par nos serveurs.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
