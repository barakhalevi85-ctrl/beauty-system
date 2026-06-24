'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
  let settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: 'default' }
    });
  }
  return settings;
}

export async function updateWeeklySchedule(weeklySchedule: string) {
  await prisma.systemSettings.update({
    where: { id: 'default' },
    data: { weeklySchedule }
  });
  revalidatePath('/', 'layout');
}

export async function updateBusinessSettings(businessSettings: string) {
  await prisma.systemSettings.update({
    where: { id: 'default' },
    data: { businessSettings }
  });
  revalidatePath('/', 'layout');
}

export async function updateMessageSettings(messageSettings: string) {
  await prisma.systemSettings.update({
    where: { id: 'default' },
    data: { messageSettings }
  });
  revalidatePath('/', 'layout');
}

export async function getClosedDates() {
  return await prisma.closedDate.findMany({
    orderBy: { date: 'asc' },
    where: { date: { gte: new Date() } }
  });
}

export async function addClosedDate(date: Date, description: string) {
  await prisma.closedDate.create({
    data: { date, description }
  });
  revalidatePath('/', 'layout');
}

export async function removeClosedDate(id: string) {
  await prisma.closedDate.delete({
    where: { id }
  });
  revalidatePath('/', 'layout');
}
