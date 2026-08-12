import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Clock, IndianRupee, CalendarDays, Scissors, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner, EmptyState } from '../../components/ui/Primitives';

const STEP_LABELS = ['Service', 'Barber', 'Date & Time', 'Confirm'];

const nextNDates = (n) => {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
};

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const salonId = params.get('salonId');

  const [step, setStep] = useState(0);
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serviceId, setServiceId] = useState(params.get('serviceId') || '');
  const [barberId, setBarberId] = useState(params.get('barberId') || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dates = useMemo(() => nextNDates(14), []);

  useEffect(() => {
    if (!salonId) return;
    api
      .get(`/salons/${salonId}`)
      .then(({ data }) => {
        setSalon(data.salon);
        setServices(data.services);
        setBarbers(data.barbers);
        if (serviceId && !barberId) setStep(1);
        if (serviceId && barberId) setStep(2);
      })
      .catch(() => toast.error('Could not load salon details'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  useEffect(() => {
    if (step !== 2 || !barberId || !date || !serviceId) return;
    setSlotsLoading(true);
    setStartTime('');
    api
      .get('/slots/available', { params: { barberId, date, serviceId } })
      .then(({ data }) => setAvailableSlots(data.slots))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [step, barberId, date, serviceId]);

  if (!salonId) {
    return <EmptyState title="Pick a salon first" message="Head to search to choose where you'd like to book." />;
  }
  if (loading) return <Spinner label="Preparing your booking" />;

  const selectedService = services.find((s) => s._id === serviceId);
  const selectedBarber = barbers.find((b) => b._id === barberId);

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const confirmBooking = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        salonId,
        barberId,
        serviceId,
        date,
        startTime,
        notes,
      });
      toast.success('Booking created — complete payment to confirm your slot');
      navigate(`/payment/${data.booking._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="label-eyebrow">{salon.name}</p>
      <h1 className="mt-1 font-display text-3xl text-warmwhite">Book your appointment</h1>

      {/* Stepper */}
      <div className="mt-8 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
              i < step ? 'border-gold bg-gold text-ink' : i === step ? 'border-gold text-gold' : 'border-white/15 text-slate-soft'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`hidden text-xs sm:block ${i <= step ? 'text-warmwhite' : 'text-slate-soft'}`}>{label}</span>
            {i < STEP_LABELS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-gold' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-panel mt-8 p-6">
        {/* Step 0: Service */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg text-warmwhite">Choose a service</h2>
            {services.map((s) => (
              <button
                key={s._id}
                onClick={() => { setServiceId(s._id); }}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                  serviceId === s._id ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <p className="font-medium text-warmwhite">{s.name}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-slate-soft">
                    <span className="flex items-center gap-1"><IndianRupee size={11} />{s.price}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{s.durationMinutes} min</span>
                  </p>
                </div>
                {serviceId === s._id && <Check className="text-gold" size={18} />}
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Barber */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg text-warmwhite">Choose your barber</h2>
            {barbers.map((b) => (
              <button
                key={b._id}
                onClick={() => setBarberId(b._id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  barberId === b._id ? 'border-gold/60 bg-gold/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {b.photo?.url ? (
                  <img src={b.photo.url} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-charcoal text-gold"><Scissors size={16} /></span>
                )}
                <div className="flex-1">
                  <p className="font-medium text-warmwhite">{b.name}</p>
                  <p className="text-xs text-slate-soft">{b.experienceYears} yrs experience</p>
                </div>
                {barberId === b._id && <Check className="text-gold" size={18} />}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-lg text-warmwhite">Pick a date</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => {
                const iso = d.toISOString().slice(0, 10);
                const isActive = date === iso;
                return (
                  <button
                    key={iso}
                    onClick={() => setDate(iso)}
                    className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                      isActive ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft hover:border-white/25'
                    }`}
                  >
                    <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="mt-0.5 text-sm font-semibold text-warmwhite">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {date && (
              <div className="mt-6">
                <h3 className="flex items-center gap-1.5 font-display text-base text-warmwhite">
                  <CalendarDays size={15} className="text-gold" /> Available times
                </h3>
                {slotsLoading ? (
                  <Spinner label="Checking availability" />
                ) : availableSlots.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-soft">No open slots for this date. Try another day.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableSlots.map((s) => (
                      <button
                        key={s.startTime}
                        onClick={() => setStartTime(s.startTime)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          startTime === s.startTime ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-slate-soft hover:border-white/25'
                        }`}
                      >
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-lg text-warmwhite">Review & confirm</h2>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-soft">Salon</span><span className="text-warmwhite">{salon.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-soft">Service</span><span className="text-warmwhite">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-soft">Barber</span><span className="text-warmwhite">{selectedBarber?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-soft">Date</span><span className="text-warmwhite">{date}</span></div>
              <div className="flex justify-between"><span className="text-slate-soft">Time</span><span className="text-warmwhite">{startTime}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-slate-soft">Total</span><span className="font-semibold text-gold">₹{selectedService?.price}</span></div>
            </div>
            <label className="mt-4 flex flex-col gap-1.5 text-sm">
              <span className="text-slate-soft">Notes for the barber (optional)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="input-field" placeholder="Any preferences we should know about?" />
            </label>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-7 flex justify-between border-t border-white/5 pt-5">
          <button onClick={goBack} disabled={step === 0} className="btn-outline !px-4 disabled:opacity-0">
            <ChevronLeft size={15} /> Back
          </button>
          {step < 3 ? (
            <button
              onClick={goNext}
              disabled={(step === 0 && !serviceId) || (step === 1 && !barberId) || (step === 2 && !startTime)}
              className="btn-gold"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={confirmBooking} disabled={submitting} className="btn-gold">
              {submitting ? 'Booking…' : 'Confirm & Continue to Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
