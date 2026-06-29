'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function getAllServices() {
  const businessId = await getBusinessId();
  const services = await prisma.service.findMany({ 
    where: { businessId },
    orderBy: { name: 'asc' } 
  });
  return services.filter(s => s.name !== 'dummy_category_init');
}

export async function getUniqueTreatmentOptions() {
  const businessId = await getBusinessId();
  const services = await prisma.service.findMany({
    where: { businessId },
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
  const businessId = await getBusinessId();
  const existing = await prisma.service.findFirst({
    where: {
      businessId,
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
      data: { ...data, businessId },
    });
  }
  revalidatePath('/', 'layout');
}

export async function deleteService(id: string) {
  const businessId = await getBusinessId();
  await prisma.service.delete({
    where: { id, businessId },
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
  const businessId = await getBusinessId();
  await prisma.service.update({
    where: { id, businessId },
    data,
  });
  revalidatePath('/', 'layout');
  revalidatePath('/calendar');
}

export async function editCategory(oldCategory: string, newCategory: string) {
  if (!newCategory || oldCategory === newCategory) return;
  const businessId = await getBusinessId();
  await prisma.service.updateMany({
    where: { category: oldCategory, businessId },
    data: { category: newCategory }
  });
  revalidatePath('/', 'layout');
}

export async function deleteCategory(categoryName: string) {
  const businessId = await getBusinessId();
  await prisma.service.deleteMany({
    where: { category: categoryName, businessId }
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
  const businessId = await getBusinessId();
  await prisma.appointment.create({
    data: { ...data, businessId },
  });
  revalidatePath('/calendar');
  revalidatePath('/', 'layout');
}

export async function deleteAppointment(id: string) {
  const businessId = await getBusinessId();
  await prisma.appointment.delete({
    where: { id, businessId }
  });
  revalidatePath('/calendar');
  revalidatePath('/', 'layout');
}

export async function editAppointment(id: string, data: {
  serviceId?: string;
  date: Date;
}) {
  const businessId = await getBusinessId();
  await prisma.appointment.update({
    where: { id, businessId },
    data
  });
  revalidatePath('/calendar');
  revalidatePath('/', 'layout');
}
