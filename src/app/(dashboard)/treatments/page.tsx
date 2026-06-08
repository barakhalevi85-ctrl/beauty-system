import styles from './treatments.module.css';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { TreatmentsHeader } from '@/components/TreatmentsHeader';

export const metadata: Metadata = {
  title: 'ניהול טיפולים ומחירון - GlamFlow',
  description: 'ניהול טיפולי לייזר והסרת שיער',
};

export const dynamic = 'force-dynamic';

export default async function TreatmentsPage() {
  const services = await prisma.service.findMany({
    orderBy: {
      category: 'asc'
    }
  });

  // Group by category
  const categoriesMap = new Map<string, typeof services>();
  services.forEach(service => {
    if (!categoriesMap.has(service.category)) {
      categoriesMap.set(service.category, []);
    }
    categoriesMap.get(service.category)!.push(service);
  });

  const categories = Array.from(categoriesMap.entries()).map(([name, treatments]) => ({
    id: name,
    name,
    treatments
  }));

  return (
    <div className={styles.container}>
      <TreatmentsHeader />

      <main>
        {categories.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>אין טיפולים במערכת עדיין. הוסף טיפול חדש.</p>
          </div>
        )}
        {categories.map((category) => (
          <section key={category.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{category.name}</h2>
            <div className={styles.grid}>
              {category.treatments.map((treatment) => (
                <div key={treatment.id} className={`glass-panel ${styles.card}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.serviceName}>{treatment.name}</h3>
                    <span className={styles.price}>₪{treatment.price}</span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>חבילה:</span>
                      <span className={styles.value}>{treatment.packageType}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>משך זמן משוער:</span>
                      <span className={styles.value}>{treatment.durationMinutes} דק'</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button className={styles.actionButton}>ערוך</button>
                    <button className={`${styles.actionButton} ${styles.danger}`}>מחק</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
