'use client';

import { useState, useEffect } from 'react';
import { addService, getUniqueTreatmentOptions } from '@/app/actions';

export function AddTreatmentModal({ onClose, fixedCategory }: { onClose: () => void, fixedCategory?: string }) {
  const [loading, setLoading] = useState(false);
  const [packageSelection, setPackageSelection] = useState('single'); // 'single' or 'series'
  const [seriesCount, setSeriesCount] = useState(10);
  
  // Categories State
  const [categories, setCategories] = useState(['נשים', 'גברים']);
  const [selectedCategory, setSelectedCategory] = useState('נשים');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Treatment Names State
  const [treatmentNames, setTreatmentNames] = useState<string[]>([]);
  const [selectedTreatmentName, setSelectedTreatmentName] = useState('');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [newTreatmentInput, setNewTreatmentInput] = useState('');

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await getUniqueTreatmentOptions();
        if (res.categories.length > 0) {
          setCategories(Array.from(new Set([...res.categories, ...categories])));
          setSelectedCategory(res.categories[0]);
        }
        if (res.treatmentNames.length > 0) {
          setTreatmentNames(Array.from(new Set([...res.treatmentNames, ...treatmentNames])));
          setSelectedTreatmentName(res.treatmentNames[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchOptions();
  }, []);

  const handleAddCategory = () => {
    if (newCategoryName.trim() !== '') {
      setCategories([...categories, newCategoryName.trim()]);
      setSelectedCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleAddTreatment = () => {
    if (newTreatmentInput.trim() !== '') {
      setTreatmentNames([...treatmentNames, newTreatmentInput.trim()]);
      setSelectedTreatmentName(newTreatmentInput.trim());
      setNewTreatmentInput('');
      setIsAddingTreatment(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let finalPackageType = packageSelection === 'single' ? 'טיפול בודד' : `סדרה של ${seriesCount} טיפולים`;
    
    // Auto-confirm if they left the input open
    let finalCategory = fixedCategory || selectedCategory;
    if (!fixedCategory && isAddingCategory && newCategoryName.trim() !== '') {
      finalCategory = newCategoryName.trim();
    }
    
    let finalTreatmentName = selectedTreatmentName;
    if (isAddingTreatment && newTreatmentInput.trim() !== '') {
      finalTreatmentName = newTreatmentInput.trim();
    }
    
    try {
      await addService({
        category: finalCategory,
        name: finalTreatmentName,
        packageType: finalPackageType,
        price: Number(formData.get('price')),
        durationMinutes: Number(formData.get('durationMinutes')),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה ביצירת טיפול');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: 0, textAlign: 'center', color: 'var(--color-rose-gold)' }}>הוספת אזור טיפול חדש למחירון</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', color: '#333' }}>
          
          {/* Category Field */}
          {!fixedCategory && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>קטגוריה</label>
              {isAddingCategory ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="שם קטגוריה חדשה..." 
                    list="category-names-list"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} 
                    autoFocus
                  />
                  <datalist id="category-names-list">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                  <button type="button" onClick={handleAddCategory} style={{ padding: '0.75rem', background: '#e0a96d', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>אישור</button>
                  <button type="button" onClick={() => setIsAddingCategory(false)} style={{ padding: '0.75rem', background: '#e0e0e0', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>X</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setIsAddingCategory(true)} style={{ padding: '0.75rem 1rem', background: '#e0a96d', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}>
                    +
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Treatment Name Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>שם האזור / טיפול</label>
            {isAddingTreatment ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newTreatmentInput}
                  onChange={(e) => setNewTreatmentInput(e.target.value)}
                  placeholder="שם אזור חדש..." 
                  list="treatment-names-list"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} 
                  autoFocus
                />
                <datalist id="treatment-names-list">
                  {treatmentNames.map(name => <option key={name} value={name} />)}
                </datalist>
                <button type="button" onClick={handleAddTreatment} style={{ padding: '0.75rem', background: '#e0a96d', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>אישור</button>
                <button type="button" onClick={() => setIsAddingTreatment(false)} style={{ padding: '0.75rem', background: '#e0e0e0', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>X</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  value={selectedTreatmentName}
                  onChange={(e) => setSelectedTreatmentName(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }}
                >
                  {treatmentNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setIsAddingTreatment(true)} style={{ padding: '0.75rem 1rem', background: '#e0a96d', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}>
                  +
                </button>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>סוג חבילה</label>
            <select 
              value={packageSelection} 
              onChange={(e) => setPackageSelection(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }}
            >
              <option value="single">טיפול בודד</option>
              <option value="series">סדרת טיפולים</option>
            </select>
          </div>
          
          {packageSelection === 'series' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>מספר הטיפולים בסדרה</label>
              <input type="number" value={seriesCount} onChange={(e) => setSeriesCount(Number(e.target.value))} required min={2} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem', fontWeight: 'bold' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>מחיר (₪)</label>
              <input type="number" name="price" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>משך (דקות)</label>
              <input type="number" name="durationMinutes" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--primary-color, #e0a96d)', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#e0e0e0', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
