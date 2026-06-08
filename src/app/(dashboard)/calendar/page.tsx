import React from 'react';
import styles from './calendar.module.css';
import { prisma } from '@/lib/prisma';
import { CalendarHeader } from '@/components/CalendarHeader';
import AppointmentCard from './AppointmentCard';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];
  const hours = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [dbAppointments, clients, services] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      include: {
        client: true,
        service: true
      }
    }),
    prisma.client.findMany({ select: { id: true, name: true } }),
    prisma.service.findMany({ select: { id: true, name: true } })
  ]);

  // Map to UI format
  const mappedAppointments = dbAppointments.map(apt => {
    const dayIndex = apt.date.getDay(); // 0 = Sunday
    const dayName = days[dayIndex] || '';
    const hourNum = apt.date.getHours();
    const hourStr = `${hourNum.toString().padStart(2, '0')}:00`;
    
    // Default duration: 1 hour if not specified by service
    let durationHours = 1;
    if (apt.service?.durationMinutes) {
      durationHours = Math.ceil(apt.service.durationMinutes / 60);
    }

    return {
      id: apt.id,
      day: dayName,
      hour: hourStr,
      clientId: apt.clientId,
      serviceId: apt.serviceId,
      status: apt.status,
      clientName: apt.client.name,
      treatment: apt.service?.name || 'פגישה',
      durationHours
    };
  });

  return (
    <div className={styles.calendarContainer}>
      <CalendarHeader clients={clients} services={services} />

      <div className={styles.glassPanel}>
        <div className={styles.calendarGrid}>
          {/* Top-Right Corner (Empty) */}
          <div className={styles.cornerHeader}></div>
          
          {/* Days Headers */}
          {days.map((day) => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}

          {/* Time Rows */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Row Header - Time */}
              <div className={styles.timeHeader}>{hour}</div>
              
              {/* Day Cells for this hour */}
              {days.map((day) => {
                const appointment = mappedAppointments.find(
                  (apt) => apt.day === day && apt.hour === hour
                );

                return (
                  <div key={`${day}-${hour}`} className={styles.gridCell}>
                    {appointment && (
                      <AppointmentCard appointment={appointment} hours={hours} />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
