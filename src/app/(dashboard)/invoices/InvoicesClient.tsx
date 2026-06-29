'use client';

import React, { useState, useEffect } from 'react';
import styles from './invoices.module.css';
import Link from 'next/link';
import { getReportData } from '@/actions/reportActions';

export default function InvoicesClient() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);

  useEffect(() => {
    fetchInvoices();
  }, [startDate, endDate]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const result = await getReportData(startDate, endDate);
      setInvoices(result.recentInvoices);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelInvoice(invoiceId: string) {
    if (!confirm('האם את בטוחה שברצונך לבטל חשבונית זו? פעולה זו תפיק חשבונית זיכוי אוטומטית.')) return;
    
    try {
      const { cancelInvoice } = await import('@/actions/invoiceActions');
      await cancelInvoice(invoiceId);
      alert('החשבונית בוטלה וחשבונית זיכוי הופקה בהצלחה.');
      fetchInvoices(); // refresh
    } catch (e: any) {
      alert(e.message || 'שגיאה בביטול החשבונית');
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ניהול חשבוניות</h1>
        <p>צפייה בחשבוניות, הדפסה חוזרת והפקת זיכויים</p>
      </header>

      <div className={`glass-panel ${styles.filterBar}`}>
        <div className={styles.dateInputs}>
          <div>
            <label>מתאריך:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.input} />
          </div>
          <div>
            <label>עד תאריך:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.input} />
          </div>
        </div>
      </div>

      <div className={`glass-panel ${styles.tableCard}`}>
        {loading ? (
          <div className={styles.loading}>טוען חשבוניות...</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>מס' קבלה</th>
                  <th>לקוח</th>
                  <th>סוג</th>
                  <th>סכום</th>
                  <th>אמצעי תשלום</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className={inv.type === 'CREDIT_INVOICE' ? styles.rowCredit : ''}>
                    <td>{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                    <td>{inv.invoiceNumber}</td>
                    <td>
                      <Link href={`/crm/${inv.clientId}`} style={{ color: 'var(--color-charcoal-black)' }}>
                        {inv.client ? `${inv.client.name} ${inv.client.lastName || ''}` : 'לקוח כללי'}
                      </Link>
                    </td>
                    <td>{inv.type === 'CREDIT_INVOICE' ? 'זיכוי' : 'קבלה'}</td>
                    <td style={{ color: inv.type === 'CREDIT_INVOICE' ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 'bold' }}>
                      {inv.type === 'CREDIT_INVOICE' ? '-' : '+'}₪{inv.amount}
                    </td>
                    <td>{inv.paymentMethod || '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <a href={`/invoice/${inv.id}`} target="_blank" className={styles.actionBtn}>
                          🖨️ הדפס
                        </a>
                        {inv.type !== 'CREDIT_INVOICE' && (
                          <button 
                            onClick={() => handleCancelInvoice(inv.id)} 
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          >
                            ❌ בטל / זכה
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>אין חשבוניות בטווח זה</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
