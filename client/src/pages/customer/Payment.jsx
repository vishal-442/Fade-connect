import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, IndianRupee, CreditCard, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner } from '../../components/ui/Primitives';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api
      .get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => toast.error('Could not load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data: order } = await api.post('/payments/order', { bookingId });

      if (order.mock) {
        // Simulate a brief gateway round-trip, then auto-verify.
        await new Promise((r) => setTimeout(r, 900));
        const { data: verified } = await api.post('/payments/verify', {
          paymentId: order.paymentId,
          razorpay_order_id: order.order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock',
        });
        setSuccess(verified);
        toast.success('Payment successful!');
        return;
      }

      // Real Razorpay checkout (requires window.Razorpay script + live keys)
      const options = {
        key: order.keyId,
        amount: order.order.amount,
        currency: order.order.currency,
        order_id: order.order.id,
        name: 'Fade Connect',
        handler: async (response) => {
          const { data: verified } = await api.post('/payments/verify', {
            paymentId: order.paymentId,
            ...response,
          });
          setSuccess(verified);
          toast.success('Payment successful!');
        },
        theme: { color: '#D4AF37' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Spinner label="Loading your booking" />;
  if (!booking) return null;

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="text-gold" size={52} strokeWidth={1.2} />
        <h1 className="mt-5 font-display text-3xl text-warmwhite">Booking confirmed!</h1>
        <p className="mt-2 text-sm text-slate-soft">
          Invoice {success.payment.invoiceNumber} · ₹{success.payment.amount} paid
        </p>
        <div className="glass-panel mt-6 w-full p-5 text-left text-sm">
          <p className="text-warmwhite font-medium">{booking.service.name}</p>
          <p className="mt-1 text-slate-soft">{booking.salon.name} · {booking.date} at {booking.startTime}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate('/bookings')} className="btn-gold">View my bookings</button>
          <button onClick={() => navigate('/salons')} className="btn-outline">Book another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="text-center">
        <p className="label-eyebrow justify-center flex">Secure checkout</p>
        <h1 className="mt-1 font-display text-3xl text-warmwhite">Complete payment</h1>
      </div>

      <div className="glass-panel mt-8 p-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <p className="font-medium text-warmwhite">{booking.service.name}</p>
            <p className="mt-0.5 text-xs text-slate-soft">{booking.salon.name}</p>
          </div>
          <span className="text-xs text-slate-soft">{booking.date} · {booking.startTime}</span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-slate-soft">Amount payable</span>
          <span className="flex items-center font-display text-2xl text-gold"><IndianRupee size={18} />{booking.priceAtBooking}</span>
        </div>
        <button onClick={handlePay} disabled={paying} className="btn-gold w-full">
          <CreditCard size={16} /> {paying ? 'Processing…' : `Pay ₹${booking.priceAtBooking}`}
        </button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-soft">
          <ShieldCheck size={13} className="text-gold/70" /> Payments are securely processed via Razorpay
        </p>
      </div>
    </div>
  );
}
