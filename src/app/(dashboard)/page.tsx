import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const now = new Date();
  
  // Start of today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  // Start of this week (assuming Sunday as first day)
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalClients,
    newClientsThisMonth,
    appointmentsToday,
    appointmentsThisWeek,
    upcomingAppointmentsToday
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    }),
    prisma.appointment.count({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    }),
    prisma.appointment.count({
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    }),
    prisma.appointment.findMany({
      where: {
        date: {
          gte: now,
          lt: endOfToday
        }
      },
      include: {
        client: true,
        service: true
      },
      orderBy: {
        date: 'asc'
      }
    })
  ]);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>מבט על</h1>
      
      <div className={styles.statsGrid}>
        <div className="glass-panel">
          <h3>סה"כ לקוחות</h3>
          <p className={styles.statValue}>{totalClients}</p>
        </div>
        <div className="glass-panel">
          <h3>תורים השבוע</h3>
          <p className={styles.statValue}>{appointmentsThisWeek}</p>
        </div>
        <div className="glass-panel">
          <h3>לקוחות חדשים (החודש)</h3>
          <p className={styles.statValue}>{newClientsThisMonth}</p>
        </div>
        <div className="glass-panel">
          <h3>תורים להיום</h3>
          <p className={styles.statValue}>{appointmentsToday}</p>
        </div>
      </div>

      <div className={styles.widgetsGrid}>
        <div className={`glass-panel ${styles.widget}`}>
          <h2>פילוח הכנסות</h2>
          <div className={styles.emptyState}>נתונים יופיעו כאן בקרוב...</div>
        </div>
        <div className={`glass-panel ${styles.widget}`}>
          <h2>תורים קרובים (היום)</h2>
          {upcomingAppointmentsToday.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcomingAppointmentsToday.map(apt => (
                <li key={apt.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <strong style={{ color: 'var(--primary-color)' }}>
                    {apt.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                  <span style={{ margin: '0 0.5rem' }}>-</span>
                  {apt.client.name} {apt.service && <span style={{ opacity: 0.7, fontSize: '0.9em' }}>({apt.service.name})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>אין תורים קרובים היום</div>
          )}
        </div>
      </div>
    </div>
  );
}
