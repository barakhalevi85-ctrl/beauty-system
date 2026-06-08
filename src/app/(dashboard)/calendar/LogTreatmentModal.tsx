'use client';

import React, { useState } from 'react';
import styles from './crm.module.css';
import { logTreatment } from '@/actions/crmActions';

export default function LogTreatmentModal({ 
  appointmentId, 
  clientId, 
  serviceId, 
  serviceName, 
  clientName,
  onClose 
}: { 
  appointmentId: string, 
  clientId: string, 
  serviceId?: string, 
  serviceName?: string, 
  clientName: string,
  onClose: () => void 
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await logTreatment(formData);
      onClose();
    } catch (error) {
      console.error('Failed to log treatment', error);
      alert('אירעה שגיאה בשמירת הטיפול.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`${styles.modalContent} glass-panel`} style={{ maxHeight: '90vh', overflowY: 'auto', background: 'white' }}>
        <h2>תיעוד טיפול רפואי - {clientName}</h2>
        <p style={{ color: 'var(--color-charcoal-light)' }}>הטיפול: {serviceName || 'כללי'}</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="serviceId" value={serviceId || ''} />
          <input type="hidden" name="bodyArea" value={serviceName || 'כללי'} />

          <div className={styles.formGroup}>
            <label>עוצמה (Fluence Joule):</label>
            <input type="number" step="0.1" name="fluenceJoule" required placeholder="למשל: 14" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>הערות טכנאי:</label>
            <textarea name="technicianNotes" placeholder="הערות..." className={styles.textarea} />
          </div>
          <div className={styles.formGroup}>
            <label>העלאת תמונות (אופציונלי):</label>
            <input type="file" name="images" multiple accept="image/*" className={styles.input} style={{ padding: '0.5rem' }} />
          </div>
          <div className={styles.modalActions}>
            <button type="submit" disabled={isPending} className={styles.submitButton}>
              {isPending ? 'שומר...' : 'שמור ונַקֵב כרטיסייה'}
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
