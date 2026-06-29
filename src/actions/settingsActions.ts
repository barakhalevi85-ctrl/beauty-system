'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function getSystemSettings() {
  const businessId = await getBusinessId();
  let settings = await prisma.systemSettings.findUnique({
    where: { businessId }
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { businessId }
    });
  }
  return settings;
}

export async function updateWeeklySchedule(weeklySchedule: string) {
  const businessId = await getBusinessId();
  const settings = await getSystemSettings();
  await prisma.systemSettings.update({
    where: { id: settings.id, businessId },
    data: { weeklySchedule }
  });
  revalidatePath('/', 'layout');
}

export async function updateBusinessSettings(businessSettings: string) {
  const businessId = await getBusinessId();
  const settings = await getSystemSettings();
  await prisma.systemSettings.update({
    where: { id: settings.id, businessId },
    data: { businessSettings }
  });
  revalidatePath('/', 'layout');
}

export async function updateMessageSettings(messageSettings: string) {
  const businessId = await getBusinessId();
  const settings = await getSystemSettings();
  await prisma.systemSettings.update({
    where: { id: settings.id, businessId },
    data: { messageSettings }
  });
  revalidatePath('/', 'layout');
}

export async function getClosedDates() {
  const businessId = await getBusinessId();
  return await prisma.closedDate.findMany({
    orderBy: { date: 'asc' },
    where: { businessId, date: { gte: new Date() } }
  });
}

export async function addClosedDate(date: Date, description: string) {
  const businessId = await getBusinessId();
  await prisma.closedDate.create({
    data: { businessId, date, description }
  });
  revalidatePath('/', 'layout');
}

export async function removeClosedDate(id: string) {
  const businessId = await getBusinessId();
  await prisma.closedDate.delete({
    where: { id, businessId }
  });
  revalidatePath('/', 'layout');
}
