'use client';

import React, { useEffect, useState } from 'react';

export default function InvoiceActions({ phone, email }: { phone?: string | null, email?: string | null }) {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const waLink = cleanPhone ? `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone}?text=${encodeURIComponent('היי, מצורפת קבלה/חשבונית עבור הטיפול: ' + currentUrl)}` : `https://wa.me/?text=${encodeURIComponent('היי, מצורפת קבלה/חשבונית עבור הטיפול: ' + currentUrl)}`;
  const smsLink = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent('קבלה עבור הטיפול: ' + currentUrl)}` : `sms:?body=${encodeURIComponent('קבלה עבור הטיפול: ' + currentUrl)}`;
  const emailLink = `mailto:${email || ''}?subject=${encodeURIComponent('קבלה/חשבונית מ-Beauty System')}&body=${encodeURIComponent('היי, מצורפת הקבלה/חשבונית בקישור הבא:\n' + currentUrl)}`;

  return (
    <div className="print-hidden" style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={handlePrint} 
        style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        🖨️ הדפס
      </button>
      <a 
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '0.5rem 1rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        💬 וואטסאפ
      </a>
      <a 
        href={smsLink}
        style={{ padding: '0.5rem 1rem', background: '#007AFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        📱 SMS
      </a>
      <a 
        href={emailLink}
        style={{ padding: '0.5rem 1rem', background: '#DB4437', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        📧 אימייל
      </a>
    </div>
  );
}
