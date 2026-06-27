'use client';

import React, { useState } from 'react';
import styles from './calendar.module.css';
import LogTreatmentModal from './LogTreatmentModal';
import { EditAppointmentModal } from '@/components/EditAppointmentModal';
import ClientProfileModal from '@/components/ClientProfileModal';

export default function AppointmentCard({ appointment, hours, services }: { appointment: any, hours: string[], services: any[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const endHour = appointment.endHourStr || hours[hours.indexOf(appointment.hour) + 1] || '20:00';
  const isCompleted = appointment.status === 'completed';
  const slots = appointment.durationSlots || 4; // Default to 1 hour (4 slots)

  return (
    <>
      <div 
        className={styles.appointment}
        title={`${appointment.clientName} - ${appointment.treatment} (${appointment.hour} - ${endHour})`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          position: 'absolute', 
          opacity: isCompleted ? 0.7 : 1,
          border: isCompleted ? '2px solid green' : undefined,
          height: `calc(100% * ${slots} + ${slots - 1}px - 8px)`
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

        {isHovered && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileModal(true);
              }}
              title="כרטיס לקוח"
              style={{
                position: 'absolute',
                top: '5px',
                left: isCompleted ? '25px' : '5px', // First icon
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'transform 0.2s',
                zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              👤
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="ערוך תור"
              style={{
                position: 'absolute',
                top: '5px',
                left: isCompleted ? '50px' : '30px', // Second icon
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'transform 0.2s',
                zIndex: 10
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✏️
            </button>
          </>
        )}
      </div>

      {isEditing && (
        <EditAppointmentModal 
          onClose={() => setIsEditing(false)} 
          appointment={appointment}
          services={services}
        />
      )}

      {isLogging && (() => {
        const service = services.find(s => s.id === appointment.serviceId);
        const servicePrice = service?.price || 0;
        return (
          <LogTreatmentModal 
            appointmentId={appointment.id}
            clientId={appointment.clientId}
            serviceId={appointment.serviceId}
            serviceName={appointment.treatment}
            servicePrice={servicePrice}
            clientName={appointment.clientName}
            onClose={() => setIsLogging(false)}
          />
        );
      })()}

      {showProfileModal && (
        <ClientProfileModal 
          clientId={appointment.clientId} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </>
  );
}
