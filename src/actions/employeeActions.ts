'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function getEmployees() {
  const businessId = await getBusinessId();
  return await prisma.employee.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getEmployeeWithDetails(id: string) {
  const businessId = await getBusinessId();
  return await prisma.employee.findUnique({
    where: { id, businessId },
    include: {
      timeReports: {
        orderBy: { date: 'desc' },
        take: 50
      },
      leaves: {
        orderBy: { date: 'desc' },
        take: 50
      }
    }
  });
}

export async function createEmployee(data: { name: string; phone: string; email?: string; role?: string; hourlyWage?: number; username?: string; password?: string }) {
  const businessId = await getBusinessId();
  await prisma.employee.create({ data: { ...data, businessId } });
  revalidatePath('/settings');
}

export async function updateEmployee(id: string, data: { name?: string; phone?: string; email?: string; role?: string; hourlyWage?: number; isActive?: boolean; username?: string; password?: string }) {
  const businessId = await getBusinessId();
  await prisma.employee.update({ where: { id, businessId }, data });
  revalidatePath('/settings');
}

export async function deleteEmployee(id: string) {
  const businessId = await getBusinessId();
  await prisma.employee.delete({ where: { id, businessId } });
  revalidatePath('/settings');
}

export async function addTimeReport(data: { employeeId: string; date: Date; startTime: string; endTime: string; totalHours?: number; notes?: string }) {
  const businessId = await getBusinessId();
  const emp = await prisma.employee.findUnique({ where: { id: data.employeeId, businessId } });
  if (!emp) throw new Error('Unauthorized');
  await prisma.employeeTimeReport.create({ data });
  revalidatePath('/settings');
}

export async function deleteTimeReport(id: string) {
  await prisma.employeeTimeReport.delete({ where: { id } }); // Could check business via employee
  revalidatePath('/settings');
}

export async function addEmployeeLeave(data: { employeeId: string; date: Date; type: string; notes?: string }) {
  const businessId = await getBusinessId();
  const emp = await prisma.employee.findUnique({ where: { id: data.employeeId, businessId } });
  if (!emp) throw new Error('Unauthorized');
  await prisma.employeeLeave.create({ data });
  revalidatePath('/settings');
}

export async function deleteEmployeeLeave(id: string) {
  await prisma.employeeLeave.delete({ where: { id } });
  revalidatePath('/settings');
}
