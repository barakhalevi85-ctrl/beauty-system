'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  return await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getEmployeeWithDetails(id: string) {
  return await prisma.employee.findUnique({
    where: { id },
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

export async function createEmployee(data: { name: string; phone: string; email?: string; role?: string; hourlyWage?: number }) {
  await prisma.employee.create({ data });
  revalidatePath('/settings');
}

export async function updateEmployee(id: string, data: { name?: string; phone?: string; email?: string; role?: string; hourlyWage?: number; isActive?: boolean }) {
  await prisma.employee.update({ where: { id }, data });
  revalidatePath('/settings');
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath('/settings');
}

export async function addTimeReport(data: { employeeId: string; date: Date; startTime: string; endTime: string; totalHours?: number; notes?: string }) {
  await prisma.employeeTimeReport.create({ data });
  revalidatePath('/settings');
}

export async function deleteTimeReport(id: string) {
  await prisma.employeeTimeReport.delete({ where: { id } });
  revalidatePath('/settings');
}

export async function addEmployeeLeave(data: { employeeId: string; date: Date; type: string; notes?: string }) {
  await prisma.employeeLeave.create({ data });
  revalidatePath('/settings');
}

export async function deleteEmployeeLeave(id: string) {
  await prisma.employeeLeave.delete({ where: { id } });
  revalidatePath('/settings');
}
