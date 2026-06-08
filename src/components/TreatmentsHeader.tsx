'use client';

import { useState } from 'react';
import { AddTreatmentModal } from './AddTreatmentModal';
import styles from '@/app/(dashboard)/treatments/treatments.module.css';

export function TreatmentsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>ניהול טיפולים ומחירון</h1>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          הוסף אזור / טיפול חדש
        </button>
      </header>

      {isModalOpen && <AddTreatmentModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
