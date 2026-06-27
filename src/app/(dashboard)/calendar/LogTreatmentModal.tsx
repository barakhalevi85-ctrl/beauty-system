'use client';

import React, { useState, useEffect } from 'react';
import styles from '../crm/crm.module.css';
import { logTreatment, getClientActiveSeries } from '@/actions/crmActions';
import ClientProfileModal from '@/components/ClientProfileModal';

export default function LogTreatmentModal({ 
  appointmentId, 
  clientId, 
  serviceId, 
  serviceName,
  servicePrice,
  clientName,
  onClose 
}: { 
  appointmentId: string, 
  clientId: string, 
  serviceId?: string, 
  serviceName?: string, 
  servicePrice?: number,
  clientName: string,
  onClose: () => void 
}) {
  const [isPending, setIsPending] = useState(false);
  const [activeSeries, setActiveSeries] = useState<any[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('none');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    getClientActiveSeries(clientId).then(series => {
      setActiveSeries(series);
      setLoadingSeries(false);
      
      const matchingSeries = series.find(s => s.serviceId === serviceId);
      if (matchingSeries) {
        setSelectedSeriesId(matchingSeries.id);
        setPaymentAmount('');
      } else {
        setSelectedSeriesId('none');
        if (servicePrice) setPaymentAmount(String(servicePrice));
      }
    });
  }, [clientId, serviceId, servicePrice]);

  const handleSeriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSeriesId(val);
    if (val === 'none') {
      if (servicePrice) setPaymentAmount(String(servicePrice));
    } else {
      setPaymentAmount('');
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await logTreatment(formData);
      if (result && result.invoiceId) {
        window.open(`/invoice/${result.invoiceId}`, '_blank');
      }
      onClose();
    } catch (error) {
      console.error('Failed to log treatment', error);
      alert('אירעה שגיאה בשמירת הטיפול.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className={`${styles.modalContent} glass-panel`} style={{ maxHeight: '90vh', overflowY: 'auto', background: 'white' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>תיעוד טיפול רפואי - {clientName}</h2>
            <p style={{ color: 'var(--color-charcoal-light)', margin: 0 }}>הטיפול: {serviceName || 'כללי'}</p>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowProfileModal(true);
            }}
            title="מעבר לכרטיס לקוח מלא"
            style={{ 
              background: 'var(--color-charcoal)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '0.5rem 1rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span>👤</span>
            כרטיס לקוח
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="serviceId" value={serviceId || ''} />
          <input type="hidden" name="bodyArea" value={serviceName || 'כללי'} />

          <div className={styles.formGroup}>
            <label>בחירת כרטיסייה / סדרה לניקוב:</label>
            {loadingSeries ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>טוען כרטיסיות...</p>
            ) : (
              <select name="clientSeriesId" value={selectedSeriesId} onChange={handleSeriesChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)' }}>
                <option value="none">ללא ניקוב כרטיסייה (תשלום מזומן / רגיל)</option>
                {activeSeries.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.serviceName || s.service?.name} ({s.usedTreatments}/{s.totalTreatments} נוצלו)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>עוצמה (Fluence Joule):</label>
            <input type="number" step="0.1" name="fluenceJoule" required placeholder="למשל: 14" className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label>סכום לתשלום:</label>
            <input 
              type="number" 
              name="paymentAmount" 
              value={paymentAmount} 
              onChange={(e) => setPaymentAmount(e.target.value)} 
              placeholder={`למשל: ${servicePrice || 150}`} 
              className={styles.input} 
              disabled={selectedSeriesId !== 'none'}
              style={{ backgroundColor: selectedSeriesId !== 'none' ? '#f0f0f0' : 'white', cursor: selectedSeriesId !== 'none' ? 'not-allowed' : 'text' }}
            />
          </div>
          <div className={styles.formGroup}>
            <label>אמצעי תשלום:</label>
            <select 
              name="paymentMethod" 
              disabled={selectedSeriesId !== 'none'}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid rgba(0,0,0,0.2)',
                backgroundColor: selectedSeriesId !== 'none' ? '#f0f0f0' : 'white',
                cursor: selectedSeriesId !== 'none' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">לא רלוונטי</option>
              <option value="מזומן">מזומן</option>
              <option value="אשראי">אשראי</option>
              <option value="העברה בנקאית">העברה בנקאית</option>
              <option value="ביט">ביט</option>
              <option value="פייבוקס">פייבוקס</option>
            </select>
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
              {isPending ? 'שומר...' : (selectedSeriesId === 'none' ? 'שמור תשלום' : 'שמור ונַקֵב כרטיסייה')}
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              ביטול
            </button>
          </div>
        </form>
      </div>

      {showProfileModal && (
        <ClientProfileModal 
          clientId={clientId} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
}
