'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Service Actions
export async function addService(data: {
  category: string;
  name: string;
  packageType: string;
  price: number;
  durationMinutes: number;
}) {
  await prisma.service.create({
    data,
  });
  revalidatePath('/treatments');
  revalidatePath('/calendar');
}

export async function deleteService(id: string) {
  await prisma.service.delete({
    where: { id },
  });
  revalidatePath('/treatments');
  revalidatePath('/calendar');
}

// Appointment Actions
export async function addAppointment(data: {
  clientId: string;
  serviceId?: string;
  date: Date;
  status: string;
}) {
  await prisma.appointment.create({
    data,
  });
  revalidatePath('/calendar');
  revalidatePath('/');
}
