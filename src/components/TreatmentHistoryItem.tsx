'use client';

import { useState } from 'react';

export default function TreatmentHistoryItem({ log }: { log: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = log.seriesTotal 
    ? `טיפול ${log.treatmentNumber} מתוך ${log.seriesTotal}` 
    : `טיפול בודד`;

  return (
    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}>
      {/* Compact Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          padding: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: isExpanded ? 'rgba(255, 255, 255, 0.5)' : 'transparent'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--color-rose-gold)' }}>
            {new Date(log.createdAt).toLocaleDateString('he-IL')}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{title}</span>
          <span style={{ color: 'var(--color-charcoal-light)' }}>- אזור: {log.bodyArea}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: 'var(--color-rose-gold)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}>
            ▼
          </div>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm('האם את בטוחה שברצונך למחוק תיעוד זה?')) {
                const { deleteTreatmentLog } = await import('@/actions/crmActions');
                await deleteTreatmentLog(log.id, log.clientId);
              }
            }}
            style={{
              background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem'
            }}
            title="מחק תיעוד"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>פרמטרי לייזר</p>
              <p style={{ margin: 0 }}>עוצמת לייזר (Fluence): <strong>{log.fluenceJoule}J</strong></p>
            </div>
            {log.technicianNotes && (
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '0.5rem', borderRadius: '8px', borderLeft: '3px solid var(--color-rose-gold)' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>📝 הערות:</p>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.technicianNotes}</p>
              </div>
            )}
          </div>
          
          {log.imageUrls && (
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>תמונות מצב:</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {log.imageUrls.split(',').map((url: string, index: number) => (
                  <img key={index} src={url} alt={`Treatment ${log.treatmentNumber} - ${index}`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                ))}
              </div>
            </div>
          )}

          {log.invoices && log.invoices.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.8)', border: '1px solid var(--color-rose-gold)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  {log.invoices[0].type === 'TAX_RECEIPT' ? 'חשבונית מס קבלה' : 'קבלה'} מס׳ {log.invoices[0].invoiceNumber}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--color-charcoal-light)' }}>
                  סכום: ₪{log.invoices[0].amount} | אמצעי תשלום: {log.invoices[0].paymentMethod}
                </p>
              </div>
              <a 
                href={`/invoice/${log.invoices[0].id}`} 
                target="_blank" 
                style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal)', color: 'white', borderRadius: '4px', textDecoration: 'none' }}
              >
                הצג מסמך
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
