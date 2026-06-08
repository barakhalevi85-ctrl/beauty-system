'use client';

import { useState } from 'react';
import { updateCallLog } from '@/actions/crmActions';

export default function EditableCallLog({ log }: { log: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(log.notes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCallLog(log.id, notes);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('שגיאה בעדכון השיחה');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', borderLeft: '4px solid var(--color-rose-gold)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)' }}>
          {new Date(log.createdAt).toLocaleString('he-IL')}
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--color-rose-gold)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem'
            }}
          >
            ערוך
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', minHeight: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.2)', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              style={{ padding: '0.25rem 1rem', background: 'var(--color-rose-gold)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isSaving ? 'שומר...' : 'שמור'}
            </button>
            <button 
              onClick={() => {
                setNotes(log.notes); // reset
                setIsEditing(false);
              }}
              style={{ padding: '0.25rem 1rem', background: 'transparent', color: 'var(--color-charcoal-light)', border: '1px solid currentColor', borderRadius: '4px', cursor: 'pointer' }}
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.notes}</p>
      )}
    </div>
  );
}
