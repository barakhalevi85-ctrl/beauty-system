'use client';

import { useState } from 'react';
import { editAppointment } from '@/app/actions';

export function EditAppointmentModal({ 
  onClose, 
  services,
  appointment
}: { 
  onClose: () => void;
  services: { id: string; name: string }[];
  appointment: any;
}) {
  const [loading, setLoading] = useState(false);
  const [dateStr, setDateStr] = useState(new Date(appointment.date).toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState(new Date(appointment.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const serviceId = formData.get('serviceId') as string;
    
    const date = new Date(`${dateStr}T${timeStr}`);

    try {
      await editAppointment(appointment.id, {
        serviceId: serviceId || undefined,
        date
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה בעדכון התור');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
        <h2>עריכת תור</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>טיפול (אופציונלי)</label>
            <select name="serviceId" defaultValue={appointment.serviceId || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: 'black' }}>
              <option value="" style={{ color: 'black' }}>ללא</option>
              {services.map(s => (
                <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>תאריך</label>
              <input type="date" name="date" value={dateStr} onChange={e => setDateStr(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: 'black' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>שעה</label>
              <input type="time" name="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: 'black' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-charcoal)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
