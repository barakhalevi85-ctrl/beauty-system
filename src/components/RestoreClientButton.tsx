'use client';

import { useState } from 'react';
import { restoreClient } from '@/actions/crmActions';

export default function RestoreClientButton({ clientId }: { clientId: string }) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (confirm('הלקוח/ה יועבר לרשימת הלקוחות הפעילים. האם להמשיך?')) {
      setIsRestoring(true);
      try {
        await restoreClient(clientId);
      } catch (err) {
        console.error(err);
        alert('שגיאה בשחזור הלקוח');
      } finally {
        setIsRestoring(false);
      }
    }
  };

  return (
    <button 
      onClick={handleRestore}
      disabled={isRestoring}
      style={{
        padding: '0.5rem 1rem',
        background: 'rgba(50, 200, 50, 0.2)',
        color: '#28a745',
        border: '1px solid rgba(50, 200, 50, 0.4)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
      }}
    >
      {isRestoring ? 'משחזר...' : '♻️ שחזר לקוח'}
    </button>
  );
}
