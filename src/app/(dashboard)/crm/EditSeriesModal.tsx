'use client';

import React, { useState } from 'react';
import styles from './crm.module.css';
import { updatePackage, deletePackage } from '@/actions/crmActions';

export default function EditSeriesModal({ 
  series, 
  services,
  clientId
}: { 
  series: any, 
  services: any[],
  clientId: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSeries, setIsSeries] = useState(series.totalTreatments > 1);
  const [seriesTotal, setSeriesTotal] = useState<number>(series.totalTreatments);
  const [selectedServiceId, setSelectedServiceId] = useState(series.serviceId);
  const [pricePaid, setPricePaid] = useState<number | ''>(series.pricePaid || '');
  const [editReason, setEditReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const groupedServices = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append('seriesId', series.id);
    formData.append('clientId', clientId);
    
    try {
      await updatePackage(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update package', error);
      alert('אירעה שגיאה בעדכון.');
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    if (!deleteReason) {
      alert('חובה לציין סיבה לביטול / מחיקה.');
      return;
    }
    if (!confirm('האם את בטוחה שברצונך למחוק חבילה זו? הפעולה תתועד במעקב השיחות.')) return;
    
    setIsPending(true);
    const formData = new FormData();
    formData.append('seriesId', series.id);
    formData.append('clientId', clientId);
    formData.append('deleteReason', deleteReason);

    try {
      await deletePackage(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete package', error);
      alert('אירעה שגיאה במחיקה.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none',
          border: '1px solid var(--color-rose-gold)',
          color: 'var(--color-rose-gold)',
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}
      >
        ✏️ ערוך / בטל
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={`${styles.modalContent} glass-panel`} style={{ maxHeight: '90vh', overflowY: 'auto', background: 'white' }}>
            <h2>עריכת חבילה / סדרה</h2>
            
            {!isDeleting ? (
              <form onSubmit={handleUpdate} className={styles.form}>
                
                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
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
                      min={series.usedTreatments || 1} 
                      style={{ width: '60px', padding: '0.25rem' }} 
                      required={isSeries} 
                    />
                    <small style={{ color: 'gray' }}>(נוצלו: {series.usedTreatments})</small>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>סוג הטיפול:</label>
                  <select name="serviceId" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} required className={styles.input}>
                    {Object.entries(groupedServices).map(([category, svcs]) => (
                      <optgroup key={category} label={category}>
                        {svcs.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>מחיר ששולם (₪):</label>
                  <input type="number" name="pricePaid" value={pricePaid} onChange={(e) => setPricePaid(e.target.value === '' ? '' : Number(e.target.value))} className={styles.input} required />
                </div>

                <div className={styles.formGroup}>
                  <label>סיבת העריכה (יתועד אוטומטית):</label>
                  <input type="text" name="editReason" value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="למשל: הלקוחה ביקשה להוסיף טיפולים לסדרה" className={styles.input} required />
                </div>
                
                <div className={styles.modalActions} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button type="submit" disabled={isPending} className={styles.submitButton} style={{ flex: 1 }}>
                    {isPending ? 'שומר...' : 'שמור שינויים'}
                  </button>
                  <button type="button" onClick={() => setIsDeleting(true)} className={styles.cancelButton} style={{ background: '#ff4d4d', color: 'white' }}>
                    מחק / בטל חבילה
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelButton}>
                    סגור
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.form}>
                <h3 style={{ color: '#ff4d4d' }}>אזהרה: ביטול עסקה</h3>
                <p>את עומדת למחוק את החבילה (<strong>{series.service.name}</strong>). פעולה זו תמחק את הכרטיסייה הפתוחה ותתעד את הביטול במערכת.</p>
                
                <div className={styles.formGroup}>
                  <label>סיבת הביטול / מחיקה (יתועד אוטומטית):</label>
                  <input type="text" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="למשל: טעות בהזנה, או הלקוחה התחרטה וקיבלה זיכוי" className={styles.input} autoFocus />
                </div>

                <div className={styles.modalActions} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="button" onClick={handleDelete} disabled={isPending} className={styles.submitButton} style={{ background: '#ff4d4d', color: 'white', flex: 1 }}>
                    {isPending ? 'מוחק...' : 'אשר ביטול חבילה'}
                  </button>
                  <button type="button" onClick={() => setIsDeleting(false)} className={styles.cancelButton} style={{ flex: 1 }}>
                    חזור לעריכה
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
