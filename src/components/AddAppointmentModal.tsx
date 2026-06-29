'use client';

import { useState, useEffect } from 'react';
import { addAppointment } from '@/app/actions';
import { getClientActiveSeries, addClient } from '@/actions/crmActions';

export function AddAppointmentModal({ 
  onClose, 
  clients, 
  services,
  initialDate
}: { 
  onClose: () => void;
  clients: { id: string; name: string }[];
  services: { id: string; name: string }[];
  initialDate?: Date;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [activeSeries, setActiveSeries] = useState<any[]>([]);
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate 15-minute interval options
  const timeOptions: string[] = [];
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  useEffect(() => {
    if (selectedClientId) {
      getClientActiveSeries(selectedClientId).then(series => {
        setActiveSeries(series);
      });
    } else {
      setActiveSeries([]);
    }
  }, [selectedClientId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let clientId = formData.get('clientId') as string;
    const serviceId = formData.get('serviceId') as string;
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    
    try {
      if (isNewClientMode) {
        if (!newClientFirstName || !newClientLastName || !newClientPhone) {
          alert('יש להזין שם פרטי, שם משפחה וטלפון ללקוח החדש');
          setLoading(false);
          return;
        }
        const newClientFd = new FormData();
        newClientFd.append('name', newClientFirstName);
        newClientFd.append('lastName', newClientLastName);
        newClientFd.append('phone', newClientPhone);
        const newClient = await addClient(newClientFd);
        clientId = newClient.id;
      }

      const date = new Date(`${dateStr}T${timeStr}`);

      await addAppointment({
        clientId,
        serviceId: serviceId || undefined,
        date,
        status: 'מתוכנן'
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'שגיאה בקביעת תור');
    } finally {
      setLoading(false);
    }
  }

  const initialDateStr = initialDate 
    ? `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`
    : '';

  let initialTimeStr = '';
  if (initialDate) {
    const d = new Date(initialDate);
    const m = d.getMinutes();
    const roundedM = Math.round(m / 15) * 15;
    d.setMinutes(roundedM);
    initialTimeStr = d.toTimeString().substring(0, 5);
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div className="glass-panel" style={{ width: '400px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
        <h2>הוסף תור חדש</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block' }}>לקוח</label>
              <button 
                type="button" 
                onClick={() => setIsNewClientMode(!isNewClientMode)}
                style={{ background: 'none', border: 'none', color: 'var(--color-rose-gold)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {isNewClientMode ? 'ביטול הוספה' : '➕ לקוח חדש'}
              </button>
            </div>
            
            {isNewClientMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="שם פרטי" 
                    required 
                    value={newClientFirstName}
                    onChange={(e) => setNewClientFirstName(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }} 
                  />
                  <input 
                    type="text" 
                    placeholder="שם משפחה" 
                    required 
                    value={newClientLastName}
                    onChange={(e) => setNewClientLastName(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }} 
                  />
                </div>
                <input 
                  type="tel" 
                  placeholder="טלפון" 
                  required 
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black', boxSizing: 'border-box' }} 
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="הקלד/י שם לקוח לחיפוש..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    setSelectedClientId('');
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }}
                />
                <input type="hidden" name="clientId" value={selectedClientId} required />
                
                {showDropdown && searchQuery && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {clients.filter(c => c.name.includes(searchQuery)).length > 0 ? (
                      clients.filter(c => c.name.includes(searchQuery)).map(c => (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setSearchQuery(c.name);
                            setShowDropdown(false);
                          }}
                          style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', color: 'black' }}
                        >
                          {c.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', color: '#888' }}>לא נמצאו לקוחות מתאימים</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>טיפול (אופציונלי)</label>
            <select name="serviceId" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }}>
              <option value="" style={{ color: 'black' }}>ללא</option>
              
              {activeSeries.length > 0 && (
                <optgroup label="✅ נרכשו מראש (כרטיסיות / טיפולים בודדים)" style={{ color: 'green', background: 'rgba(255,255,255,0.9)' }}>
                  {activeSeries.map(series => (
                    <option key={series.id} value={series.serviceId} style={{ color: 'black', fontWeight: 'bold' }}>
                      {series.serviceName || series.service?.name} {series.totalTreatments > 1 ? `(סדרה: נותרו ${series.totalTreatments - series.usedTreatments})` : '(טיפול בודד שטרם מומש)'}
                    </option>
                  ))}
                </optgroup>
              )}

              <optgroup label="כל הטיפולים" style={{ color: 'black', background: 'rgba(255,255,255,0.9)' }}>
                {services.map(s => (
                  <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>תאריך</label>
              <input type="date" name="date" required defaultValue={initialDateStr} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>שעה</label>
              <input type="time" name="time" step="900" list="time-options" required defaultValue={initialTimeStr} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'white', color: 'black' }} />
              <datalist id="time-options">
                {timeOptions.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-charcoal-black)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#eee', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
