'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { logout } from '@/actions/authActions';

export default function Sidebar() {
  const pathname = usePathname() || '';
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>GlamFlow</h2>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li className={pathname === '/' ? styles.active : ''}><Link href="/">לוח בקרה</Link></li>
          <li className={pathname.startsWith('/calendar') ? styles.active : ''}><Link href="/calendar">יומן תורים</Link></li>
          <li className={pathname.startsWith('/crm') ? styles.active : ''}><Link href="/crm">לקוחות (CRM)</Link></li>
          <li className={pathname.startsWith('/treatments') ? styles.active : ''}><Link href="/treatments">💅 מחירון טיפולים</Link></li>
          <li className={pathname.startsWith('/reports') ? styles.active : ''}><Link href="/reports">📊 דוחות והכנסות</Link></li>
          <li className={pathname.startsWith('/invoices') ? styles.active : ''}><Link href="/invoices">🧾 חשבוניות</Link></li>
          <li className={pathname.startsWith('/settings') ? styles.active : ''}><Link href="/settings">⚙️ הגדרות</Link></li>
        </ul>
      </nav>
      <form action={logout} style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button type="submit" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 1rem', width: '100%', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span>🚪</span> יציאה
        </button>
      </form>
    </aside>
  );
}
