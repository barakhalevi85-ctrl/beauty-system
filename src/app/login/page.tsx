'use client';

import { useState } from 'react';
import { login } from '@/actions/authActions';
import styles from './page.module.css';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(formData);
      
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      // If it's a NEXT_REDIRECT error, Next.js handles it.
      // We just log it. If it's something else, we reset loading so the button returns to 'כניסה'
      if ((err as Error).message.includes('NEXT_REDIRECT')) {
        // Expected behavior on successful login
      } else {
        setError('שגיאת חיבור לשרת, אנא נסה שוב או רענן את הדף.');
        setLoading(false);
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={`glass-panel ${styles.loginBox}`}>
        <h1 className={styles.title}>GlamFlow</h1>
        <p className={styles.subtitle}>התחברות למערכת</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label>שם משתמש</label>
            <input type="text" name="username" required className={styles.input} />
          </div>
          
          <div className={styles.inputGroup}>
            <label>סיסמה</label>
            <input type="password" name="password" required className={styles.input} />
          </div>
          
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  );
}
