'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClient } from '@/actions/crmActions';

export default function DeleteClientButton({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`הלקוח/ה ${clientName} יועבר לארכיון ויוגדר כלא פעיל. האם להמשיך?`)) {
      setIsDeleting(true);
      try {
        await deleteClient(clientId);
        router.push('/crm');
      } catch (err) {
        console.error('Error archiving client:', err);
        alert('שגיאה בהעברת הלקוח לארכיון.');
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        padding: '0.3rem 0.8rem',
        fontSize: '0.85rem',
        background: 'transparent',
        color: '#ff4d4d',
        border: '1px solid rgba(255, 50, 50, 0.4)',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: 0.7
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
    >
      {isDeleting ? 'מוחק...' : 'מחק לקוח'}
    </button>
  );
}
