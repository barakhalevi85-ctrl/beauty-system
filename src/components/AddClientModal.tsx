'use client';

import React, { useState } from 'react';
import styles from './AddClientModal.module.css';
import { addClient } from '@/actions/crmActions';
import { useRouter } from 'next/navigation';

export default function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const newClient = await addClient(formData);
      setIsOpen(false);
      router.push(`/crm/${newClient.id}`);
    } catch (error) {
      console.error('Failed to add client', error);
      alert('אירעה שגיאה בשמירת הלקוח.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button className={styles.addButton} onClick={() => setIsOpen(true)}>
        + הוסף לקוח חדש
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} glass-panel`}>
            <h2>הוספת לקוח חדש</h2>
            <form onSubmit={handleSubmit} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const focusable = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea, button[type="submit"]')) as HTMLElement[];
                  const index = focusable.indexOf(target);
                  if (index > -1 && index < focusable.length - 1) {
                    focusable[index + 1].focus();
                  }
                }
              }
            }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>שם פרטי:</label>
                  <input type="text" name="name" required className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>שם משפחה:</label>
                  <input type="text" name="lastName" required className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>ת.ז:</label>
                  <input type="text" name="idNumber" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>טלפון:</label>
                  <input type="tel" name="phone" required className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>תאריך לידה:</label>
                  <input type="date" name="dateOfBirth" className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                  <label>מגדר:</label>
                  <select name="gender" className={styles.select}>
                    <option value="">בחר/י</option>
                    <option value="אישה">אישה</option>
                    <option value="גבר">גבר</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>מקור הגעה:</label>
                  <select name="leadSource" className={styles.select}>
                    <option value="">בחר/י</option>
                    <option value="חבר">חבר</option>
                    <option value="אינסטגרם">אינסטגרם</option>
                    <option value="פייסבוק">פייסבוק</option>
                    <option value="גוגל">גוגל</option>
                    <option value="אתר">אתר</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>כתובת:</label>
                  <input type="text" name="address" className={styles.input} />
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>מצב רפואי / הערות:</label>
                  <textarea name="medicalNotes" className={styles.textarea} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <div className={styles.checkboxContainer}>
                    <input type="checkbox" name="healthDeclarationSent" id="healthDeclarationSent" />
                    <label htmlFor="healthDeclarationSent" style={{ margin: 0 }}>הצהרת בריאות נשלחה</label>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="submit" disabled={isPending} className={styles.submitButton}>
                  {isPending ? 'שומר...' : 'שמור לקוח'}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelButton}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
