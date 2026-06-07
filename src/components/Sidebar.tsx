import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h2>GlamFlow</h2>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li className={styles.active}><Link href="/">לוח בקרה</Link></li>
          <li><Link href="/calendar">יומן תורים</Link></li>
          <li><Link href="/clients">לקוחות (CRM)</Link></li>
          <li><Link href="/reports">דוחות וחשבוניות</Link></li>
          <li><Link href="/settings">הגדרות</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
