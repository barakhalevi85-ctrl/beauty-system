'use client';

import React, { useState } from 'react';
import styles from './settings.module.css';
import { updateWeeklySchedule, addClosedDate, removeClosedDate, updateBusinessSettings } from '@/actions/settingsActions';
import { createEmployee } from '@/actions/employeeActions';
import { EmployeeModal } from '@/components/employees/EmployeeModal';
import { EmployeeProfileModal } from '@/components/employees/EmployeeProfileModal';

export default function SettingsClient({ 
  initialSettings, 
  initialClosedDates,
  initialEmployees 
}: { 
  initialSettings: any, 
  initialClosedDates: any[],
  initialEmployees: any[]
}) {
  const [activeTab, setActiveTab] = useState('business');
  const [weeklySchedule, setWeeklySchedule] = useState<any>(
    initialSettings.weeklySchedule ? JSON.parse(initialSettings.weeklySchedule) : {}
  );
  
  const [businessSettings, setBusinessSettings] = useState<any>(
    initialSettings.businessSettings ? JSON.parse(initialSettings.businessSettings) : {
      businessName: '',
      businessId: '',
      dealerType: 'AUTHORIZED',
      address: '',
      phone: '',
      nextInvoiceNumber: 1000
    }
  );

  const [closedDates, setClosedDates] = useState<any[]>(initialClosedDates);
  
  const [newClosedDate, setNewClosedDate] = useState('');
  const [newClosedDateDesc, setNewClosedDateDesc] = useState('');

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

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

  const handleBusinessSettingChange = (field: string, value: any) => {
    setBusinessSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveBusinessSettings = async () => {
    setSaving(true);
    try {
      await updateBusinessSettings(JSON.stringify(businessSettings));
      alert('הגדרות עסק נשמרו בהצלחה!');
    } catch (e) {
      alert('שגיאה בשמירת הגדרות עסק');
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

  const handleSaveEmployee = async (data: any) => {
    try {
      await createEmployee(data);
      setIsEmployeeModalOpen(false);
      window.location.reload();
    } catch (e) {
      alert('שגיאה ביצירת עובד');
    }
  };

  return (
    <div>
      <div className={styles.tabsContainer}>
        <button className={`${styles.tab} ${activeTab === 'business' ? styles.activeTab : ''}`} onClick={() => setActiveTab('business')}>עסק</button>
        <button className={`${styles.tab} ${activeTab === 'messages' ? styles.activeTab : ''}`} onClick={() => setActiveTab('messages')}>הודעות</button>
        <button className={`${styles.tab} ${activeTab === 'employees' ? styles.activeTab : ''}`} onClick={() => setActiveTab('employees')}>עובדים</button>
        <button className={`${styles.tab} ${activeTab === 'calendar' ? styles.activeTab : ''}`} onClick={() => setActiveTab('calendar')}>יומן</button>
      </div>

      {activeTab === 'calendar' && (
        <>
          <section className={`glass-panel ${styles.section}`}>
            <h2 className={styles.sectionTitle}>שעות פעילות שבועיות</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {daysOfWeek.map((dayName, idx) => {
            const dayData = weeklySchedule[idx] || { isOpen: false, start: '09:00', end: '18:00' };
              <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
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
        </>
      )}

      {activeTab === 'employees' && (
        <section className={`glass-panel ${styles.section}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>ניהול עובדים</h2>
            <button className={styles.addButton} style={{ width: 'auto' }} onClick={() => setIsEmployeeModalOpen(true)}>
              + הוסף עובד חדש
            </button>
          </div>
          {initialEmployees.length === 0 ? (
            <p>אין עובדים מוגדרים כרגע במערכת.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {initialEmployees.map(emp => (
                <div 
                  key={emp.id} 
                  style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{emp.name}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>{emp.role || 'ללא תפקיד'}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>{emp.phone}</div>
                </div>
              ))}
            </div>
          )}
          
          <EmployeeModal 
            isOpen={isEmployeeModalOpen} 
            onClose={() => setIsEmployeeModalOpen(false)} 
            onSave={handleSaveEmployee} 
          />

          <EmployeeProfileModal
            isOpen={!!selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            employee={selectedEmployee}
          />
        </section>
      )}

      {activeTab === 'business' && (
        <section className={`glass-panel ${styles.section}`}>
          <h2 className={styles.sectionTitle}>הגדרות עסק וחשבוניות</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label>שם העסק</label>
              <input type="text" value={businessSettings.businessName} onChange={e => handleBusinessSettingChange('businessName', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <div>
              <label>ח.פ / ע.מ / ת.ז (מספר עוסק)</label>
              <input type="text" value={businessSettings.businessId} onChange={e => handleBusinessSettingChange('businessId', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <div>
              <label>סוג עוסק (עבור קבלות/חשבוניות)</label>
              <select value={businessSettings.dealerType} onChange={e => handleBusinessSettingChange('dealerType', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}>
                <option value="AUTHORIZED">עוסק מורשה (מפיק חשבוניות מס קבלה כולל מע"מ)</option>
                <option value="EXEMPT">עוסק פטור (מפיק קבלות)</option>
              </select>
            </div>
            <div>
              <label>מספר קבלה/חשבונית הבא</label>
              <input type="number" value={businessSettings.nextInvoiceNumber} onChange={e => handleBusinessSettingChange('nextInvoiceNumber', parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <div>
              <label>כתובת (יופיע בקבלה)</label>
              <input type="text" value={businessSettings.address} onChange={e => handleBusinessSettingChange('address', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }} />
            </div>
            <div>
              <label>טלפון (יופיע בקבלה)</label>
              <input type="text" value={businessSettings.phone} onChange={e => handleBusinessSettingChange('phone', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSaveBusinessSettings} disabled={saving} className={styles.saveButton}>
              {saving ? 'שומר...' : 'שמור הגדרות עסק'}
            </button>
          </div>
        </section>
      )}

      {activeTab === 'messages' && (
        <section className={`glass-panel ${styles.section}`}>
          <h2 className={styles.sectionTitle}>הודעות אוטומטיות (וואטסאפ / סמס)</h2>
          <p>בקרוב - הגדרות תזכורות, ברכות יום הולדת ועוד.</p>
        </section>
      )}
    </div>
  );
}
