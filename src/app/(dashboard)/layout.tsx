import Sidebar from "@/components/Sidebar";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.userProfile}>
            <span>שלום, משתמש/ת</span>
            <div className={styles.avatar}>ג</div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
