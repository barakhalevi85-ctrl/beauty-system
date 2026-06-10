'use client';

import React, { useState } from 'react';
import styles from './calendar.module.css';
import AppointmentCard from './AppointmentCard';
import { AddAppointmentModal } from '@/components/AddAppointmentModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { getHebrewDateAndHolidays } from '@/lib/hebcalUtils';

export function CalendarGrid({
  mappedAppointments,
  days,
  hours,
  weekDates,
  clients,
  services,
  currentDateIso,
  weeklySchedule,
  closedDates
}: {
  mappedAppointments: any[];
  days: string[];
  hours: string[];
  weekDates: Date[];
  clients: any[];
  services: any[];
  currentDateIso: string;
  weeklySchedule: any;
  closedDates: any[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleCellClick = (dayIndex: number, hourStr: string) => {
    // dayIndex is 0 for Sunday, 1 for Monday, etc.
    const dateOfCell = new Date(weekDates[dayIndex]);
    const hourNum = parseInt(hourStr.split(':')[0], 10);
    dateOfCell.setHours(hourNum, 0, 0, 0);
    
    // Convert to local timezone before opening modal
    setSelectedDate(new Date(dateOfCell.getTime() - dateOfCell.getTimezoneOffset() * 60000));
    setIsModalOpen(true);
  };

  const navTo = (offsetDays: number) => {
    const d = new Date(currentDateIso);
    d.setDate(d.getDate() + offsetDays);
    router.push(`/calendar?date=${d.toISOString().split('T')[0]}`);
  };

  const goToToday = () => {
    router.push(`/calendar`);
  };

  return (
    <div className={styles.glassPanel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navTo(7)} style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal-light)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>שבוע הבא ❯</button>
          <button onClick={goToToday} style={{ padding: '0.5rem 1rem', background: 'var(--color-rose-gold)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>השבוע הנוכחי</button>
          <button onClick={() => navTo(-7)} style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal-light)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❮ שבוע קודם</button>
        </div>
        <button className={styles.addButton} onClick={() => { setSelectedDate(null); setIsModalOpen(true); }}>
          <span>+</span> הוסף תור חדש
        </button>
      </div>

      <div className={styles.calendarGrid} style={{ gridTemplateRows: `auto repeat(${hours.length}, 80px)` }}>
        {/* Top-Right Corner (Empty) */}
        <div className={styles.cornerHeader}></div>
        
        {/* Days Headers */}
        {days.map((day, index) => {
          const { hebrewDateStr, holidays } = getHebrewDateAndHolidays(weekDates[index]);
          return (
            <div key={day} className={styles.dayHeader} style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0' }}>
              <div>{day}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.8 }}>
                {weekDates[index].toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-charcoal-light)' }}>
                {hebrewDateStr}
              </div>
              {holidays.length > 0 && (
                <div style={{ fontSize: '0.7rem', color: 'var(--color-rose-gold)', fontWeight: 'bold', textAlign: 'center' }}>
                  {holidays.join(', ')}
                </div>
              )}
            </div>
          );
        })}

        {/* Time Rows */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Row Header - Time */}
            <div className={styles.timeHeader}>{hour}</div>
            
            {/* Day Cells for this hour */}
            {days.map((day, dayIndex) => {
              const appointment = mappedAppointments.find(
                (apt) => apt.day === day && apt.hour === hour
              );

              const currentCellDate = weekDates[dayIndex];
              const isClosedDate = closedDates?.find(cd => new Date(cd.date).toDateString() === currentCellDate.toDateString());
              const daySchedule = weeklySchedule ? weeklySchedule[dayIndex] : null;
              const isWeeklyClosed = daySchedule && !daySchedule.isOpen;
              
              let backgroundColor = 'var(--color-cream-white)';
              if (isClosedDate) backgroundColor = '#ffe8e8'; // Vacation color (light reddish)
              else if (isWeeklyClosed) backgroundColor = '#f0f0f0'; // Default closed day (grayish)

              return (
                <div 
                  key={`${day}-${hour}`} 
                  className={styles.gridCell}
                  onClick={() => !appointment && handleCellClick(dayIndex, hour)}
                  style={{ cursor: appointment ? 'default' : 'pointer', background: backgroundColor }}
                  title={!appointment ? (isClosedDate || isWeeklyClosed ? 'יום סגור - לחץ לקביעת תור חריג' : 'לחץ לקביעת תור') : ''}
                >
                  {appointment && (
                    <AppointmentCard appointment={appointment} hours={hours} services={services} />
                  )}
                  {/* Hover visual cue for empty cell */}
                  {!appointment && (
                    <div className="empty-cell-hover" style={{ width: '100%', height: '100%', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(183, 110, 121, 0.1)', color: 'var(--color-rose-gold)', fontWeight: 'bold' }}>
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {isModalOpen && (
        <AddAppointmentModal 
          onClose={() => setIsModalOpen(false)} 
          clients={clients} 
          services={services} 
          initialDate={selectedDate || undefined}
        />
      )}
    </div>
  );
}
