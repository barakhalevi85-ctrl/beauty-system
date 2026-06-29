import '../globals.css';
import React from 'react';
import Link from 'next/link';
import { logout } from '@/actions/authActions';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)', direction: 'rtl' }}>
      <aside style={{ width: '250px', background: 'white', borderLeft: '1px solid #ddd', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--color-charcoal-black)', marginBottom: '2rem' }}>Super Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <Link href="/superadmin" style={{ padding: '0.5rem', background: 'var(--color-rose-gold-light)', borderRadius: '8px', color: 'var(--color-charcoal-black)', fontWeight: 'bold' }}>
            🏢 ניהול מנויים
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-danger)' }}>
            🚪 התנתקות
          </button>
        </form>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
