'use client';

import React, { useState, useEffect } from 'react';
import { getAllBusinesses, createBusiness, updateBusinessStatus, resetOwnerPassword } from '@/actions/superAdminActions';

export default function SuperAdminClient() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Business Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    setLoading(true);
    try {
      const data = await getAllBusinesses();
      setBusinesses(data);
    } catch (e: any) {
      alert(e.message || 'שגיאה בשליפת עסקים');
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setNewBizName('');
    setOwnerName('');
    setUsername('');
    setPassword('');
  }

  async function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createBusiness({ businessName: newBizName, ownerName, username, password });
      alert('עסק חדש נוצר בהצלחה!');
      closeModal();
      fetchBusinesses();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if (!confirm('האם לשנות את סטטוס המנוי של העסק?')) return;
    try {
      await updateBusinessStatus(id, newStatus);
      fetchBusinesses();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleResetPassword(ownerId: string) {
    const newPass = prompt('הזן סיסמה חדשה למנהל:');
    if (!newPass) return;
    
    try {
      await resetOwnerPassword(ownerId, newPass);
      alert('סיסמה שונתה בהצלחה');
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>ניהול לקוחות (Mange SaaS)</h1>
          <p>כאן את מנהלת את כל בתי העסק הרשומים למערכת</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--color-charcoal-black)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ➕ הוסף עסק חדש
        </button>
      </div>

      {loading ? (
        <p>טוען נתונים...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                <th style={{ padding: '1rem' }}>שם העסק</th>
                <th style={{ padding: '1rem' }}>מנהל העסק</th>
                <th style={{ padding: '1rem' }}>שם משתמש (Login)</th>
                <th style={{ padding: '1rem' }}>סטטוס מנוי</th>
                <th style={{ padding: '1rem' }}>תאריך הצטרפות</th>
                <th style={{ padding: '1rem' }}>נתונים</th>
                <th style={{ padding: '1rem' }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((biz) => {
                const owner = biz.employees[0] || {};
                return (
                  <tr key={biz.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{biz.name}</td>
                    <td style={{ padding: '1rem' }}>{owner.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>{owner.username || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        value={biz.subscriptionStatus} 
                        onChange={(e) => handleStatusChange(biz.id, e.target.value)}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc',
                          background: biz.subscriptionStatus === 'ACTIVE' ? '#e6ffe6' : 
                                      biz.subscriptionStatus === 'SUSPENDED' ? '#ffe6e6' : '#ffffe6'
                        }}
                      >
                        <option value="TRIAL">תקופת ניסיון</option>
                        <option value="ACTIVE">פעיל (שילם)</option>
                        <option value="SUSPENDED">מושהה (חסום)</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(biz.createdAt).toLocaleDateString('he-IL')}</td>
                    <td style={{ padding: '1rem', color: '#666', fontSize: '0.9rem' }}>
                      לקוחות: {biz._count.clients} | תורים: {biz._count.appointments}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {owner.id && (
                        <button 
                          onClick={() => handleResetPassword(owner.id)}
                          style={{ padding: '0.25rem 0.5rem', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🔑 איפוס סיסמה
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {businesses.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>אין בתי עסק רשומים עדיין.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h2>הוספת בית עסק חדש</h2>
            <form onSubmit={handleCreateBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label>שם העסק (למשל: סטודיו חן):</label>
                <input required type="text" value={newBizName} onChange={e => setNewBizName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label>שם המנהלת (בעלת העסק):</label>
                <input required type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label>שם משתמש להתחברות:</label>
                <input required type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} dir="ltr" />
              </div>
              <div>
                <label>סיסמה התחלתית:</label>
                <input required type="text" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} dir="ltr" />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'var(--color-charcoal-black)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>צור עסק</button>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.75rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
