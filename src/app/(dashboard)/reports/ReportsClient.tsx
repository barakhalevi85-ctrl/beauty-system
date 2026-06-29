'use client';

import React, { useState, useEffect } from 'react';
import styles from './reports.module.css';
import { getReportData } from '@/actions/reportActions';
import Link from 'next/link';

export default function ReportsClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const result = await getReportData(startDate, endDate);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleExportExcel() {
    // Basic CSV export for invoices
    if (!data || !data.recentInvoices) return;
    
    const headers = ['תאריך', 'מספר קבלה', 'שם לקוח', 'סוג', 'אמצעי תשלום', 'סכום (₪)', 'תיאור'];
    const rows = data.recentInvoices.map((inv: any) => [
      new Date(inv.date).toLocaleDateString('he-IL'),
      inv.invoiceNumber,
      inv.client ? `${inv.client.name} ${inv.client.lastName || ''}` : 'לקוח כללי',
      inv.type === 'CREDIT_INVOICE' ? 'זיכוי' : 'קבלה',
      inv.paymentMethod || '-',
      inv.type === 'CREDIT_INVOICE' ? -inv.amount : inv.amount,
      inv.description
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + "\n"
      + rows.map((e: any[]) => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>דוחות והכנסות</h1>
        <p>מעקב וניתוח נתונים פיננסיים של העסק</p>
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
        <button onClick={handleExportExcel} disabled={loading || !data} className={styles.exportBtn}>
          📥 ייצוא ל-Excel (CSV)
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>טוען נתונים...</div>
      ) : data ? (
        <>
          <div className={styles.statsGrid}>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3>הכנסה נטו</h3>
              <div className={styles.statValue} style={{ color: 'var(--color-success)' }}>
                ₪{data.netIncome.toLocaleString()}
              </div>
              <div className={styles.statSub}>
                (הכנסות: ₪{data.totalIncome.toLocaleString()} | זיכויים: ₪{data.totalRefunds.toLocaleString()})
              </div>
            </div>
            
            <div className={`glass-panel ${styles.statCard}`}>
              <h3>טיפולים שבוצעו</h3>
              <div className={styles.statValue}>{data.treatmentsCount}</div>
            </div>

            <div className={`glass-panel ${styles.statCard}`}>
              <h3>לקוחות חדשים</h3>
              <div className={styles.statValue}>{data.newClientsCount}</div>
            </div>
          </div>

          <div className={styles.breakdownGrid}>
            <div className={`glass-panel ${styles.breakdownCard}`}>
              <h3>הכנסות לפי אמצעי תשלום</h3>
              <ul className={styles.methodList}>
                {Object.entries(data.incomeByMethod).map(([method, amount]: [string, any]) => (
                  <li key={method}>
                    <span>{method}</span>
                    <strong>₪{amount.toLocaleString()}</strong>
                  </li>
                ))}
                {Object.keys(data.incomeByMethod).length === 0 && <li>אין הכנסות בטווח זה</li>}
              </ul>
            </div>

            <div className={`glass-panel ${styles.breakdownCard}`}>
              <h3>תנועות אחרונות (עד 100)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>תאריך</th>
                      <th>לקוח</th>
                      <th>סכום</th>
                      <th>אמצעי תשלום</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentInvoices.map((inv: any) => (
                      <tr key={inv.id}>
                        <td>{new Date(inv.date).toLocaleDateString('he-IL')}</td>
                        <td>
                          <Link href={`/crm/${inv.clientId}`} style={{ color: 'var(--color-charcoal-black)' }}>
                            {inv.client ? `${inv.client.name} ${inv.client.lastName || ''}` : 'לקוח כללי'}
                          </Link>
                        </td>
                        <td style={{ color: inv.type === 'CREDIT_INVOICE' ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 'bold' }}>
                          {inv.type === 'CREDIT_INVOICE' ? '-' : '+'}₪{inv.amount}
                        </td>
                        <td>{inv.paymentMethod || '-'}</td>
                      </tr>
                    ))}
                    {data.recentInvoices.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center' }}>אין תנועות</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>שגיאה בטעינת הנתונים.</div>
      )}
    </div>
  );
}
