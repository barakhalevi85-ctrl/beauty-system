'use client';

import React, { useState } from 'react';
import styles from '@/app/(dashboard)/settings/settings.module.css';

export function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; email: string; role: string; hourlyWage: number; username?: string; password?: string }) => void;
  employee?: any;
}) {
  const [name, setName] = useState(employee?.name || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [role, setRole] = useState(employee?.role || '');
  const [hourlyWage, setHourlyWage] = useState(employee?.hourlyWage?.toString() || '');
  const [username, setUsername] = useState(employee?.username || '');
  const [password, setPassword] = useState(employee?.password || '');
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className={styles.section} style={{ background: 'white', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
        <h2 className={styles.sectionTitle}>{employee ? 'עריכת עובד' : 'הוספת עובד חדש'}</h2>
        
        <div className={styles.inputGroup}>
          <label>שם מלא</label>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="שם העובד" />
        </div>

        <div className={styles.inputGroup}>
          <label>טלפון</label>
          <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05x-xxxxxxx" />
        </div>

        <div className={styles.inputGroup}>
          <label>אימייל (אופציונלי)</label>
          <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>

        <div className={styles.inputGroup}>
          <label>שם משתמש (עבור התחברות למערכת)</label>
          <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="למשל: ronit" />
        </div>

        <div className={styles.inputGroup}>
          <label>סיסמה (עבור התחברות למערכת)</label>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="בחר סיסמה" />
        </div>

        <div className={styles.inputGroup}>
          <label>תפקיד</label>
          <input className={styles.input} value={role} onChange={e => setRole(e.target.value)} placeholder="למשל: קוסמטיקאית, פקידת קבלה" />
        </div>

        <div className={styles.inputGroup}>
          <label>שכר עבודה לשעה (₪)</label>
          <input className={styles.input} type="number" value={hourlyWage} onChange={e => setHourlyWage(e.target.value)} placeholder="למשל: 50" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className={styles.saveButton} 
            style={{ flex: 1 }}
            onClick={() => onSave({ name, phone, email, role, hourlyWage: parseFloat(hourlyWage) || 0, username, password })}
            disabled={!name || !phone}
          >
            שמור
          </button>
          <button 
            style={{ flex: 1, background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}
            onClick={onClose}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
