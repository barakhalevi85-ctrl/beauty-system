import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    upcomingAppointmentsToday,
    thisMonthSeries,
    expiringSeries,
    allActiveSeries,
    futureAppointments,
    allServices
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.appointment.count({ where: { date: { gte: startOfToday, lt: endOfToday } } }),
    prisma.appointment.count({ where: { date: { gte: startOfWeek, lt: endOfWeek } } }),
    prisma.appointment.findMany({
      where: { date: { gte: startOfToday, lt: endOfToday } },
      include: { client: true, service: true },
      orderBy: { date: 'asc' }
    }),
    prisma.clientSeries.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { pricePaid: true, createdAt: true }
    }),
    prisma.clientSeries.findMany({
      where: { isCompleted: false, totalTreatments: { gt: 1 } },
      include: { client: true, service: true }
    }),
    prisma.clientSeries.findMany({
      where: { isCompleted: false },
      include: { client: { select: { id: true, name: true, lastName: true, phone: true } }, service: { select: { name: true } } }
    }),
    prisma.appointment.findMany({
      where: { date: { gte: now } },
      select: { clientId: true }
    }),
    prisma.service.findMany({
      select: { category: true, name: true }
    })
  ]);

  // Group all services by category to summarize in the widget
  const servicesByCategory = allServices.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = 0;
    acc[s.category]++;
    return acc;
  }, {} as Record<string, number>);

  // Calculations
  const revenueThisMonth = thisMonthSeries.reduce((sum, s) => sum + (s.pricePaid || 0), 0);
  const revenueToday = thisMonthSeries.filter(s => s.createdAt >= startOfToday).reduce((sum, s) => sum + (s.pricePaid || 0), 0);

  // Expiring Series (1 or 2 treatments left)
  const expiringSeriesAlerts = expiringSeries.filter(s => s.totalTreatments - s.usedTreatments <= 2);

  // Clients with active series but NO future appointment
  const clientsWithFutureAptIds = new Set(futureAppointments.map(a => a.clientId));
  const clientsNeedingApt = allActiveSeries.filter(s => !clientsWithFutureAptIds.has(s.clientId));

  // Deduplicate clientsNeedingApt by clientId so we don't show the same client twice if they have multiple series
  const uniqueClientsNeedingAptMap = new Map();
  for (const s of clientsNeedingApt) {
    if (!uniqueClientsNeedingAptMap.has(s.clientId)) {
      uniqueClientsNeedingAptMap.set(s.clientId, s);
    } else {
      // Just append the service name to show they have multiple active
      const existing = uniqueClientsNeedingAptMap.get(s.clientId);
      existing.service.name += ` + ${s.service.name}`;
    }
  }
  const uniqueClientsNeedingApt = Array.from(uniqueClientsNeedingAptMap.values());

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>מבט על</h1>
      
      <div className={styles.statsGrid}>
        <Link href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={`glass-panel ${styles.clickableCard}`} style={{ borderBottom: '4px solid #4CAF50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>הכנסות היום</h3>
              <p className={styles.statValue} style={{ fontSize: '1.5rem', color: '#4CAF50' }}>₪{revenueToday.toLocaleString()}</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', height: '50px' }}></div>
            <div style={{ textAlign: 'left' }}>
              <h3>הכנסות החודש</h3>
              <p className={styles.statValue} style={{ fontSize: '1.5rem' }}>₪{revenueThisMonth.toLocaleString()}</p>
            </div>
          </div>
        </Link>
        <div className="glass-panel">
          <h3>סה"כ לקוחות פעילים</h3>
          <p className={styles.statValue}>{totalClients}</p>
        </div>
        <div className="glass-panel">
          <h3>תורים השבוע</h3>
          <p className={styles.statValue}>{appointmentsThisWeek}</p>
        </div>
        <div className="glass-panel" style={{ borderBottom: '4px solid var(--color-charcoal-light)' }}>
          <h3>מקום פנוי</h3>
          <p className={styles.statValue} style={{ color: 'transparent' }}>-</p>
        </div>
      </div>

      <div className={styles.widgetsGrid}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={`glass-panel ${styles.widget}`}>
            <h2>תורים להיום ({appointmentsToday})</h2>
            {upcomingAppointmentsToday.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {upcomingAppointmentsToday.map(apt => (
                  <li key={apt.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--color-rose-gold)' }}>
                        {apt.date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                      <span style={{ margin: '0 0.5rem' }}>-</span>
                      <Link href={`/crm/${apt.clientId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                        {apt.client.name} {apt.client.lastName}
                      </Link>
                      {apt.service && <span style={{ opacity: 0.7, fontSize: '0.9em', marginRight: '0.5rem' }}>({apt.service.name})</span>}
                    </div>
                    <span style={{ color: apt.status === 'completed' ? 'green' : 'var(--color-charcoal-light)', fontSize: '0.85rem' }}>
                      {apt.status === 'completed' ? '✓ בוצע' : 'ממתין'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>אין תורים קרובים היום</div>
            )}
          </div>

          <div className={`glass-panel ${styles.widget}`} style={{ borderColor: 'rgba(255, 193, 7, 0.3)' }}>
            <h2>לקוחות ללא תור עתידי (עם סדרה פעילה)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)', marginBottom: '1rem' }}>לקוחות שיש להן כרטיסייה פתוחה אבל לא קבעו תור הבא.</p>
            {uniqueClientsNeedingApt.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {uniqueClientsNeedingApt.map(s => (
                  <li key={s.id} style={{ padding: '0.75rem', background: 'rgba(255, 193, 7, 0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Link href={`/crm/${s.clientId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                        {s.client.name} {s.client.lastName}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)' }}>
                        סדרה פעילה: {s.service.name}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {s.client.phone && (
                        <a href={`https://wa.me/972${s.client.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" title="שלח וואטסאפ" style={{ textDecoration: 'none', background: '#25D366', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          💬
                        </a>
                      )}
                      <Link href="/calendar" title="קביעת תור ביומן" style={{ textDecoration: 'none', background: 'var(--color-rose-gold)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        📅
                      </Link>
                      <Link href={`/crm/${s.clientId}`} title="תיק לקוח" style={{ textDecoration: 'none', background: 'var(--color-charcoal)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        👤
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>כל הלקוחות הפעילות קבעו תור עתידי! איזה יופי.</div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={`glass-panel ${styles.widget}`} style={{ borderColor: 'var(--color-rose-gold)' }}>
            <h2>הזדמנויות שימור (סדרות שמסתיימות)</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)', marginBottom: '1rem' }}>לקוחות שנשארו להן 1-2 טיפולים לסיום הסדרה.</p>
            {expiringSeriesAlerts.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {expiringSeriesAlerts.map(s => (
                  <li key={s.id} style={{ padding: '0.75rem', background: 'rgba(212, 175, 159, 0.1)', borderRadius: '8px', border: '1px solid var(--color-rose-gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Link href={`/crm/${s.clientId}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                        {s.client.name} {s.client.lastName}
                      </Link>
                      <span style={{ fontWeight: 'bold', color: '#ff4d4d' }}>
                        ניצלה {s.usedTreatments} מתוך {s.totalTreatments}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)', marginTop: '0.25rem' }}>
                      סדרה: {s.service.name}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>אין סדרות שמסתיימות בקרוב.</div>
            )}
          </div>

          <Link href="/treatments" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className={`glass-panel ${styles.clickableCard}`} style={{ borderColor: 'var(--color-charcoal-light)', padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>מחירון וטיפולים</h2>
                <span style={{ background: 'var(--color-charcoal)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  לניהול המחירון 👈
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-light)', marginBottom: '1rem' }}>קיימים {allServices.length} טיפולים פעילים במערכת.</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(servicesByCategory).map(([cat, count]) => (
                  <div key={cat} style={{ background: 'rgba(0,0,0,0.05)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', flex: '1 1 45%', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{cat}</strong>
                    <span>{count} טיפולים</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>

        </div>
        
      </div>
    </div>
  );
}
