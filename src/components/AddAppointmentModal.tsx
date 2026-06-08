'use client';

import { useState } from 'react';
import { addAppointment } from '@/app/actions';

export function AddAppointmentModal({ 
  onClose, 
  clients, 
  services 
}: { 
  onClose: () => void;
  clients: { id: string; name: string }[];
  services: { id: string; name: string }[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const clientId = formData.get('clientId') as string;
    const serviceId = formData.get('serviceId') as string;
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    
    const date = new Date(`${dateStr}T${timeStr}`);

    try {
      await addAppointment({
        clientId,
        serviceId: serviceId || undefined,
        date,
        status: 'מתוכנן'
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה בקביעת תור');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90%' }}>
        <h2>הוסף תור חדש</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>לקוח</label>
            <select name="clientId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
              <option value="" style={{ color: 'black' }}>בחר לקוח...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>טיפול (אופציונלי)</label>
            <select name="serviceId" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
              <option value="" style={{ color: 'black' }}>ללא</option>
              {services.map(s => (
                <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>תאריך</label>
              <input type="date" name="date" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', colorScheme: 'dark' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>שעה</label>
              <input type="time" name="time" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', colorScheme: 'dark' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
