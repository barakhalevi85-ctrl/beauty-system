'use server';

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Global admin fallback
  if (username === 'admin' && password === 'saray123') {
    await createSession('super-admin-id', 'SUPER_ADMIN', 'SUPER_ADMIN_BUSINESS');
    redirect('/superadmin');
  }

  // Check employee credentials
  const employee = await prisma.employee.findUnique({
    where: { username },
    include: { business: true }
  });

  if (employee && employee.password === password && employee.isActive) {
    if (employee.business.subscriptionStatus === 'SUSPENDED') {
      return { error: 'חשבון העסק מושהה. אנא צור קשר עם ההנהלה.' };
    }
    await createSession(employee.id, employee.role || 'EMPLOYEE', employee.businessId);
    redirect('/');
  }

  return { error: 'שם משתמש או סיסמה שגויים' };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
