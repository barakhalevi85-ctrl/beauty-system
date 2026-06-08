'use client';
import { useRef, useState } from 'react';
import { addCallLog } from '@/actions/crmActions';

export default function AddCallLogForm({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addCallLog(formData);
      formRef.current?.reset();
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירת השיחה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', marginBottom: '1.5rem' }}>
      <input type="hidden" name="clientId" value={clientId} />
      <input 
        type="text" 
        name="notes" 
        required 
        placeholder="הזן סיכום שיחה / הערה חדשה..." 
        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }}
      />
      <button 
        type="submit" 
        disabled={loading}
        style={{ padding: '0.75rem 1.5rem', background: 'var(--color-rose-gold)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? 'שומר...' : 'שמור הערה'}
      </button>
    </form>
  );
}
