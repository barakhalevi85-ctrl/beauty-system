'use client';

import { useState } from 'react';
import { deleteAppointment } from '@/app/actions';
import { EditAppointmentModal } from './EditAppointmentModal';

export default function FutureAppointmentItem({ appointment, services }: { appointment: any, services: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm('האם אתה בטוח שברצונך לבטל תור זה?')) {
      setIsDeleting(true);
      try {
        await deleteAppointment(appointment.id);
      } catch (err) {
        console.error(err);
        alert('שגיאה במחיקת תור');
        setIsDeleting(false);
      }
    }
  };

  const date = new Date(appointment.date);
  const dateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isDeleting ? 0.5 : 1 }}>
      <div>
        <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📅 {dateStr} בשעה {timeStr}
        </h3>
        <p style={{ margin: 0, color: 'var(--color-charcoal-light)' }}>
          {appointment.service?.name || 'פגישה כללית'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setIsEditing(true)} 
          title="ערוך תור"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✏️
        </button>
        <button 
          onClick={handleDelete} 
          title="בטל תור"
          disabled={isDeleting}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🗑️
        </button>
      </div>

      {isEditing && (
        <EditAppointmentModal 
          onClose={() => setIsEditing(false)} 
          appointment={appointment}
          services={services}
        />
      )}
    </div>
  );
}
