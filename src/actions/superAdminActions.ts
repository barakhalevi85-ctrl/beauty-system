'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function getAllBusinesses() {
  await requireSuperAdmin();
  return await prisma.business.findMany({
    include: {
      employees: {
        where: { role: 'ADMIN' },
        take: 1
      },
      _count: {
        select: { clients: true, appointments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBusiness(data: { businessName: string; ownerName: string; username: string; password: string }) {
  await requireSuperAdmin();
  
  // Check if username exists
  const existing = await prisma.employee.findUnique({ where: { username: data.username } });
  if (existing) {
    throw new Error('שם המשתמש כבר קיים במערכת');
  }

  const newBusiness = await prisma.business.create({
    data: {
      name: data.businessName,
      subscriptionStatus: 'TRIAL',
      employees: {
        create: {
          name: data.ownerName,
          phone: '0000000000',
          role: 'ADMIN',
          username: data.username,
          password: data.password
        }
      }
    },
    include: { employees: true }
  });

  // Set the ownerId
  const owner = newBusiness.employees[0];
  await prisma.business.update({
    where: { id: newBusiness.id },
    data: { ownerId: owner.id }
  });

  // Initialize System Settings for this business
  await prisma.systemSettings.create({
    data: { businessId: newBusiness.id }
  });

  revalidatePath('/superadmin');
  return newBusiness;
}

export async function updateBusinessStatus(businessId: string, status: string) {
  await requireSuperAdmin();
  await prisma.business.update({
    where: { id: businessId },
    data: { subscriptionStatus: status }
  });
  revalidatePath('/superadmin');
}

export async function resetOwnerPassword(employeeId: string, newPassword: string) {
  await requireSuperAdmin();
  await prisma.employee.update({
    where: { id: employeeId },
    data: { password: newPassword }
  });
  revalidatePath('/superadmin');
}
