import styles from './calendar.module.css';
import { prisma } from '@/lib/prisma';
import { CalendarGrid } from './CalendarGrid';
import { MonthlyCalendarView } from './MonthlyCalendarView';
import { getSystemSettings, getClosedDates } from '@/actions/settingsActions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string, view?: string }> }) {
  const params = await searchParams;
  const viewType = params.view === 'monthly' ? 'monthly' : 'weekly';
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  const settings = await getSystemSettings();
  const closedDates = await getClosedDates();
  
  const weeklySchedule = settings.weeklySchedule ? JSON.parse(settings.weeklySchedule) : null;
  
  let minHour = 7;
  let maxHour = 20;

  if (weeklySchedule) {
    minHour = 24;
    maxHour = 0;
    Object.values(weeklySchedule).forEach((day: any) => {
      if (day.isOpen) {
        const startH = parseInt(day.start.split(':')[0], 10);
        const endH = parseInt(day.end.split(':')[0], 10);
        if (startH < minHour) minHour = startH;
        if (endH > maxHour) maxHour = endH;
      }
    });
    if (minHour > 23) minHour = 7;
    if (maxHour < minHour) maxHour = 20;
    if (maxHour === 0) maxHour = 24;
  }

  const hours: string[] = [];
  for (let h = minHour; h <= maxHour; h++) {
    const hr = h.toString().padStart(2, '0');
    hours.push(`${hr}:00`);
    if (h !== maxHour) {
      hours.push(`${hr}:15`);
      hours.push(`${hr}:30`);
      hours.push(`${hr}:45`);
    }
  }

  const now = params.date ? new Date(params.date) : new Date();
  
  // boundaries for DB fetch
  let startDate = new Date();
  let endDate = new Date();
  
  // For weekly view
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  const weekDates = Array.from({length: 7}).map((_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));
  
  if (viewType === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setDate(startDate.getDate() - 7); // pad a week
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setDate(endDate.getDate() + 7); // pad a week
  } else {
    startDate = startOfWeek;
    endDate = endOfWeek;
  }

  const [dbAppointments, clients, services] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        client: true,
        service: true,
        treatmentLog: {
          include: { invoices: true }
        }
      }
    }),
    prisma.client.findMany({ select: { id: true, name: true } }),
    prisma.service.findMany({ select: { id: true, name: true, price: true, durationMinutes: true } })
  ]);

  // Map to UI format
  const mappedAppointments = dbAppointments.map(apt => {
    const dayIndex = apt.date.getDay(); // 0 = Sunday
    const dayName = days[dayIndex] || '';
    const hourNum = apt.date.getHours();
    const minNum = apt.date.getMinutes();
    const slotMin = Math.floor(minNum / 15) * 15;
    const hourStr = `${hourNum.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;
    
    // Default duration: 1 hour (4 slots) if not specified by service
    let durationSlots = 4;
    if (apt.service?.durationMinutes) {
      durationSlots = Math.ceil(apt.service.durationMinutes / 15);
    }

    return {
      id: apt.id,
      day: dayName,
      hour: hourStr,
      dateStr: apt.date.toDateString(),
      clientId: apt.clientId,
      serviceId: apt.serviceId,
      status: apt.status,
      clientName: apt.client.name,
      treatment: apt.service?.name || 'פגישה',
      durationSlots,
      endHourStr: new Date(apt.date.getTime() + (durationSlots * 15 * 60000)).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      treatmentLog: apt.treatmentLog
    };
  });

  return (
    <div className={styles.calendarContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, color: 'var(--color-charcoal-black)' }}>יומן תורים</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/calendar?view=weekly&date=${now.toISOString().split('T')[0]}`} style={{ padding: '0.5rem 1rem', background: viewType === 'weekly' ? 'var(--color-rose-gold)' : 'var(--color-charcoal-light)', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>תצוגה שבועית</Link>
          <Link href={`/calendar?view=monthly&date=${now.toISOString().split('T')[0]}`} style={{ padding: '0.5rem 1rem', background: viewType === 'monthly' ? 'var(--color-rose-gold)' : 'var(--color-charcoal-light)', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>תצוגה חודשית</Link>
        </div>
      </div>

      {viewType === 'monthly' ? (
        <MonthlyCalendarView 
          mappedAppointments={mappedAppointments}
          currentDateIso={now.toISOString()}
          closedDates={closedDates}
          weeklySchedule={weeklySchedule}
        />
      ) : (
        <CalendarGrid 
          mappedAppointments={mappedAppointments}
          days={days}
          hours={hours}
          weekDates={weekDates}
          clients={clients}
          services={services}
          currentDateIso={now.toISOString()}
          weeklySchedule={weeklySchedule}
          closedDates={closedDates}
        />
      )}
    </div>
  );
}
