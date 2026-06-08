'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './crm.module.css';
import { sellPackage } from '@/actions/crmActions';
import { AddTreatmentModal as GlobalAddServiceModal } from '@/components/AddTreatmentModal';

export default function SellPackageModal({ clientId, services }: { clientId: string, services: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSeries, setIsSeries] = useState(true);
  const [seriesTotal, setSeriesTotal] = useState<number>(10);
  const [isAddingService, setIsAddingService] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await sellPackage(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to sell package', error);
      alert('אירעה שגיאה בשמירת המכירה.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button className={styles.addButton} onClick={() => setIsOpen(true)}>
        + מכירת חבילה / סדרה
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>מכירת חבילה / סדרה חדשה</h2>
            <p style={{ color: 'var(--color-charcoal-light)', marginBottom: '1rem' }}>
              כאן את מגדירה את החבילה שהלקוחה רכשה (הניקובים יתבצעו מתוך יומן התורים).
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input type="hidden" name="clientId" value={clientId} />

              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                  <input type="radio" value="single" checked={!isSeries} onChange={() => setIsSeries(false)} name="treatmentType" />
                  טיפול בודד
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                  <input type="radio" value="series" checked={isSeries} onChange={() => setIsSeries(true)} name="treatmentType" />
                  טיפול מסדרה
                </label>
              </div>

              {isSeries && (
                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <span>סך הכל טיפולים בסדרה:</span>
                  <input 
                    type="number" 
                    name="seriesTotal"
                    value={seriesTotal} 
                    onChange={(e) => setSeriesTotal(Number(e.target.value))} 
                    min={2} 
                    style={{ width: '60px', padding: '0.25rem' }} 
                    required={isSeries} 
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>איזה טיפול / אזור הלקוחה קנתה?</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select name="serviceId" required className={styles.input} style={{ flex: 1 }}>
                    <option value="">-- בחר סוג טיפול מהמחירון --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                  </select>
                  <button type="button" onClick={() => setIsAddingService(true)} style={{ padding: '0.5rem 1rem', background: 'var(--color-rose-gold)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    + טיפול חדש
                  </button>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>מחיר ששולם (₪) (אופציונלי):</label>
                <input type="number" name="pricePaid" placeholder="למשל: 1500" className={styles.input} />
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" disabled={isPending} className={styles.submitButton}>
                  {isPending ? 'שומר...' : 'שמור מכירה (פתח כרטיסייה)'}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelButton}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingService && (
        <div style={{ position: 'relative', zIndex: 2000 }}>
          <GlobalAddServiceModal onClose={() => {
            setIsAddingService(false);
            router.refresh();
          }} />
        </div>
      )}
    </>
  );
}
