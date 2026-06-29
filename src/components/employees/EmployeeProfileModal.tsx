'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/(dashboard)/settings/settings.module.css';
import { getEmployeeWithDetails, updateEmployee, addTimeReport, deleteTimeReport, addEmployeeLeave, deleteEmployeeLeave } from '@/actions/employeeActions';

export function EmployeeProfileModal({
  isOpen,
  onClose,
  employee
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '', phone: '', email: '', role: '', hourlyWage: 0
  });

  // Time report state
  const [trDate, setTrDate] = useState('');
  const [trStart, setTrStart] = useState('');
  const [trEnd, setTrEnd] = useState('');
  const [trNotes, setTrNotes] = useState('');

  // Leave state
  const [lvDate, setLvDate] = useState('');
  const [lvType, setLvType] = useState('VACATION');
  const [lvNotes, setLvNotes] = useState('');

  const fetchDetails = async () => {
    if (!employee?.id) return;
    setLoading(true);
    const data = await getEmployeeWithDetails(employee.id);
    setDetails(data);
    if (data) {
      setEditData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        role: data.role || '',
        hourlyWage: data.hourlyWage || 0
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, employee?.id]);

  const handleSaveDetails = async () => {
    try {
      setLoading(true);
      await updateEmployee(employee.id, {
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        role: editData.role,
        hourlyWage: Number(editData.hourlyWage) || undefined
      });
      setEditMode(false);
      await fetchDetails();
    } catch (e) {
      alert('שגיאה בעדכון פרטים');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeReport = async () => {
    if (!trDate || !trStart || !trEnd) return alert('נא למלא תאריך ושעות');
    await addTimeReport({ employeeId: employee.id, date: new Date(trDate), startTime: trStart, endTime: trEnd, notes: trNotes });
    setTrDate(''); setTrStart(''); setTrEnd(''); setTrNotes('');
    fetchDetails();
  };

  const handleAddLeave = async () => {
    if (!lvDate) return alert('נא לבחור תאריך');
    await addEmployeeLeave({ employeeId: employee.id, date: new Date(lvDate), type: lvType, notes: lvNotes });
    setLvDate(''); setLvNotes('');
    fetchDetails();
  };

  if (!isOpen || !employee) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className={styles.section} style={{ background: 'white', borderRadius: '12px', width: '600px', maxWidth: '95%', height: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>תיק עובד: {employee.name}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div className={styles.tabsContainer} style={{ marginBottom: '1rem' }}>
          <button className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`} onClick={() => setActiveTab('details')}>פרטים אישיים</button>
          <button className={`${styles.tab} ${activeTab === 'time' ? styles.activeTab : ''}`} onClick={() => setActiveTab('time')}>דיווחי שעות</button>
          <button className={`${styles.tab} ${activeTab === 'leaves' ? styles.activeTab : ''}`} onClick={() => setActiveTab('leaves')}>מחלה וחופשות</button>
        </div>

        {activeTab === 'details' && (
          <div>
            {!editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p><strong>שם מלא:</strong> {details?.name}</p>
                <p><strong>טלפון:</strong> {details?.phone}</p>
                <p><strong>אימייל:</strong> {details?.email || 'לא הוזן'}</p>
                <p><strong>תפקיד:</strong> {details?.role || 'לא הוזן'}</p>
                <p><strong>שכר לשעה:</strong> {details?.hourlyWage ? `₪${details?.hourlyWage}` : 'לא הוגדר'}</p>
                <button 
                  onClick={() => setEditMode(true)} 
                  className={styles.saveButton} 
                  style={{ width: 'fit-content', marginTop: '1rem' }}
                >
                  ✏️ עריכת פרטים
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label>שם מלא</label>
                  <input type="text" className={styles.input} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div>
                  <label>טלפון</label>
                  <input type="text" className={styles.input} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                </div>
                <div>
                  <label>אימייל</label>
                  <input type="email" className={styles.input} value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} />
                </div>
                <div>
                  <label>תפקיד</label>
                  <input type="text" className={styles.input} value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} />
                </div>
                <div>
                  <label>שכר לשעה (₪)</label>
                  <input type="number" className={styles.input} value={editData.hourlyWage} onChange={e => setEditData({...editData, hourlyWage: parseFloat(e.target.value)})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={handleSaveDetails} className={styles.saveButton} disabled={loading}>
                    {loading ? 'שומר...' : 'שמור שינויים'}
                  </button>
                  <button onClick={() => setEditMode(false)} className={styles.addButton} style={{ background: '#eee', color: 'black' }}>
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'time' && (
          <div>
            <h3>הוספת דיווח ידני</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="date" className={styles.input} value={trDate} onChange={e => setTrDate(e.target.value)} />
              <input type="time" className={styles.input} value={trStart} onChange={e => setTrStart(e.target.value)} />
              <input type="time" className={styles.input} value={trEnd} onChange={e => setTrEnd(e.target.value)} />
              <input type="text" className={styles.input} placeholder="הערות..." value={trNotes} onChange={e => setTrNotes(e.target.value)} style={{ flex: 1 }} />
              <button className={styles.addButton} style={{ width: 'auto' }} onClick={handleAddTimeReport}>הוסף דיווח</button>
            </div>

            <h3>דיווחי שעות אחרונים</h3>
            {loading ? <p>טוען...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-rose-gold)', color: 'white', textAlign: 'right' }}>
                    <th style={{ padding: '0.5rem' }}>תאריך</th>
                    <th style={{ padding: '0.5rem' }}>התחלה</th>
                    <th style={{ padding: '0.5rem' }}>סיום</th>
                    <th style={{ padding: '0.5rem' }}>הערות</th>
                    <th style={{ padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {details?.timeReports?.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem' }}>אין דיווחים</td></tr>}
                  {details?.timeReports?.map((tr: any) => (
                    <tr key={tr.id} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(tr.date).toLocaleDateString('he-IL')}</td>
                      <td style={{ padding: '0.5rem' }}>{tr.startTime}</td>
                      <td style={{ padding: '0.5rem' }}>{tr.endTime}</td>
                      <td style={{ padding: '0.5rem' }}>{tr.notes}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'left' }}>
                        <button onClick={async () => { await deleteTimeReport(tr.id); fetchDetails(); }} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>מחק</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'leaves' && (
          <div>
            <h3>הוספת היעדרות</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input type="date" className={styles.input} value={lvDate} onChange={e => setLvDate(e.target.value)} />
              <select className={styles.input} value={lvType} onChange={e => setLvType(e.target.value)}>
                <option value="VACATION">חופשה</option>
                <option value="SICK">מחלה</option>
                <option value="OTHER">אחר</option>
              </select>
              <input type="text" className={styles.input} placeholder="הערות..." value={lvNotes} onChange={e => setLvNotes(e.target.value)} style={{ flex: 1 }} />
              <button className={styles.addButton} style={{ width: 'auto' }} onClick={handleAddLeave}>הוסף היעדרות</button>
            </div>

            <h3>היעדרויות אחרונות</h3>
            {loading ? <p>טוען...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-rose-gold)', color: 'white', textAlign: 'right' }}>
                    <th style={{ padding: '0.5rem' }}>תאריך</th>
                    <th style={{ padding: '0.5rem' }}>סוג</th>
                    <th style={{ padding: '0.5rem' }}>הערות</th>
                    <th style={{ padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {details?.leaves?.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem' }}>אין היעדרויות</td></tr>}
                  {details?.leaves?.map((lv: any) => (
                    <tr key={lv.id} style={{ borderBottom: '1px solid #ccc' }}>
                      <td style={{ padding: '0.5rem' }}>{new Date(lv.date).toLocaleDateString('he-IL')}</td>
                      <td style={{ padding: '0.5rem' }}>{lv.type === 'SICK' ? 'מחלה' : lv.type === 'VACATION' ? 'חופשה' : 'אחר'}</td>
                      <td style={{ padding: '0.5rem' }}>{lv.notes}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'left' }}>
                        <button onClick={async () => { await deleteEmployeeLeave(lv.id); fetchDetails(); }} style={{ color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>מחק</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
