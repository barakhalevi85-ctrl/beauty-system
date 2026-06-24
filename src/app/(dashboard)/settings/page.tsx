import React from 'react';
import styles from './settings.module.css';
import { getSystemSettings, getClosedDates } from '@/actions/settingsActions';
import { getEmployees } from '@/actions/employeeActions';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSystemSettings();
  const closedDates = await getClosedDates();
  const employees = await getEmployees();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>הגדרות עסק</h1>
      <SettingsClient initialSettings={settings} initialClosedDates={closedDates} initialEmployees={employees} />
    </div>
  );
}
