import { useRef, useState } from 'react';
import { Sparkles, Upload, RefreshCw, Scissors, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { Spinner } from '../../components/ui/Primitives';

export default function AIHairstyle() {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);

    const fd = new FormData();
    fd.append('selfie', file);
    try {
      const { data } = await api.post('/ai/hairstyle', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data.result);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="label-eyebrow justify-center flex items-center gap-1.5"><Sparkles size={13} /> AI Powered</p>
        <h1 className="mt-1 font-display text-3xl text-warmwhite">Find your next hairstyle</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-soft">
          Upload a clear front-facing selfie and we'll suggest cuts, beard styles, and colors matched to your face shape.
        </p>
      </div>

      <div className="glass-panel mt-8 flex flex-col items-center gap-5 p-8">
        <div
          onClick={() => fileRef.current.click()}
          className="flex h-48 w-48 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold/30 bg-charcoal/50 transition-colors hover:border-gold/60"
        >
          {preview ? (
            <img src={preview} alt="Your selfie" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-soft">
              <Upload size={22} />
              <span className="text-xs">Upload a selfie</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        <button onClick={() => fileRef.current.click()} className="btn-gold">
          {preview ? <RefreshCw size={15} /> : <Upload size={15} />} {preview ? 'Try another photo' : 'Choose a photo'}
        </button>
        <p className="text-center text-[11px] text-slate-soft/70 max-w-sm">
          This is an illustrative AI preview — recommendations are for inspiration. Share the result with your barber for a precise consultation.
        </p>
      </div>

      {loading && <Spinner label="Analyzing your face shape" />}

      {result && (
        <div className="mt-8 flex flex-col gap-6 animate-fadeInUp">
          <div className="glass-panel p-6 text-center">
            <p className="label-eyebrow justify-center flex">Detected face shape</p>
            <h2 className="mt-1 font-display text-3xl text-gold">{result.faceShape}</h2>
            <p className="mt-1 text-xs text-slate-soft">{result.confidence}% match confidence</p>
          </div>

          <div className="glass-panel p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite"><Scissors size={16} className="text-gold" /> Recommended hairstyles</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.hairstyleRecommendations.map((h) => (
                <div key={h.name} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                  <span className="text-sm text-warmwhite">{h.name}</span>
                  <span className="text-xs font-medium text-gold">{h.matchScore}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="glass-panel p-6">
              <h3 className="font-display text-lg text-warmwhite">Beard styles to try</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.beardStyleRecommendations.map((b) => (
                  <span key={b} className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs text-gold">{b}</span>
                ))}
              </div>
            </div>
            <div className="glass-panel p-6">
              <h3 className="flex items-center gap-2 font-display text-lg text-warmwhite"><Palette size={16} className="text-gold" /> Suggested hair color</h3>
              <div className="mt-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full border border-white/20" style={{ backgroundColor: result.recommendedHairColor.hex }} />
                <span className="text-sm text-warmwhite">{result.recommendedHairColor.name}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-soft">{result.note}</p>
        </div>
      )}
    </div>
  );
}
