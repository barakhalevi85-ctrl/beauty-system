'use client';

import React from 'react';
import styles from './calendar.module.css';
import { useRouter } from 'next/navigation';

export function MonthlyCalendarView({
  mappedAppointments,
  currentDateIso,
  closedDates,
  weeklySchedule,
  navTo,
  goToToday,
  onDateClick
}: {
  mappedAppointments: any[];
  currentDateIso: string;
  closedDates: any[];
  weeklySchedule: any;
}) {
  const router = useRouter();
  const current = new Date(currentDateIso);
  const year = current.getFullYear();
  const month = current.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from the Sunday before the first day
  const startGridDate = new Date(firstDay);
  startGridDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // End on the Saturday after the last day
  const endGridDate = new Date(lastDay);
  if (lastDay.getDay() !== 6) {
    endGridDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  }

  const daysToRender = [];
  let d = new Date(startGridDate);
  while (d <= endGridDate) {
    daysToRender.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const today = new Date();
  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className={styles.glassPanel} style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => {
            const d = new Date(current);
            d.setDate(d.getDate() + 30);
            router.push(`/calendar?view=monthly&date=${d.toISOString().split('T')[0]}`);
          }} style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal-light)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>חודש הבא ❯</button>
          <button onClick={() => router.push('/calendar?view=monthly')} style={{ padding: '0.5rem 1rem', background: 'var(--color-rose-gold)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>החודש הנוכחי</button>
          <button onClick={() => {
            const d = new Date(current);
            d.setDate(d.getDate() - 30);
            router.push(`/calendar?view=monthly&date=${d.toISOString().split('T')[0]}`);
          }} style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal-light)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❮ חודש קודם</button>
        </div>
        <h2 style={{ margin: 0, color: 'var(--color-charcoal-black)' }}>
          {current.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', background: 'var(--color-rose-gold-light)', padding: '4px', borderRadius: '8px' }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{ background: 'var(--color-glass-bg)', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
            {day}
          </div>
        ))}

        {daysToRender.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === month;
          const isClosedDate = closedDates?.find(cd => new Date(cd.date).toDateString() === date.toDateString());
          const daySchedule = weeklySchedule ? weeklySchedule[date.getDay()] : null;
          const isWeeklyClosed = daySchedule && !daySchedule.isOpen;
          
          let bgColor = isCurrentMonth ? 'white' : '#fafafa';
          if (isClosedDate) bgColor = '#ffe8e8';
          else if (isWeeklyClosed) bgColor = '#f0f0f0';

          // For monthly view, we just show appointment counts to keep it clean
          const dayAppointments = mappedAppointments.filter(apt => apt.dateStr === date.toDateString());

          const isToday = date.toDateString() === today.toDateString();

          return (
            <div 
              key={idx} 
              style={{ 
                background: bgColor, 
                minHeight: '100px', 
                padding: '0.5rem', 
                opacity: isCurrentMonth ? 1 : 0.5,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                border: isToday ? '2px solid var(--color-rose-gold)' : '1px solid transparent'
              }}
              onClick={() => router.push(`/calendar?view=weekly&date=${date.toISOString().split('T')[0]}`)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: isClosedDate || isWeeklyClosed ? 'var(--color-charcoal-light)' : 'black' }}>
                {isToday ? (
                  <span style={{ background: 'var(--color-rose-gold)', color: 'white', borderRadius: '50%', padding: '2px 8px', display: 'inline-block' }}>
                    {date.getDate()}
                  </span>
                ) : (
                  date.getDate()
                )}
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dayAppointments.map(apt => {
                  const isCompleted = apt.status === 'completed';
                  return (
                    <div 
                      key={apt.id} 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: isCompleted ? 'rgba(40, 167, 69, 0.2)' : 'rgba(183, 110, 121, 0.2)', 
                        padding: '2px 4px', 
                        borderRadius: '4px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        color: isCompleted ? '#1e7e34' : 'inherit',
                        border: isCompleted ? '1px solid rgba(40, 167, 69, 0.4)' : 'none'
                      }}
                      title={`${apt.clientName} - ${apt.treatment} (${isCompleted ? 'הושלם/שולם' : 'מתוכנן'})`}
                    >
                      {isCompleted && <span style={{ fontWeight: 'bold', marginRight: '2px' }}>✓</span>}
                      {apt.hour} - {apt.clientName}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
