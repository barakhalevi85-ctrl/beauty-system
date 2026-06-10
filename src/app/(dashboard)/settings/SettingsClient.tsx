'use client';

import React, { useState } from 'react';
import styles from './settings.module.css';
import { updateWeeklySchedule, addClosedDate, removeClosedDate } from '@/actions/settingsActions';

export default function SettingsClient({ 
  initialSettings, 
  initialClosedDates 
}: { 
  initialSettings: any, 
  initialClosedDates: any[] 
}) {
  const [weeklySchedule, setWeeklySchedule] = useState<any>(
    initialSettings.weeklySchedule ? JSON.parse(initialSettings.weeklySchedule) : {}
  );
  
  const [closedDates, setClosedDates] = useState<any[]>(initialClosedDates);
  
  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedDateDesc, setNewClosedDateDesc] = useState('');

  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const handleScheduleChange = (dayIndex: number, field: string, value: any) => {
    setWeeklySchedule((prev: any) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value
      }
    }));
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await updateWeeklySchedule(JSON.stringify(weeklySchedule));
      alert('הגדרות נשמרו בהצלחה!');
    } catch (e) {
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setSaving(false);
    }
  };

  const handleAddClosedDate = async () => {
    if (!newClosedDate) return;
    try {
      await addClosedDate(new Date(newClosedDate), newClosedDateDesc);
      // Ideally we refresh data here, but we can just reload for simplicity
      window.location.reload();
    } catch (e) {
      alert('שגיאה בהוספת תאריך חופשה');
    }
  };

  const handleRemoveClosedDate = async (id: string) => {
    try {
      await removeClosedDate(id);
      window.location.reload();
    } catch (e) {
      alert('שגיאה בהסרת תאריך חופשה');
    }
  };

  return (
    <div>
      <section className={`glass-panel ${styles.section}`}>
        <h2 className={styles.sectionTitle}>שעות פעילות שבועיות</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {daysOfWeek.map((dayName, idx) => {
            const dayData = weeklySchedule[idx] || { isOpen: false, start: '09:00', end: '18:00' };
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>יום {dayName}</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={dayData.isOpen} 
                    onChange={(e) => handleScheduleChange(idx, 'isOpen', e.target.checked)} 
                  />
                  פתוח
                </label>
                
                {dayData.isOpen ? (
                  <>
                    <input 
                      type="time" 
                      value={dayData.start} 
                      onChange={(e) => handleScheduleChange(idx, 'start', e.target.value)} 
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                    />
                    <span>עד</span>
                    <input 
                      type="time" 
                      value={dayData.end} 
                      onChange={(e) => handleScheduleChange(idx, 'end', e.target.value)} 
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                    />
                  </>
                ) : (
                  <span style={{ color: 'var(--color-charcoal-light)' }}>סגור</span>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleSaveSchedule} 
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'שומר...' : 'שמור שעות פעילות'}
          </button>
        </div>
      </section>

      <section className={`glass-panel ${styles.section}`}>
        <h2 className={styles.sectionTitle}>ימי חופשה וימים סגורים (תאריכים ספציפיים)</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input 
            type="date" 
            value={newClosedDate} 
            onChange={(e) => setNewClosedDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
          />
          <input 
            type="text" 
            placeholder="סיבה / תיאור (אופציונלי)" 
            value={newClosedDateDesc} 
            onChange={(e) => setNewClosedDateDesc(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black', flex: 1 }}
          />
          <button onClick={handleAddClosedDate} className={styles.addButton} style={{ width: 'auto', background: 'var(--color-rose-gold)', color: 'white' }}>
            + הוסף יום חופש
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {closedDates.length === 0 && <p>אין ימי חופשה עתידיים מוגדרים.</p>}
          {closedDates.map((cd) => (
            <div key={cd.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <strong>{new Date(cd.date).toLocaleDateString('he-IL')}</strong>
                {cd.description && <span style={{ marginLeft: '1rem', color: 'var(--color-charcoal-light)' }}>- {cd.description}</span>}
              </div>
              <button 
                onClick={() => handleRemoveClosedDate(cd.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                title="הסר תאריך סגור"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
