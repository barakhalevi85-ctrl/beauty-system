'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllServices() {
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  return services.filter(s => s.name !== 'dummy_category_init');
}

export async function getUniqueTreatmentOptions() {
  const services = await prisma.service.findMany({
    select: { category: true, name: true }
  });
  const categories = Array.from(new Set(services.map(s => s.category)));
  const treatmentNames = Array.from(new Set(services.map(s => s.name))).filter(n => n !== 'dummy_category_init');
  return { categories, treatmentNames };
}

// Service Actions
export async function addService(data: {
  category: string;
  name: string;
  packageType: string;
  price: number;
  durationMinutes: number;
}) {
  const existing = await prisma.service.findFirst({
    where: {
      category: data.category,
      name: data.name,
      packageType: data.packageType
    }
  });

  if (existing) {
    await prisma.service.update({
      where: { id: existing.id },
      data: {
        price: data.price,
        durationMinutes: data.durationMinutes
      }
    });
  } else {
    await prisma.service.create({
      data,
    });
  }
  revalidatePath('/', 'layout');
}

export async function deleteService(id: string) {
  await prisma.service.delete({
    where: { id },
  });
  revalidatePath('/', 'layout');
}

export async function editService(id: string, data: {
  category: string;
  name: string;
  packageType: string;
  price: number;
  durationMinutes: number;
}) {
  await prisma.service.update({
    where: { id },
    data,
  });
  revalidatePath('/', 'layout');
  revalidatePath('/calendar');
}

export async function editCategory(oldCategory: string, newCategory: string) {
  if (!newCategory || oldCategory === newCategory) return;
  await prisma.service.updateMany({
    where: { category: oldCategory },
    data: { category: newCategory }
  });
  revalidatePath('/', 'layout');
}

export async function deleteCategory(categoryName: string) {
  await prisma.service.deleteMany({
    where: { category: categoryName }
  });
  revalidatePath('/', 'layout');
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
  revalidatePath('/', 'layout');
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({
    where: { id }
  });
  revalidatePath('/calendar');
  revalidatePath('/', 'layout');
}

export async function editAppointment(id: string, data: {
  serviceId?: string;
  date: Date;
}) {
  await prisma.appointment.update({
    where: { id },
    data
  });
  revalidatePath('/calendar');
  revalidatePath('/', 'layout');
}
