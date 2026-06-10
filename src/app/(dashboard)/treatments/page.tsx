import styles from './treatments.module.css';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { TreatmentsHeader } from '@/components/TreatmentsHeader';
import { TreatmentActions } from '@/components/TreatmentActions';
import { CategoryActions } from '@/components/CategoryActions';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {categories.map((category) => {
            const visibleTreatments = category.treatments.filter(t => t.name !== 'dummy_category_init');
            return (
            <section key={category.id} className={styles.categorySection} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1rem' }}>
                <h2 className={styles.categoryTitle} style={{ marginBottom: 0 }}>{category.name}</h2>
                <CategoryActions categoryName={category.name} treatmentCount={visibleTreatments.length} />
              </div>
              <div className="glass-panel" style={{ maxHeight: '400px', overflowY: 'auto', padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}>
                    <tr style={{ borderBottom: '2px solid var(--color-rose-gold)' }}>
                      <th style={{ padding: '1rem', fontWeight: 'bold' }}>שם הטיפול</th>
                      <th style={{ padding: '1rem', fontWeight: 'bold' }}>מחיר (₪)</th>
                      <th style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'center' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTreatments.map((treatment) => (
                      <tr key={treatment.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-charcoal-black)' }}>
                          {treatment.name}
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-light)', fontWeight: 'normal', marginTop: '0.25rem' }}>
                            {treatment.packageType} | {treatment.durationMinutes} דק'
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--color-rose-gold)', fontSize: '1.1rem' }}>₪{treatment.price}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <TreatmentActions treatment={treatment} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
