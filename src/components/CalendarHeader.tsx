'use client';

import { useState } from 'react';
import { AddAppointmentModal } from './AddAppointmentModal';
import styles from '@/app/(dashboard)/calendar/calendar.module.css';

export function CalendarHeader({ 
  clients, 
  services 
}: { 
  clients: { id: string; name: string }[];
  services: { id: string; name: string }[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>יומן תורים</h1>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          <span>+</span> הוסף תור חדש
        </button>
      </header>

      {isModalOpen && (
        <AddAppointmentModal 
          onClose={() => setIsModalOpen(false)} 
          clients={clients} 
          services={services} 
        />
      )}
    </>
  );
}
