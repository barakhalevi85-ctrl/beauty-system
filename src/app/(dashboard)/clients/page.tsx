import styles from "./page.module.css";

export default function ClientsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>ניהול לקוחות (CRM)</h1>
        <button className={styles.primaryButton}>+ לקוח חדש</button>
      </div>

      <div className={styles.controls}>
        <input type="text" placeholder="חיפוש לקוח לפי שם או טלפון..." className={styles.searchInput} />
        <select className={styles.filterSelect}>
          <option value="all">כל הלקוחות</option>
          <option value="debt">לקוחות חייבים</option>
          <option value="laser">מטופלי לייזר</option>
        </select>
      </div>

      <div className={`glass-panel ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>שם מלא</th>
              <th>טלפון</th>
              <th>טיפול אחרון</th>
              <th>חוב פתוח</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>שירן אברהם</td>
              <td>050-1234567</td>
              <td>לייזר - בית שחי (12/05)</td>
              <td className={styles.debtPositive}>₪0</td>
              <td><span className={styles.badgeSuccess}>פעילה</span></td>
              <td><button className={styles.actionBtn}>צפה בכרטיס</button></td>
            </tr>
            <tr>
              <td>רון לוי</td>
              <td>054-9876543</td>
              <td>עיצוב גבות (10/05)</td>
              <td className={styles.debtNegative}>₪150</td>
              <td><span className={styles.badgeWarning}>חייב</span></td>
              <td><button className={styles.actionBtn}>צפה בכרטיס</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
