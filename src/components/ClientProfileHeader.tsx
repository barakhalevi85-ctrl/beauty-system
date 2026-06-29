'use client';

import React, { useState } from 'react';
import { updateClientInfo } from '@/actions/crmActions';

export default function ClientProfileHeader({ client }: { client: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append('id', client.id);
    
    try {
      await updateClientInfo(fd);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה בשמירת הנתונים');
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div style={{ flex: 1, marginLeft: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-charcoal-black)', margin: 0 }}>עריכת פרטי לקוח</h1>
          <button 
            onClick={() => setIsEditing(false)} 
            style={{ background: 'none', border: '1px solid var(--color-charcoal-light)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            ביטול עריכה
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>שם פרטי</label>
              <input type="text" name="name" defaultValue={client.name} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>שם משפחה</label>
              <input type="text" name="lastName" defaultValue={client.lastName || ''} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>טלפון</label>
              <input type="tel" name="phone" defaultValue={client.phone} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>ת.ז</label>
              <input type="text" name="idNumber" defaultValue={client.idNumber || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>כתובת</label>
              <input type="text" name="address" defaultValue={client.address || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>אימייל</label>
              <input type="email" name="email" defaultValue={client.email || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>תאריך לידה</label>
              <input type="date" name="dateOfBirth" defaultValue={client.birthDate ? client.birthDate.substring(0, 10) : (client.dateOfBirth ? client.dateOfBirth.substring(0, 10) : '')} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem' }}>מגדר</label>
              <select name="gender" defaultValue={client.gender || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">בחר/י</option>
                <option value="אישה">אישה</option>
                <option value="גבר">גבר</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem' }}>מצב רפואי / הערות קבועות</label>
            <textarea name="medicalNotes" defaultValue={client.medicalNotes || ''} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <button type="submit" disabled={isSaving} style={{ background: 'var(--color-rose-gold)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 'bold' }}>
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-charcoal-black)', margin: 0 }}>תיק לקוח: {client.name} {client.lastName}</h1>
        <button 
          onClick={() => setIsEditing(true)} 
          style={{ background: 'none', border: '1px solid var(--color-charcoal-light)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          ✏️ עריכת פרטים
        </button>
      </div>
      <p style={{ color: 'var(--color-charcoal-light)', marginBottom: '0.25rem', fontSize: '1.1rem' }}>תעודת זהות: {client.idNumber || client.id}</p>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-cream-white)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-rose-gold-light)' }}>
          📞 {client.phone}
        </span>
        {client.email && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-cream-white)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-rose-gold-light)' }}>
            ✉️ {client.email}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-cream-white)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.95rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-rose-gold-light)' }}>
          📍 {client.address || 'לא צוינה כתובת'}
        </span>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>
        <p style={{ margin: '0 0 0.25rem 0' }}><strong>מצב רפואי / הערות:</strong> {client.medicalNotes || 'אין'}</p>
        <p style={{ margin: 0 }}><strong>הצהרת בריאות:</strong> {client.healthDeclarationSent ? 'נשלחה ✅' : 'לא נשלחה ❌'}</p>
      </div>
    </div>
  );
}
