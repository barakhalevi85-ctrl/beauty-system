'use client';

import React, { useState } from 'react';
import { deleteService, editService } from '@/app/actions';

export function TreatmentActions({ treatment }: { treatment: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm('האם את בטוחה שברצונך למחוק טיפול זה?')) {
      try {
        await deleteService(treatment.id);
      } catch (err) {
        alert('שגיאה במחיקת הטיפול');
      }
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await editService(treatment.id, {
        category: formData.get('category') as string,
        name: formData.get('name') as string,
        packageType: formData.get('packageType') as string,
        price: Number(formData.get('price')),
        durationMinutes: Number(formData.get('durationMinutes')),
      });
      setIsEditing(false);
    } catch (err) {
      alert('שגיאה בעדכון הטיפול');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button onClick={() => setIsEditing(true)} title="ערוך טיפול" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--color-charcoal-black)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          ✏️
        </button>
        <button onClick={handleDelete} title="מחק טיפול" style={{ padding: '0.5rem', background: 'transparent', color: '#ff4d4d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          🗑️
        </button>
      </div>

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setIsEditing(false)}>
          <form onSubmit={handleEdit} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: 0, textAlign: 'center', color: 'var(--color-rose-gold)' }}>עריכת טיפול</h2>
            
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem' }}>קטגוריה</span>
              <input name="category" defaultValue={treatment.category} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none' }} />
            </label>

            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem' }}>שם האזור / הטיפול</span>
              <input name="name" defaultValue={treatment.name} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none' }} />
            </label>

            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem' }}>סוג חבילה</span>
              <select name="packageType" defaultValue={treatment.packageType} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none' }}>
                <option value="טיפול בודד">טיפול בודד</option>
                <option value="סדרה של 10 טיפולים">סדרה של 10 טיפולים</option>
                <option value="סדרה של 12 טיפולים">סדרה של 12 טיפולים</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ flex: 1 }}>
                <span style={{ display: 'block', marginBottom: '0.5rem' }}>מחיר (₪)</span>
                <input name="price" type="number" defaultValue={treatment.price} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none' }} />
              </label>
              <label style={{ flex: 1 }}>
                <span style={{ display: 'block', marginBottom: '0.5rem' }}>משך זמן (דקות)</span>
                <input name="durationMinutes" type="number" defaultValue={treatment.durationMinutes} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-rose-gold)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {loading ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
