'use client';

import React, { useState } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [clinicName, setClinicName] = useState('GlamFlow קליניקה');
  const [address, setAddress] = useState('רחוב הרצל 10, תל אביב');
  const [phone, setPhone] = useState('03-1234567');
  const [businessHours, setBusinessHours] = useState('09:00 - 18:00');

  const [smsReminders, setSmsReminders] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>הגדרות עסק ומערכת</h1>

      {/* פרטי קליניקה */}
      <section className={`glass-panel ${styles.section}`}>
        <h2 className={styles.sectionTitle}>פרטי קליניקה</h2>
        
        <div className={styles.grid2Col}>
          <div className={styles.inputGroup}>
            <label htmlFor="clinicName">שם הקליניקה</label>
            <input 
              id="clinicName" 
              type="text" 
              className={styles.input} 
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">טלפון</label>
            <input 
              id="phone" 
              type="text" 
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="address">כתובת</label>
            <input 
              id="address" 
              type="text" 
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="businessHours">שעות פעילות</label>
            <input 
              id="businessHours" 
              type="text" 
              className={styles.input}
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      </section>

      {/* מכשירי לייזר */}
      <section className={`glass-panel ${styles.section}`}>
        <h2 className={styles.sectionTitle}>מכשירי לייזר</h2>
        
        <div className={styles.deviceItem}>
          <div className={styles.deviceInfo}>
            <span className={styles.deviceName}>Soprano Titanium - חדר 1</span>
            <span className={styles.deviceMaintenance}>תאריך טיפול אחרון: 10/05/2026</span>
          </div>
          <button className={styles.addButton} style={{ borderStyle: 'solid', background: 'var(--color-rose-gold)', color: 'white' }}>ערוך</button>
        </div>
        
        <div className={styles.deviceItem}>
          <div className={styles.deviceInfo}>
            <span className={styles.deviceName}>Candela GentleMax Pro - חדר 2</span>
            <span className={styles.deviceMaintenance}>תאריך טיפול אחרון: 22/04/2026</span>
          </div>
          <button className={styles.addButton} style={{ borderStyle: 'solid', background: 'var(--color-rose-gold)', color: 'white' }}>ערוך</button>
        </div>

        <button className={styles.addButton}>+ הוסף מכשיר לייזר</button>
      </section>

      {/* העדפות מערכת ותזכורות */}
      <section className={`glass-panel ${styles.section}`}>
        <h2 className={styles.sectionTitle}>העדפות מערכת ותזכורות</h2>
        
        <div className={styles.toggleGroup}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleLabelTitle}>תזכורות SMS</span>
            <span className={styles.toggleLabelDesc}>שליחת תזכורת ללקוח 24 שעות לפני תור</span>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={smsReminders} 
              onChange={() => setSmsReminders(!smsReminders)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleGroup}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleLabelTitle}>הודעות WhatsApp</span>
            <span className={styles.toggleLabelDesc}>אישור תור והנחיות לאחר טיפול</span>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={whatsappReminders} 
              onChange={() => setWhatsappReminders(!whatsappReminders)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.toggleGroup}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleLabelTitle}>ניוזלטר ומבצעים</span>
            <span className={styles.toggleLabelDesc}>שליחת עדכונים שיווקיים לכל הלקוחות</span>
          </div>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={marketingEmails} 
              onChange={() => setMarketingEmails(!marketingEmails)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </section>

      {/* שמור שינויים */}
      <div className={styles.saveActions}>
        <button className={styles.saveButton}>
          שמור שינויים
        </button>
      </div>

    </div>
  );
}
