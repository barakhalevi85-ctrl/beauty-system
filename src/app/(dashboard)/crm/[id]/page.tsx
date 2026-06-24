import React from 'react';
import styles from '../crm.module.css';
import { prisma } from '@/lib/prisma';
import SellPackageModal from '../SellPackageModal';
import EditSeriesModal from '../EditSeriesModal';
import AddCallLogForm from '@/components/AddCallLogForm';
import EditableCallLog from '@/components/EditableCallLog';
import DeleteClientButton from '@/components/DeleteClientButton';
import TreatmentHistoryItem from '@/components/TreatmentHistoryItem';
import FutureAppointmentItem from '@/components/FutureAppointmentItem';
import { notFound } from 'next/navigation';

async function getClientWithLogs(id: string) {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      clientSeries: {
        include: { service: true, invoices: true },
        orderBy: { createdAt: 'desc' },
      },
      treatmentLogs: {
        include: { invoices: true },
        orderBy: { createdAt: 'desc' },
      },
      callLogs: {
        orderBy: { createdAt: 'desc' },
      },
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        include: { service: true }
      }
    }
  });
}

export default async function CRMPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await getClientWithLogs(resolvedParams.id);
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  
  if (!client) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass-panel`}>
        <div className={styles.clientInfo}>
          <h1>תיק לקוח: {client.name} {client.lastName}</h1>
          <p>תעודת זהות: {client.idNumber || client.id}</p>
          <div className={styles.contactDetails}>
            <span className={styles.contactItem}>📞 {client.phone}</span>
            {client.email && <span className={styles.contactItem}>✉️ {client.email}</span>}
            <span className={styles.contactItem}>📍 {client.address || 'לא צוינה כתובת'}</span>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>
            <p><strong>מצב רפואי / הערות:</strong> {client.medicalNotes || 'אין'}</p>
            <p><strong>הצהרת בריאות:</strong> {client.healthDeclarationSent ? 'נשלחה ✅' : 'לא נשלחה ❌'}</p>
          </div>
        </div>
        <SellPackageModal clientId={client.id} clientGender={client.gender || null} services={services} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <h2 className={styles.sectionTitle}>כרטיסיות פתוחות / סדרות</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {client.clientSeries.length === 0 && (
              <p>אין כרטיסיות או סדרות קיימות ללקוח זה.</p>
            )}
            {client.clientSeries.map((series) => (
              <div key={series.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {series.serviceName || series.service?.name} ({series.service.category})
                    <EditSeriesModal series={series} services={services} clientId={client.id} />
                  </h3>
                  <p style={{ margin: 0, color: 'var(--color-charcoal-light)' }}>
                    {series.totalTreatments > 1 
                      ? `סדרה של ${series.totalTreatments} טיפולים` 
                      : 'טיפול בודד'
                    } | נרכש ב: {new Date(series.createdAt).toLocaleDateString('he-IL')} | שולם: ₪{series.pricePaid || 0}
                  </p>
                  {series.invoices && series.invoices.length > 0 && (
                    <a 
                      href={`/invoice/${series.invoices[0].id}`} 
                      target="_blank" 
                      style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--color-rose-gold)', color: 'var(--color-charcoal)', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      📄 הצג {series.invoices[0].type === 'TAX_RECEIPT' ? 'חשבונית מס קבלה' : 'קבלה'} ({series.invoices[0].invoiceNumber})
                    </a>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: series.usedTreatments >= series.totalTreatments ? 'green' : 'var(--color-rose-gold)' }}>
                    {series.usedTreatments} / {series.totalTreatments}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>נוצלו</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>תורים עתידיים</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {client.appointments.length === 0 && (
              <p>אין תורים עתידיים ללקוח זה.</p>
            )}
            {client.appointments.map((apt) => (
              <FutureAppointmentItem key={apt.id} appointment={apt} services={services} />
            ))}
          </div>

          <h2 className={styles.sectionTitle}>היסטוריית טיפולים</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {client.treatmentLogs.length === 0 && (
              <p>אין היסטוריית טיפולים ללקוח זה.</p>
            )}
            {client.treatmentLogs.map((treatment) => (
              <TreatmentHistoryItem key={treatment.id} log={treatment} />
            ))}
          </div>
        </section>

        <aside>
          <h2 className={styles.sectionTitle}>מעקב שיחות והערות</h2>
          <AddCallLogForm clientId={client.id} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {client.callLogs.length === 0 && (
              <p>אין הערות או שיחות מתועדות.</p>
            )}
            {client.callLogs.map((log) => (
              <EditableCallLog key={log.id} log={log} />
            ))}
          </div>
        </aside>
      </div>

      {client.isActive !== false && (
        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-start', padding: '1rem 0' }}>
          <DeleteClientButton clientId={client.id} clientName={`${client.name} ${client.lastName || ''}`} />
        </div>
      )}
    </div>
  );
}
