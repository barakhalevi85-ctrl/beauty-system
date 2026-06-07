import styles from "./page.module.css";

export default function DashboardHome() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>מבט על</h1>
      
      <div className={styles.statsGrid}>
        <div className="glass-panel">
          <h3>הכנסות החודש</h3>
          <p className={styles.statValue}>₪12,450</p>
        </div>
        <div className="glass-panel">
          <h3>תורים עתידיים</h3>
          <p className={styles.statValue}>136</p>
        </div>
        <div className="glass-panel">
          <h3>לקוחות חדשים</h3>
          <p className={styles.statValue}>12</p>
        </div>
        <div className="glass-panel">
          <h3>תורים שבוטלו</h3>
          <p className={styles.statValue}>3</p>
        </div>
      </div>

      <div className={styles.widgetsGrid}>
        <div className={`glass-panel ${styles.widget}`}>
          <h2>תורים קרובים (היום)</h2>
          <div className={styles.emptyState}>אין תורים קרובים היום</div>
        </div>
        <div className={`glass-panel ${styles.widget}`}>
          <h2>פילוח לקוחות</h2>
          <div className={styles.emptyState}>נתונים יופיעו כאן בקרוב...</div>
        </div>
      </div>
    </div>
  );
}
