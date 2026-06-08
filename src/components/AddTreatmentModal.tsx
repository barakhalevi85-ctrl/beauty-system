'use client';

import { useState } from 'react';
import { addService } from '@/app/actions';

export function AddTreatmentModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [packageSelection, setPackageSelection] = useState('single'); // 'single' or 'series'
  const [seriesCount, setSeriesCount] = useState(10);
  
  // Categories State
  const [categories, setCategories] = useState(['נשים', 'גברים', 'אזורים גדולים', 'אזורים קטנים']);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Treatment Names State
  const [treatmentNames, setTreatmentNames] = useState(['רגליים מלאות', 'חצי רגל', 'בתי שחי', 'שפם', 'מפשעות']);
  const [selectedTreatmentName, setSelectedTreatmentName] = useState(treatmentNames[0]);
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [newTreatmentInput, setNewTreatmentInput] = useState('');

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
    
    try {
      await addService({
        category: selectedCategory,
        name: selectedTreatmentName,
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
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>הוסף אזור / טיפול חדש</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', color: '#333' }}>
          
          {/* Category Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>קטגוריה</label>
            {isAddingCategory ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="שם קטגוריה חדשה..." 
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} 
                  autoFocus
                />
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
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', color: '#000', fontSize: '1rem' }} 
                  autoFocus
                />
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
