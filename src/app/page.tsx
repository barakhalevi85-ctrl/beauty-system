import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={`glass-panel ${styles.hero}`}>
        <h1>ברוכים הבאים ל-GlamFlow</h1>
        <p>מערכת ניהול תורים מודרנית ודינמית למקצועות הביוטי.</p>
      </div>
    </main>
  );
}
