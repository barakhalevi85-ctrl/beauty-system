import React from 'react';
import styles from './clientList.module.css';
import { prisma } from '@/lib/prisma';
import AddClientModal from '@/components/AddClientModal';
import ClientRow from '@/components/ClientRow';
import Link from 'next/link';

async function getClients(tab: string) {
  let whereClause = {};
  if (tab === 'inactive') whereClause = { isActive: false };
  else if (tab === 'all') whereClause = {};
  else whereClause = { isActive: true };

  return await prisma.client.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
}

export default async function CRMListPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams.tab || 'active';
  const clients = await getClients(tab);

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass-panel`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className={styles.headerInfo}>
            <h1>ניהול לקוחות (CRM)</h1>
            <p>ניהול כלל לקוחות הקליניקה</p>
          </div>
          <AddClientModal />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '0.5rem' }}>
          <Link href="?tab=active" style={{
            padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold',
            background: tab === 'active' ? 'var(--color-rose-gold)' : 'transparent',
            color: tab === 'active' ? 'white' : 'var(--color-charcoal-light)'
          }}>לקוחות פעילים</Link>
          <Link href="?tab=inactive" style={{
            padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold',
            background: tab === 'inactive' ? 'var(--color-rose-gold)' : 'transparent',
            color: tab === 'inactive' ? 'white' : 'var(--color-charcoal-light)'
          }}>לקוחות לא פעילים</Link>
          <Link href="?tab=all" style={{
            padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold',
            background: tab === 'all' ? 'var(--color-rose-gold)' : 'transparent',
            color: tab === 'all' ? 'white' : 'var(--color-charcoal-light)'
          }}>כל הלקוחות</Link>
        </div>
      </header>

      <section>
        <div className={`${styles.tableContainer} glass-panel`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>שם מלא</th>
                <th>טלפון</th>
                <th>תעודת זהות</th>
                <th>מגדר</th>
                <th>תאריך הצטרפות</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    אין לקוחות במערכת. לחץ על "הוסף לקוח חדש" כדי להתחיל.
                  </td>
                </tr>
              )}
              {clients.map(client => (
                <ClientRow key={client.id} client={client} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
