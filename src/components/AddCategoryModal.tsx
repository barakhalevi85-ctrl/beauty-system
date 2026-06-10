'use client';

import { useState } from 'react';
import { addService } from '@/app/actions';

export function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const categoryName = formData.get('categoryName') as string;
    
    try {
      // Create a dummy service to initialize the category in the DB
      await addService({
        category: categoryName.trim(),
        name: 'dummy_category_init',
        packageType: 'טיפול בודד',
        price: 0,
        durationMinutes: 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה ביצירת קטגוריה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: 0, textAlign: 'center', color: 'var(--color-rose-gold)' }}>הוספת קטגוריה חדשה</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', color: '#333' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>שם הקטגוריה</label>
            <input type="text" name="categoryName" required placeholder="למשל: נשים / גברים / לייזר פנים..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} autoFocus />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-rose-gold)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'שומר...' : 'שמור קטגוריה'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#e0e0e0', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
