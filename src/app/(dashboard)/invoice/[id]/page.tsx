import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

import InvoiceActions from './InvoiceActions';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: resolvedParams.id },
    include: { client: true }
  });

  if (!invoice) {
    notFound();
  }

  const sysSettings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
  const bizSettings = sysSettings?.businessSettings ? JSON.parse(sysSettings.businessSettings) : {};

  const isTaxReceipt = invoice.type === 'TAX_RECEIPT';
  const title = isTaxReceipt ? 'חשבונית מס קבלה' : 'קבלה';

  // Calculate VAT if needed (Price is inclusive of 17% VAT)
  const VAT_RATE = 0.17;
  const totalAmount = invoice.amount;
  const priceBeforeVat = isTaxReceipt ? totalAmount / (1 + VAT_RATE) : totalAmount;
  const vatAmount = isTaxReceipt ? totalAmount - priceBeforeVat : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <InvoiceActions phone={invoice.client.phone} email={invoice.client.email} />
        <div style={{ textAlign: 'left', color: '#666' }}>מקור</div>
      </div>

      <header style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{bizSettings.businessName || 'שם העסק'}</h1>
          <p style={{ margin: '0' }}>ע.מ / ח.פ: {bizSettings.businessId || 'לא מוגדר'}</p>
          <p style={{ margin: '0' }}>כתובת: {bizSettings.address || 'לא מוגדר'}</p>
          <p style={{ margin: '0' }}>טלפון: {bizSettings.phone || 'לא מוגדר'}</p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>{title}</h2>
          <p style={{ margin: '0', fontWeight: 'bold' }}>מספר: {invoice.invoiceNumber}</p>
          <p style={{ margin: '0' }}>תאריך: {new Date(invoice.date).toLocaleDateString('he-IL')}</p>
          <p style={{ margin: '0' }}>שעה: {new Date(invoice.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>לכבוד:</h3>
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.2rem' }}>{invoice.client.name} {invoice.client.lastName}</p>
        {invoice.client.idNumber && <p style={{ margin: '0' }}>ת.ז: {invoice.client.idNumber}</p>}
        {invoice.client.phone && <p style={{ margin: '0' }}>טלפון: {invoice.client.phone}</p>}
      </section>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '0.75rem', textAlign: 'right' }}>תיאור</th>
            <th style={{ padding: '0.75rem', textAlign: 'left' }}>סכום (₪)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '0.75rem' }}>{invoice.description}</td>
            <td style={{ padding: '0.75rem', textAlign: 'left' }}>{totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <section style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <div>
          <strong>אמצעי תשלום:</strong> {invoice.paymentMethod || 'לא צוין'}
        </div>
        <div style={{ textAlign: 'left' }}>
          {isTaxReceipt && (
            <>
              <p style={{ margin: '0 0 0.5rem 0' }}>סכום לפני מע"מ: ₪{priceBeforeVat.toFixed(2)}</p>
              <p style={{ margin: '0 0 0.5rem 0' }}>מע"מ (17%): ₪{vatAmount.toFixed(2)}</p>
            </>
          )}
          <p style={{ margin: '0', fontSize: '1.4rem', fontWeight: 'bold' }}>סה"כ לתשלום: ₪{totalAmount.toFixed(2)}</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', color: '#888', marginTop: '4rem', fontSize: '0.9rem' }}>
        <p>הופק באמצעות מערכת Beauty System</p>
      </footer>
      
      {/* Add a CSS block to hide the button and navigation during printing */}
      <style>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          nav {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
