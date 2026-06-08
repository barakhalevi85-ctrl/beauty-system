'use client';

import React, { useState } from 'react';
import styles from './calendar.module.css';
import LogTreatmentModal from './LogTreatmentModal';

export default function AppointmentCard({ appointment, hours }: { appointment: any, hours: string[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const startHourIndex = hours.indexOf(appointment.hour);
  const endHour = appointment.durationHours >= 2 
    ? hours[startHourIndex + 2] || '20:00'
    : hours[startHourIndex + 1] || '19:00';

  const isCompleted = appointment.status === 'completed';

  return (
    <>
      <div 
        className={`${styles.appointment} ${appointment.durationHours >= 2 ? styles.spanTwoHours : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          position: 'relative', 
          opacity: isCompleted ? 0.7 : 1,
          border: isCompleted ? '2px solid green' : undefined
        }}
      >
        <div className={styles.appointmentTitle}>{appointment.clientName}</div>
        <div className={styles.appointmentSubtitle}>{appointment.treatment}</div>
        <div className={styles.appointmentTime}>
          {appointment.hour} - {endHour}
        </div>
        
        {isCompleted && (
          <div style={{ position: 'absolute', top: '5px', left: '5px', color: 'green', fontWeight: 'bold' }}>
            ✓
          </div>
        )}

        {!isCompleted && isHovered && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsLogging(true);
            }}
            style={{
              position: 'absolute',
              bottom: '5px',
              left: '5px',
              right: '5px',
              background: 'var(--color-rose-gold)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            סמן כבוצע / תיעוד רפואי
          </button>
        )}
      </div>

      {isLogging && (
        <LogTreatmentModal 
          appointmentId={appointment.id}
          clientId={appointment.clientId}
          serviceId={appointment.serviceId}
          serviceName={appointment.treatment}
          clientName={appointment.clientName}
          onClose={() => setIsLogging(false)}
        />
      )}
    </>
  );
}
