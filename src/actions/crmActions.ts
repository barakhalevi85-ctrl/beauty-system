'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function getClientActiveSeries(clientId: string) {
  return await prisma.clientSeries.findMany({
    where: { clientId, isCompleted: false },
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function sellPackage(formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const serviceId = formData.get('serviceId') as string;
  const isSeries = formData.get('treatmentType') === 'series';
  const seriesTotal = isSeries ? Number(formData.get('seriesTotal')) : 1;
  const pricePaid = formData.get('pricePaid') ? Number(formData.get('pricePaid')) : null;

  const service = await prisma.service.findUnique({ where: { id: serviceId }});

  await prisma.clientSeries.create({
    data: {
      clientId,
      serviceId,
      serviceName: service?.name || 'כללי',
      totalTreatments: seriesTotal,
      pricePaid,
    }
  });

  // Add automatic call log entry
  const typeText = isSeries ? `סדרה של ${seriesTotal} טיפולים` : 'טיפול בודד';
  const priceText = pricePaid ? ` במחיר ${pricePaid} ₪` : '';
  const notes = `💰 רכישה חדשה: ${service?.name} (${typeText})${priceText}`;

  await prisma.callLog.create({
    data: {
      clientId,
      notes
    }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function updatePackage(formData: FormData) {
  const seriesId = formData.get('seriesId') as string;
  const clientId = formData.get('clientId') as string;
  const serviceId = formData.get('serviceId') as string;
  const isSeries = formData.get('treatmentType') === 'series';
  const seriesTotal = isSeries ? Number(formData.get('seriesTotal')) : 1;
  const pricePaid = formData.get('pricePaid') ? Number(formData.get('pricePaid')) : null;
  const editReason = formData.get('editReason') as string;

  const updated = await prisma.clientSeries.update({
    where: { id: seriesId },
    data: {
      serviceId,
      totalTreatments: seriesTotal,
      pricePaid,
    },
    include: { service: true }
  });

  const typeText = isSeries ? `סדרה של ${seriesTotal} טיפולים` : 'טיפול בודד';
  const priceText = pricePaid ? ` במחיר ${pricePaid} ₪` : '';
  const notes = `🔄 עדכון חבילה: שונה ל-${updated.service?.name} (${typeText})${priceText}. סיבה: ${editReason || 'לא צוינה'}`;

  await prisma.callLog.create({
    data: { clientId, notes }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function deletePackage(formData: FormData) {
  const seriesId = formData.get('seriesId') as string;
  const clientId = formData.get('clientId') as string;
  const deleteReason = formData.get('deleteReason') as string;

  const series = await prisma.clientSeries.findUnique({
    where: { id: seriesId },
    include: { service: true }
  });

  if (series) {
    await prisma.clientSeries.delete({
      where: { id: seriesId }
    });

    const notes = `❌ ביטול חבילה/עסקה: ${series.service?.name}. סיבה: ${deleteReason || 'לא צוינה'}`;

    await prisma.callLog.create({
      data: { clientId, notes }
    });
  }

  revalidatePath(`/crm/${clientId}`);
}

export async function logTreatment(formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const appointmentId = formData.get('appointmentId') as string;
  const bodyArea = formData.get('bodyArea') as string;
  const fluenceJoule = Number(formData.get('fluenceJoule'));
  const technicianNotes = formData.get('technicianNotes') as string;
  const serviceId = formData.get('serviceId') as string;
  const paymentAmount = formData.get('paymentAmount') ? Number(formData.get('paymentAmount')) : 0;
  const selectedSeriesId = formData.get('clientSeriesId') as string;

  // Find active series for this client and service to punch it
  let clientSeriesId = null;
  let treatmentNumber = 1;
  let seriesTotal = null;

  if (selectedSeriesId && selectedSeriesId !== 'none') {
    const activeSeries = await prisma.clientSeries.findUnique({
      where: { id: selectedSeriesId }
    });

    if (activeSeries && !activeSeries.isCompleted) {
      clientSeriesId = activeSeries.id;
      treatmentNumber = activeSeries.usedTreatments + 1;
      seriesTotal = activeSeries.totalTreatments;

      // Update the series (Punch the card)
      await prisma.clientSeries.update({
        where: { id: activeSeries.id },
        data: {
          usedTreatments: { increment: 1 },
          pricePaid: paymentAmount > 0 ? { increment: paymentAmount } : undefined,
          isCompleted: activeSeries.usedTreatments + 1 >= activeSeries.totalTreatments
        }
      });
    }
  }

  // Create the treatment log
  await prisma.treatmentLog.create({
    data: {
      clientId,
      clientSeriesId,
      treatmentNumber,
      seriesTotal,
      bodyArea,
      fluenceJoule,
      technicianNotes,
      imageUrls: null // Add S3/Storage logic later
    }
  });

  // Add automatic call log entry
  const paymentText = paymentAmount > 0 ? ` (שולם: ${paymentAmount} ₪)` : '';
  const notes = `✅ טיפול בוצע: ${bodyArea} (טיפול ${treatmentNumber} מתוך ${seriesTotal || 1})${paymentText}`;
  await prisma.callLog.create({
    data: { clientId, notes }
  });

  // Mark appointment as completed
  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'completed' }
    });
  }

  revalidatePath(`/crm/${clientId}`);
  revalidatePath(`/calendar`);
}

export async function addTreatmentLog(formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const treatmentNumber = Number(formData.get('treatmentNumber'));
  const seriesTotal = formData.get('seriesTotal') ? Number(formData.get('seriesTotal')) : null;
  const bodyArea = formData.get('bodyArea') as string;
  const fluenceJoule = Number(formData.get('fluenceJoule'));
  const technicianNotes = formData.get('technicianNotes') as string;

  const imageFiles = formData.getAll('images') as File[];
  const uploadedUrls: string[] = [];

  const uploadDir = join(process.cwd(), 'public/uploads/treatments');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore if directory already exists
  }

  for (const file of imageFiles) {
    if (file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      uploadedUrls.push(`/uploads/treatments/${filename}`);
    }
  }

  const imageUrlsStr = uploadedUrls.length > 0 ? uploadedUrls.join(',') : null;

  await prisma.treatmentLog.create({
    data: {
      clientId,
      treatmentNumber,
      seriesTotal,
      bodyArea,
      fluenceJoule,
      technicianNotes,
      imageUrls: imageUrlsStr,
    }
  });

  // Add automatic call log entry
  const notes = `✅ תיעוד טיפול: ${bodyArea} (טיפול ${treatmentNumber} מתוך ${seriesTotal || 1})`;
  await prisma.callLog.create({
    data: { clientId, notes }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function addClient(formData: FormData) {
  const name = formData.get('name') as string;
  const lastName = formData.get('lastName') as string;
  const idNumber = formData.get('idNumber') as string;
  const phone = formData.get('phone') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const gender = formData.get('gender') as string;
  const leadSource = formData.get('leadSource') as string;
  const address = formData.get('address') as string;
  const medicalNotes = formData.get('medicalNotes') as string;
  const healthDeclarationSent = formData.get('healthDeclarationSent') === 'on';

  const newClient = await prisma.client.create({
    data: {
      name,
      lastName,
      idNumber,
      phone,
      dateOfBirth,
      gender,
      leadSource,
      address,
      medicalNotes,
      healthDeclarationSent,
    }
  });

  revalidatePath('/crm');
  return newClient;
}

export async function addCallLog(formData: FormData) {
  const clientId = formData.get('clientId') as string;
  const notes = formData.get('notes') as string;
  
  await prisma.callLog.create({
    data: {
      clientId,
      notes,
    }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function deleteClient(clientId: string) {
  // Soft Delete (Archive)
  await prisma.client.update({
    where: { id: clientId },
    data: { isActive: false }
  });

  revalidatePath('/crm');
}

export async function restoreClient(clientId: string) {
  // Restore
  await prisma.client.update({
    where: { id: clientId },
    data: { isActive: true }
  });

  revalidatePath('/crm/inactive');
  revalidatePath('/crm');
}

export async function updateCallLog(id: string, notes: string) {
  const log = await prisma.callLog.update({
    where: { id },
    data: { notes }
  });

  revalidatePath(`/crm/${log.clientId}`);
}

export async function deleteTreatmentLog(id: string, clientId: string) {
  await prisma.treatmentLog.delete({
    where: { id }
  });
  revalidatePath(`/crm/${clientId}`);
}
