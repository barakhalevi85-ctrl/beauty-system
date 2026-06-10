'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './crm.module.css';
import { sellPackage } from '@/actions/crmActions';
import { getAllServices } from '@/app/actions';
import { AddTreatmentModal as GlobalAddServiceModal } from '@/components/AddTreatmentModal';

export default function SellPackageModal({ clientId, clientGender, services }: { clientId: string, clientGender: string | null, services: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [localServices, setLocalServices] = useState<any[]>(services);
  const [isPending, setIsPending] = useState(false);
  const [isSeries, setIsSeries] = useState(true);
  const [seriesTotal, setSeriesTotal] = useState<number>(10);
  const [isAddingService, setIsAddingService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [pricePaid, setPricePaid] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');

  const [selectedGender, setSelectedGender] = useState<'women' | 'men' | null>(() => {
    if (!clientGender) return null;
    if (clientGender.includes('נקבה') || clientGender.includes('אישה')) return 'women';
    if (clientGender.includes('זכר') || clientGender.includes('גבר')) return 'men';
    return null;
  });
  const [selectedAreaName, setSelectedAreaName] = useState<string>('');

  const treatmentCategories = {
    women: {
      upperBody: ["ידיים מלאות", "חצי ידיים", "בית שחי", "פנים", "שפם", "גב עליון", "בטן"],
      lowerBody: ["רגליים מלאות", "חצי רגליים", "מפשעות ברזילאי", "קו ביקיני", "ישבן"]
    },
    men: {
      upperBody: ["זקן מלא", "קו לחיים וצוואר", "גב מלא", "כתפיים", "חזה", "בטן", "ידיים מלאות"],
      lowerBody: ["רגליים מלאות", "ישבן"]
    }
  };

  function handleSelectArea(areaName: string) {
    setSelectedAreaName(areaName);
    
    // Find matching service in DB to autofill price and set serviceId
    const targetCategoryPrefix = selectedGender === 'men' ? 'גבר' : 'נשים';
    const matchingService = localServices.find(s => 
      s.name === areaName && s.category.includes(targetCategoryPrefix)
    );

    if (matchingService) {
      setSelectedServiceId(matchingService.id);
      calculatePrice(matchingService.id, isSeries, seriesTotal, discount);
    } else {
      // If service is completely new or not in DB under this category
      setSelectedServiceId('');
      setPricePaid('');
    }
  }

  function calculatePrice(serviceId: string, isS: boolean, total: number, disc: number | '') {
    const srv = localServices.find(s => s.id === serviceId);
    if (srv && srv.price) {
      let base = srv.price * (isS ? total : 1);
      if (disc !== '') {
        base = base * (1 - Number(disc) / 100);
      }
      setPricePaid(Math.round(base));
    } else {
      setPricePaid('');
    }
  }

  function handleServiceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedServiceId(val);
    calculatePrice(val, isSeries, seriesTotal, discount);
  }

  function handleSeriesTotalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const total = Number(e.target.value);
    setSeriesTotal(total);
    calculatePrice(selectedServiceId, isSeries, total, discount);
  }

  function handleIsSeriesChange(isS: boolean) {
    setIsSeries(isS);
    calculatePrice(selectedServiceId, isS, seriesTotal, discount);
  }

  function handleDiscountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setDiscount(val);
    calculatePrice(selectedServiceId, isSeries, seriesTotal, val);
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPricePaid(e.target.value === '' ? '' : Number(e.target.value));
    setDiscount('');
  }

  const groupedServices = localServices.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await sellPackage(formData);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to sell package', error);
      alert('אירעה שגיאה בשמירת המכירה.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button className={styles.addButton} onClick={() => setIsOpen(true)}>
        + מכירת חבילה / סדרה
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={`${styles.modalContent} glass-panel`} style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2>מכירת חבילה / סדרה חדשה</h2>
            <p style={{ color: 'var(--color-charcoal-light)', marginBottom: '1rem' }}>
              כאן את מגדירה את החבילה שהלקוחה רכשה (הניקובים יתבצעו מתוך יומן התורים).
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input type="hidden" name="clientId" value={clientId} />

              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                  <input type="radio" value="single" checked={!isSeries} onChange={() => handleIsSeriesChange(false)} name="treatmentType" />
                  טיפול בודד
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                  <input type="radio" value="series" checked={isSeries} onChange={() => handleIsSeriesChange(true)} name="treatmentType" />
                  טיפול מסדרה
                </label>
              </div>

              {isSeries && (
                <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <span>סך הכל טיפולים בסדרה:</span>
                  <input 
                    type="number" 
                    name="seriesTotal"
                    value={seriesTotal} 
                    onChange={handleSeriesTotalChange} 
                    min={2} 
                    style={{ width: '60px', padding: '0.25rem' }} 
                    required={isSeries} 
                  />
                </div>
              )}

              <div className={styles.formGroup} style={{ background: 'rgba(255,255,255,0.7)', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>איזה טיפול / אזור הלקוחה קנתה?</label>
                
                {!selectedGender ? (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => setSelectedGender('women')} style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '8px', border: '2px solid var(--color-rose-gold)', background: 'transparent', cursor: 'pointer', flex: 1 }}>
                      נשים 👩
                    </button>
                    <button type="button" onClick={() => setSelectedGender('men')} style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '8px', border: '2px solid var(--color-charcoal)', background: 'transparent', cursor: 'pointer', flex: 1 }}>
                      גברים 👨
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 'bold', color: selectedGender === 'women' ? 'var(--color-rose-gold)' : 'var(--color-charcoal)' }}>
                        {selectedGender === 'women' ? 'טיפולי נשים' : 'טיפולי גברים'}
                      </span>
                      <button type="button" onClick={() => setSelectedGender(null)} style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
                        שנה מין
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {/* Upper Body */}
                      <div style={{ flex: 1, borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-charcoal-light)' }}>פלג גוף עליון</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {treatmentCategories[selectedGender].upperBody.map(area => (
                            <button 
                              key={area} 
                              type="button" 
                              onClick={() => handleSelectArea(area)}
                              style={{ 
                                padding: '0.5rem', 
                                borderRadius: '4px', 
                                border: selectedAreaName === area ? '2px solid var(--color-rose-gold)' : '1px solid rgba(0,0,0,0.1)', 
                                background: selectedAreaName === area ? 'var(--color-rose-gold)' : 'white',
                                color: selectedAreaName === area ? 'white' : 'black',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'right'
                              }}
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lower Body */}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-charcoal-light)' }}>פלג גוף תחתון</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {treatmentCategories[selectedGender].lowerBody.map(area => (
                            <button 
                              key={area} 
                              type="button" 
                              onClick={() => handleSelectArea(area)}
                              style={{ 
                                padding: '0.5rem', 
                                borderRadius: '4px', 
                                border: selectedAreaName === area ? '2px solid var(--color-rose-gold)' : '1px solid rgba(0,0,0,0.1)', 
                                background: selectedAreaName === area ? 'var(--color-rose-gold)' : 'white',
                                color: selectedAreaName === area ? 'white' : 'black',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'right'
                              }}
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>לא מצאת את הטיפול?</span>
                      <button type="button" onClick={() => setIsAddingService(true)} style={{ padding: '0.5rem 1rem', background: 'var(--color-charcoal)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        + טיפול חדש
                      </button>
                    </div>

                    {/* Hidden input to hold the required serviceId for the form submission */}
                    <input type="hidden" name="serviceId" value={selectedServiceId} required />
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>הנחה (%):</label>
                  <input type="number" min="0" max="100" value={discount} onChange={handleDiscountChange} placeholder="למשל: 10" className={styles.input} />
                </div>

                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label>סה"כ לתשלום (₪):</label>
                  <input type="number" name="pricePaid" value={pricePaid} onChange={handlePriceChange} placeholder="למשל: 1500" className={styles.input} required />
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" disabled={isPending} className={styles.submitButton}>
                  {isPending ? 'שומר...' : 'שמור מכירה (פתח כרטיסייה)'}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className={styles.cancelButton}>
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddingService && (
        <div style={{ position: 'relative', zIndex: 2000 }}>
          <GlobalAddServiceModal onClose={async () => {
            setIsAddingService(false);
            const fresh = await getAllServices();
            setLocalServices(fresh);
          }} />
        </div>
      )}
    </>
  );
}
