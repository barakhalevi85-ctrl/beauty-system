'use client';

import React, { useState } from 'react';
import { editCategory, deleteCategory } from '@/app/actions';
import { AddTreatmentModal } from './AddTreatmentModal';

export function CategoryActions({ categoryName, treatmentCount }: { categoryName: string, treatmentCount: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('newName') as string;
    
    try {
      await editCategory(categoryName, newName);
      setIsEditing(false);
    } catch (err) {
      alert('שגיאה בעדכון הקטגוריה');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    let msg = 'האם את בטוחה שברצונך למחוק קטגוריה זו?';
    if (treatmentCount > 0) {
      msg = `אזהרה: יש ${treatmentCount} טיפולים בקטגוריה זו!\nמחיקת הקטגוריה תמחק גם את כל הטיפולים שבה לצמיתות!\n\nהאם להמשיך ולמחוק הכל?`;
    }
    if (confirm(msg)) {
      try {
        await deleteCategory(categoryName);
      } catch (err) {
        alert('שגיאה במחיקת הקטגוריה');
      }
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button 
          onClick={() => setIsAddingTreatment(true)} 
          title="הוסף טיפול לקטגוריה זו"
          style={{ 
            background: '#22c55e', 
            border: 'none', 
            cursor: 'pointer', 
            transition: 'transform 0.2s', 
            marginLeft: '1rem', // Space before edit/delete in RTL
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
        <button 
          onClick={() => setIsEditing(true)} 
          title="ערוך שם קטגוריה"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✏️
        </button>
        <button 
          onClick={handleDelete} 
          title="מחק קטגוריה"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🗑️
        </button>
      </div>

      {isAddingTreatment && <AddTreatmentModal fixedCategory={categoryName} onClose={() => setIsAddingTreatment(false)} />}

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setIsEditing(false)}>
          <form onSubmit={handleEdit} className="glass-panel" style={{ width: '100%', maxWidth: '350px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, textAlign: 'center', color: 'var(--color-rose-gold)' }}>עריכת שם קטגוריה</h3>
            
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '0.5rem' }}>שם קטגוריה חדש</span>
              <input name="newName" defaultValue={categoryName} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </label>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-rose-gold)', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {loading ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: 'var(--color-charcoal)', fontWeight: 'bold', border: '1px solid var(--color-charcoal-light)', borderRadius: '8px', cursor: 'pointer' }}>
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
