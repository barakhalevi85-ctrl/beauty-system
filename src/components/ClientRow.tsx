'use client';

import { useRouter } from 'next/navigation';
import styles from '@/app/(dashboard)/crm/clientList.module.css';
import RestoreClientButton from './RestoreClientButton';

export default function ClientRow({ client }: { client: any }) {
  const router = useRouter();

  return (
    <tr className={styles.rowHover}>
      <td onClick={() => router.push(`/crm/${client.id}`)} style={{ cursor: 'pointer' }}>{client.name} {client.lastName || ''}</td>
      <td onClick={() => router.push(`/crm/${client.id}`)} style={{ cursor: 'pointer' }}>{client.phone}</td>
      <td onClick={() => router.push(`/crm/${client.id}`)} style={{ cursor: 'pointer' }}>{client.idNumber || '-'}</td>
      <td onClick={() => router.push(`/crm/${client.id}`)} style={{ cursor: 'pointer' }}>{client.gender || '-'}</td>
      <td onClick={() => router.push(`/crm/${client.id}`)} style={{ cursor: 'pointer' }}>{new Date(client.createdAt).toLocaleDateString('he-IL')}</td>
      <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span onClick={() => router.push(`/crm/${client.id}`)} className={styles.viewButton} style={{ cursor: 'pointer' }}>צפה בתיק</span>
        {client.isActive === false && (
          <RestoreClientButton clientId={client.id} />
        )}
      </td>
    </tr>
  );
}
