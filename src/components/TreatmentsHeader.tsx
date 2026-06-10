'use client';

import { useState } from 'react';
import { AddTreatmentModal } from './AddTreatmentModal';
import { AddCategoryModal } from './AddCategoryModal';
import styles from '@/app/(dashboard)/treatments/treatments.module.css';

export function TreatmentsHeader() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>ניהול טיפולים ומחירון</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.addButton} onClick={() => setIsCategoryModalOpen(true)} style={{ background: 'transparent', border: '2px solid var(--color-rose-gold)', color: 'var(--color-charcoal-black)' }}>
            + הוספת קטגוריה
          </button>
        </div>
      </header>

      {isCategoryModalOpen && <AddCategoryModal onClose={() => setIsCategoryModalOpen(false)} />}
    </>
  );
}
