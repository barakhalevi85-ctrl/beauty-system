'use client';

import React, { useState, useEffect } from 'react';
import { getClientFullProfile, updateClientInfo } from '@/actions/crmActions';
import AddCallLogForm from '@/components/AddCallLogForm';
import EditableCallLog from '@/components/EditableCallLog';
import TreatmentHistoryItem from '@/components/TreatmentHistoryItem';
import FutureAppointmentItem from '@/components/FutureAppointmentItem';

// We reuse the CSS from CRM module or inline styles for the modal structure
const modalOverlayStyle: React.CSSProperties = {
  zIndex: 2000, 
  position: 'fixed', 
  top: 0, left: 0, 
  width: '100%', height: '100%', 
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center',
  backdropFilter: 'blur(5px)'
};

const modalContentStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  width: '600px',
  maxWidth: '95%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative'
};

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '0.75rem',
  background: isActive ? 'var(--color-rose-gold)' : 'transparent',
  color: isActive ? 'white' : 'var(--color-charcoal-black)',
  border: '1px solid var(--color-rose-gold)',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  textAlign: 'center'
});

export default function ClientProfileModal({ clientId, onClose }: { clientId: string, onClose: () => void }) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'calls' | 'series' | 'treatments' | 'appointments' | 'gallery'>('info');
  const [services, setServices] = useState<any[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
    // Fetch client profile
    getClientFullProfile(clientId).then(data => {
      setClient(data);
      setLoading(false);
    });
    // In a real app we would pass services as props or fetch them, but for FutureAppointmentItem we need services
    fetch('/api/services').then(res => res.json()).then(data => setServices(data)).catch(() => setServices([]));
  }, [clientId]);

  if (loading) {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h2>טוען נתוני לקוח...</h2>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <h2>שגיאה בטעינת לקוח</h2>
          <button onClick={onClose}>סגור</button>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} className="glass-panel" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', left: '15px', background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
        >
          &times;
        </button>

        <h2 style={{ marginBottom: '0.2rem', color: 'var(--color-charcoal-black)' }}>
          {client.name} {client.lastName}
        </h2>
        <p style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '0.9rem' }}>
          📞 {client.phone} | ת"ז: {client.idNumber || client.id}
        </p>

        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <button style={tabButtonStyle(activeTab === 'info')} onClick={() => setActiveTab('info')}>פרטים</button>
          <button style={tabButtonStyle(activeTab === 'calls')} onClick={() => setActiveTab('calls')}>שיחות</button>
          <button style={tabButtonStyle(activeTab === 'series')} onClick={() => setActiveTab('series')}>סדרות</button>
          <button style={tabButtonStyle(activeTab === 'treatments')} onClick={() => setActiveTab('treatments')}>טיפולים</button>
          <button style={tabButtonStyle(activeTab === 'gallery')} onClick={() => setActiveTab('gallery')}>גלריה</button>
          <button style={tabButtonStyle(activeTab === 'appointments')} onClick={() => setActiveTab('appointments')}>תורים</button>
        </div>

        <div style={{ minHeight: '300px' }}>
          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>פרטים כלליים</h3>
                <button 
                  onClick={() => setIsEditingInfo(!isEditingInfo)} 
                  style={{ background: 'none', border: '1px solid var(--color-charcoal-light)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {isEditingInfo ? 'ביטול עריכה' : '✏️ עריכת פרטים'}
                </button>
              </div>

              {isEditingInfo ? (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSavingInfo(true);
                    const fd = new FormData(e.currentTarget);
                    fd.append('id', client.id);
                    await updateClientInfo(fd);
                    const updated = await getClientFullProfile(client.id);
                    setClient(updated);
                    setIsSavingInfo(false);
                    setIsEditingInfo(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '8px' }}
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>שם פרטי</label>
                      <input type="text" name="name" defaultValue={client.name} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>שם משפחה</label>
                      <input type="text" name="lastName" defaultValue={client.lastName || ''} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>טלפון</label>
                      <input type="tel" name="phone" defaultValue={client.phone} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>ת.ז</label>
                      <input type="text" name="idNumber" defaultValue={client.idNumber || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>כתובת</label>
                      <input type="text" name="address" defaultValue={client.address || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>אימייל</label>
                      <input type="email" name="email" defaultValue={client.email || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>תאריך לידה</label>
                      <input type="date" name="dateOfBirth" defaultValue={client.birthDate ? client.birthDate.substring(0, 10) : (client.dateOfBirth ? client.dateOfBirth.substring(0, 10) : '')} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>מגדר</label>
                      <select name="gender" defaultValue={client.gender || ''} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">בחר/י</option>
                        <option value="אישה">אישה</option>
                        <option value="גבר">גבר</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem' }}>מצב רפואי / הערות קבועות</label>
                    <textarea name="medicalNotes" defaultValue={client.medicalNotes || ''} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <button type="submit" disabled={isSavingInfo} style={{ background: 'var(--color-rose-gold)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}>
                    {isSavingInfo ? 'שומר...' : 'שמור שינויים'}
                  </button>
                </form>
              ) : (
                <>
                  <p><strong>כתובת:</strong> {client.address || 'לא צוינה'}</p>
                  <p><strong>אימייל:</strong> {client.email || 'לא צוין'}</p>
                  <p><strong>תאריך לידה:</strong> {client.birthDate ? new Date(client.birthDate).toLocaleDateString('he-IL') : (client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('he-IL') : 'לא צוין')}</p>
                  <p><strong>הצהרת בריאות:</strong> {client.healthDeclarationSent ? 'נשלחה ✅' : 'לא נשלחה ❌'}</p>
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>מצב רפואי / הערות קבועות</h4>
                    <p style={{ margin: 0 }}>{client.medicalNotes || 'אין הערות רפואיות'}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'calls' && (
            <div>
              <h3>מעקב שיחות</h3>
              <AddCallLogForm clientId={client.id} />
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {client.callLogs.length === 0 && <p>אין הערות או שיחות מתועדות.</p>}
                {client.callLogs.map((log: any) => (
                  <EditableCallLog key={log.id} log={log} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'series' && (
            <div>
              <h3>כרטיסיות פתוחות / סדרות</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {client.clientSeries.length === 0 && <p>אין כרטיסיות או סדרות קיימות ללקוח זה.</p>}
                {client.clientSeries.map((series: any) => (
                  <div key={series.id} style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>{series.serviceName || series.service?.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>נרכש: {new Date(series.createdAt).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.2rem', color: series.usedTreatments >= series.totalTreatments ? 'green' : 'var(--color-rose-gold)' }}>
                        {series.usedTreatments} / {series.totalTreatments}
                      </strong>
                      <div style={{ fontSize: '0.75rem' }}>נוצלו</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div>
              <h3>היסטוריית טיפולים</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {client.treatmentLogs.length === 0 && <p>אין היסטוריית טיפולים ללקוח זה.</p>}
                {client.treatmentLogs.map((treatment: any) => (
                  <TreatmentHistoryItem key={treatment.id} log={treatment} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h3>תורים עתידיים</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {client.appointments.length === 0 && <p>אין תורים עתידיים ללקוח זה.</p>}
                {client.appointments.map((apt: any) => (
                  <FutureAppointmentItem key={apt.id} appointment={apt} services={services} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <h3>גלריית תמונות (לפני/אחרי)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {client.treatmentLogs.filter((t: any) => t.imageUrls).length === 0 && <p>לא הועלו תמונות ללקוח זה.</p>}
                {client.treatmentLogs
                  .filter((t: any) => t.imageUrls)
                  .map((t: any) => {
                    const urls = t.imageUrls.split(',');
                    return urls.map((url: string, idx: number) => (
                      <div key={`${t.id}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <img 
                          src={url} 
                          alt="תמונת טיפול" 
                          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                        />
                        <span style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                          {new Date(t.createdAt).toLocaleDateString('he-IL')} - {t.bodyArea}
                        </span>
                      </div>
                    ));
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
