'use client';

import { useState } from 'react';
import { editAppointment } from '@/app/actions';
import { refundCompletedAppointment } from '@/actions/crmActions';

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
  const initDate = new Date(appointment.date);
  const initialDateStr = !isNaN(initDate.getTime()) 
    ? `${initDate.getFullYear()}-${String(initDate.getMonth() + 1).padStart(2, '0')}-${String(initDate.getDate()).padStart(2, '0')}`
    : '';
  const initialTimeStr = !isNaN(initDate.getTime())
    ? initDate.toTimeString().substring(0, 5)
    : '';

  const [dateStr, setDateStr] = useState(initialDateStr);
  const [timeStr, setTimeStr] = useState(initialTimeStr);

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

  async function handleRefund() {
    if (!confirm('האם את בטוחה שברצונך לבצע זיכוי לטיפול זה? הפעולה תחזיר את הניקוב לסדרה (אם נוקב) ותפיק חשבונית זיכוי (אם שולם).')) return;
    
    setLoading(true);
    try {
      const res = await refundCompletedAppointment(appointment.id);
      if (res && res.invoiceId) {
        alert('הופקה חשבונית זיכוי בהצלחה!');
        window.open(`/invoice/${res.invoiceId}`, '_blank');
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה בביצוע הזיכוי. ייתכן ואין לטיפול זה תיעוד מקושר.');
    } finally {
      setLoading(false);
    }
  }

  if (appointment.status === 'completed') {
    const log = appointment.treatmentLog;
    let paymentDesc = '';
    let seriesDesc = '';
    
    if (log) {
      if (log.invoices && log.invoices.length > 0) {
        const inv = log.invoices[0];
        if (inv.amount > 0) {
          paymentDesc = `שולם ${inv.amount} ₪ (${inv.paymentMethod})`;
        }
      }
      if (log.clientSeriesId) {
        seriesDesc = `נוקב טיפול ${log.treatmentNumber} מתוך ${log.seriesTotal || '?'}`;
      }
    }

    return (
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
        <div className="glass-panel" style={{ width: '450px', maxWidth: '90%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ color: 'var(--color-charcoal-black)' }}>זיכוי וביטול טיפול</h2>
          <p style={{ marginTop: '1rem', color: '#666' }}>תור זה כבר הושלם ובוצע.</p>
          
          {log && (
            <div style={{ background: 'rgba(255,255,255,0.8)', padding: '1rem', borderRadius: '8px', margin: '1rem 0', textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-rose-gold)' }}>פירוט מה שבוצע:</h4>
              <ul style={{ margin: 0, paddingRight: '1.2rem', color: 'var(--color-charcoal-black)' }}>
                <li><strong>אזור שטופל:</strong> {log.bodyArea}</li>
                {seriesDesc && <li><strong>כרטיסייה:</strong> {seriesDesc}</li>}
                {paymentDesc && <li><strong>תשלום:</strong> {paymentDesc}</li>}
              </ul>
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: '#d9534f', margin: '1rem 0' }}>
            שימי לב: ביצוע זיכוי יחזיר את הניקוב לכרטיסייה, יפיק קבלת זיכוי (אם היה תשלום), ויחזיר את התור למצב "מתוכנן".
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={handleRefund} disabled={loading} style={{ flex: 2, padding: '0.75rem', background: '#d9534f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'מבצע זיכוי...' : 'בצע זיכוי (החזר ניקוב / הפק קבלת זיכוי)'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-charcoal)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              סגור
            </button>
          </div>
        </div>
      </div>
    );
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
              <input type="time" name="time" step="900" value={timeStr} onChange={e => setTimeStr(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: 'black' }} />
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
