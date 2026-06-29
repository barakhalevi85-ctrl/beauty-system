'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function getClientActiveSeries(clientId: string) {
  const businessId = await getBusinessId();
  return await prisma.clientSeries.findMany({
    where: { clientId, isCompleted: false, businessId },
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function sellPackage(formData: FormData) {
  const businessId = await getBusinessId();
  const clientId = formData.get('clientId') as string;
  const serviceId = formData.get('serviceId') as string;
  const isSeries = formData.get('treatmentType') === 'series';
  const seriesTotal = isSeries ? Number(formData.get('seriesTotal')) : 1;
  const pricePaid = formData.get('pricePaid') ? Number(formData.get('pricePaid')) : null;
  const paymentMethod = formData.get('paymentMethod') as string;

  const service = await prisma.service.findUnique({ where: { id: serviceId, businessId }});

  const newSeries = await prisma.clientSeries.create({
    data: {
      businessId,
      clientId,
      serviceId,
      serviceName: service?.name || 'כללי',
      totalTreatments: seriesTotal,
      pricePaid,
    }
  });

  let invoiceStr = '';
  let generatedInvoiceId = null;
  if (pricePaid && pricePaid > 0) {
    const sysSettings = await prisma.systemSettings.findUnique({ where: { businessId } });
    const bizSettings = sysSettings?.businessSettings ? JSON.parse(sysSettings.businessSettings) : null;
    const nextInvoiceNumber = bizSettings?.nextInvoiceNumber || 1000;
    const dealerType = bizSettings?.dealerType === 'AUTHORIZED' ? 'TAX_RECEIPT' : 'RECEIPT';

    const newInvoice = await prisma.invoice.create({
      data: {
        businessId,
        invoiceNumber: String(nextInvoiceNumber),
        clientId,
        amount: pricePaid,
        type: dealerType,
        paymentMethod: paymentMethod || 'מזומן',
        description: `רכישת ${isSeries ? `סדרה של ${seriesTotal} טיפולים` : 'טיפול בודד'}: ${service?.name || 'כללי'}`,
        clientSeriesId: newSeries.id
      }
    });

    if (bizSettings && sysSettings) {
      bizSettings.nextInvoiceNumber = nextInvoiceNumber + 1;
      await prisma.systemSettings.update({
        where: { id: sysSettings.id },
        data: { businessSettings: JSON.stringify(bizSettings) }
      });
    }

    invoiceStr = ` | הופקה ${dealerType === 'TAX_RECEIPT' ? 'חשבונית מס קבלה' : 'קבלה'} מס' ${nextInvoiceNumber}`;
    generatedInvoiceId = newInvoice.id;
  }

  const typeText = isSeries ? `סדרה של ${seriesTotal} טיפולים` : 'טיפול בודד';
  const priceText = pricePaid ? ` במחיר ${pricePaid} ₪ (אמצעי תשלום: ${paymentMethod || 'מזומן'})` : '';
  const notes = `💰 רכישה חדשה: ${service?.name} (${typeText})${priceText}${invoiceStr}`;

  await prisma.callLog.create({
    data: {
      businessId,
      clientId,
      notes
    }
  });

  revalidatePath(`/crm/${clientId}`);
  return { invoiceId: generatedInvoiceId };
}

export async function updatePackage(formData: FormData) {
  const businessId = await getBusinessId();
  const seriesId = formData.get('seriesId') as string;
  const clientId = formData.get('clientId') as string;
  const serviceId = formData.get('serviceId') as string;
  const isSeries = formData.get('treatmentType') === 'series';
  const seriesTotal = isSeries ? Number(formData.get('seriesTotal')) : 1;
  const pricePaid = formData.get('pricePaid') ? Number(formData.get('pricePaid')) : null;
  const editReason = formData.get('editReason') as string;

  const updated = await prisma.clientSeries.update({
    where: { id: seriesId, businessId },
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
    data: { businessId, clientId, notes }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function deletePackage(formData: FormData) {
  const businessId = await getBusinessId();
  const seriesId = formData.get('seriesId') as string;
  const clientId = formData.get('clientId') as string;
  const deleteReason = formData.get('deleteReason') as string;

  const series = await prisma.clientSeries.findUnique({
    where: { id: seriesId, businessId },
    include: { service: true }
  });

  if (series) {
    await prisma.clientSeries.delete({
      where: { id: seriesId }
    });

    const notes = `❌ ביטול חבילה/עסקה: ${series.service?.name}. סיבה: ${deleteReason || 'לא צוינה'}`;

    await prisma.callLog.create({
      data: { businessId, clientId, notes }
    });
  }

  revalidatePath(`/crm/${clientId}`);
}

export async function logTreatment(formData: FormData) {
  const businessId = await getBusinessId();
  const clientId = formData.get('clientId') as string;
  const appointmentId = formData.get('appointmentId') as string;
  const bodyArea = formData.get('bodyArea') as string;
  const fluenceJoule = Number(formData.get('fluenceJoule'));
  const technicianNotes = formData.get('technicianNotes') as string;
  const serviceId = formData.get('serviceId') as string;
  const paymentAmount = formData.get('paymentAmount') ? Number(formData.get('paymentAmount')) : 0;
  const paymentMethod = formData.get('paymentMethod') as string;
  const selectedSeriesId = formData.get('clientSeriesId') as string;

  let clientSeriesId = null;
  let treatmentNumber = 1;
  let seriesTotal = null;

  if (selectedSeriesId && selectedSeriesId !== 'none') {
    const activeSeries = await prisma.clientSeries.findUnique({
      where: { id: selectedSeriesId, businessId }
    });

    if (activeSeries && !activeSeries.isCompleted) {
      clientSeriesId = activeSeries.id;
      treatmentNumber = activeSeries.usedTreatments + 1;
      seriesTotal = activeSeries.totalTreatments;

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

  const newTreatmentLog = await prisma.treatmentLog.create({
    data: {
      businessId,
      clientId,
      appointmentId: appointmentId || null,
      clientSeriesId,
      treatmentNumber,
      seriesTotal,
      bodyArea,
      fluenceJoule,
      technicianNotes,
      imageUrls: null
    }
  });

  let invoiceStr = '';
  let generatedInvoiceId = null;
  if (paymentAmount > 0) {
    const sysSettings = await prisma.systemSettings.findUnique({ where: { businessId } });
    const bizSettings = sysSettings?.businessSettings ? JSON.parse(sysSettings.businessSettings) : null;
    const nextInvoiceNumber = bizSettings?.nextInvoiceNumber || 1000;
    const dealerType = bizSettings?.dealerType === 'AUTHORIZED' ? 'TAX_RECEIPT' : 'RECEIPT';

    const newInvoice = await prisma.invoice.create({
      data: {
        businessId,
        invoiceNumber: String(nextInvoiceNumber),
        clientId,
        amount: paymentAmount,
        type: dealerType,
        paymentMethod: paymentMethod || 'מזומן',
        description: `תשלום עבור טיפול: ${bodyArea}`,
        treatmentLogId: newTreatmentLog.id
      }
    });

    if (bizSettings && sysSettings) {
      bizSettings.nextInvoiceNumber = nextInvoiceNumber + 1;
      await prisma.systemSettings.update({
        where: { id: sysSettings.id },
        data: { businessSettings: JSON.stringify(bizSettings) }
      });
    }

    invoiceStr = ` | הופקה ${dealerType === 'TAX_RECEIPT' ? 'חשבונית מס קבלה' : 'קבלה'} מס' ${nextInvoiceNumber}`;
    generatedInvoiceId = newInvoice.id;
  }

  const paymentText = paymentAmount > 0 ? ` (שולם: ${paymentAmount} ₪, ${paymentMethod || 'מזומן'}${invoiceStr})` : '';
  const notes = `✅ טיפול בוצע: ${bodyArea} (טיפול ${treatmentNumber} מתוך ${seriesTotal || 1})${paymentText}`;
  await prisma.callLog.create({
    data: { businessId, clientId, notes }
  });

  if (appointmentId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'completed' }
    });
  }

  revalidatePath(`/crm/${clientId}`);
  revalidatePath(`/calendar`);
  return { invoiceId: generatedInvoiceId };
}

export async function cancelAppointment(appointmentId: string, clientId: string, reason: string) {
  const businessId = await getBusinessId();
  await prisma.appointment.update({
    where: { id: appointmentId, businessId },
    data: { status: 'בוטל' }
  });

  const notes = `❌ התור בוטל. סיבה: ${reason || 'לא צוינה'}`;
  await prisma.callLog.create({
    data: { businessId, clientId, notes }
  });

  revalidatePath(`/crm/${clientId}`);
  revalidatePath(`/calendar`);
}

export async function addTreatmentLog(formData: FormData) {
  const businessId = await getBusinessId();
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
      businessId,
      clientId,
      treatmentNumber,
      seriesTotal,
      bodyArea,
      fluenceJoule,
      technicianNotes,
      imageUrls: imageUrlsStr,
    }
  });

  const notes = `✅ תיעוד טיפול: ${bodyArea} (טיפול ${treatmentNumber} מתוך ${seriesTotal || 1})`;
  await prisma.callLog.create({
    data: { businessId, clientId, notes }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function addClient(formData: FormData) {
  const businessId = await getBusinessId();
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
      businessId,
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

export async function updateClientInfo(formData: FormData) {
  const businessId = await getBusinessId();
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const lastName = formData.get('lastName') as string;
  const idNumber = formData.get('idNumber') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const email = formData.get('email') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const medicalNotes = formData.get('medicalNotes') as string;
  const gender = formData.get('gender') as string;

  await prisma.client.update({
    where: { id, businessId },
    data: {
      name,
      lastName,
      idNumber,
      phone,
      address,
      email,
      dateOfBirth,
      medicalNotes,
      gender,
    }
  });

  revalidatePath(`/crm/${id}`);
  revalidatePath('/crm');
}

export async function addCallLog(formData: FormData) {
  const businessId = await getBusinessId();
  const clientId = formData.get('clientId') as string;
  const notes = formData.get('notes') as string;
  
  await prisma.callLog.create({
    data: {
      businessId,
      clientId,
      notes,
    }
  });

  revalidatePath(`/crm/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const businessId = await getBusinessId();
  await prisma.client.update({
    where: { id: clientId, businessId },
    data: { isActive: false }
  });
  revalidatePath('/crm');
}

export async function restoreClient(clientId: string) {
  const businessId = await getBusinessId();
  await prisma.client.update({
    where: { id: clientId, businessId },
    data: { isActive: true }
  });
  revalidatePath('/crm/inactive');
  revalidatePath('/crm');
}

export async function updateCallLog(id: string, notes: string) {
  const businessId = await getBusinessId();
  const log = await prisma.callLog.update({
    where: { id, businessId },
    data: { notes }
  });
  revalidatePath(`/crm/${log.clientId}`);
}

export async function deleteTreatmentLog(id: string, clientId: string) {
  const businessId = await getBusinessId();
  await prisma.treatmentLog.delete({
    where: { id, businessId }
  });
  revalidatePath(`/crm/${clientId}`);
}

export async function refundCompletedAppointment(appointmentId: string) {
  const businessId = await getBusinessId();
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, businessId },
    include: { treatmentLog: { include: { invoices: true } } }
  });

  if (!appointment || !appointment.treatmentLog) {
    throw new Error('Treatment log not found for this appointment');
  }

  const { treatmentLog } = appointment;
  let notesStr = `🔄 ביטול תור / זיכוי טיפול: ${treatmentLog.bodyArea}`;
  let generatedInvoiceId = null;

  if (treatmentLog.invoices && treatmentLog.invoices.length > 0) {
    const originalInvoice = treatmentLog.invoices[0];
    
    for (const inv of treatmentLog.invoices) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { treatmentLogId: null }
      });
    }

    if (originalInvoice.amount > 0) {
      const sysSettings = await prisma.systemSettings.findUnique({ where: { businessId } });
      const bizSettings = sysSettings?.businessSettings ? JSON.parse(sysSettings.businessSettings) : null;
      const nextInvoiceNumber = bizSettings?.nextInvoiceNumber || 1000;

      const newInvoice = await prisma.invoice.create({
        data: {
          businessId,
          invoiceNumber: String(nextInvoiceNumber),
          clientId: treatmentLog.clientId,
          amount: originalInvoice.amount,
          type: 'CREDIT_INVOICE',
          paymentMethod: originalInvoice.paymentMethod,
          description: `זיכוי עבור טיפול שבוטל (מקור: ${originalInvoice.invoiceNumber})`,
        }
      });

      if (bizSettings && sysSettings) {
        bizSettings.nextInvoiceNumber = nextInvoiceNumber + 1;
        await prisma.systemSettings.update({
          where: { id: sysSettings.id },
          data: { businessSettings: JSON.stringify(bizSettings) }
        });
      }

      generatedInvoiceId = newInvoice.id;
      notesStr += ` | הופקה חשבונית זיכוי מס' ${nextInvoiceNumber} על סך ${originalInvoice.amount} ₪`;
    }
  }

  if (treatmentLog.clientSeriesId) {
    const series = await prisma.clientSeries.findUnique({ where: { id: treatmentLog.clientSeriesId } });
    if (series) {
      await prisma.clientSeries.update({
        where: { id: series.id },
        data: {
          usedTreatments: Math.max(0, series.usedTreatments - 1),
          isCompleted: false
        }
      });
      notesStr += ` | ניקוב טיפול הוחזר לכרטיסייה`;
    }
  }

  await prisma.callLog.create({
    data: {
      businessId,
      clientId: treatmentLog.clientId,
      notes: notesStr
    }
  });

  await prisma.treatmentLog.delete({
    where: { id: treatmentLog.id }
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'מתוכנן' }
  });

  revalidatePath(`/crm/${treatmentLog.clientId}`);
  revalidatePath(`/calendar`);
  return { invoiceId: generatedInvoiceId };
}

export async function getClientFullProfile(clientId: string) {
  const businessId = await getBusinessId();
  return await prisma.client.findUnique({
    where: { id: clientId, businessId },
    include: {
      clientSeries: {
        include: { service: true, invoices: true },
        orderBy: { createdAt: 'desc' },
      },
      treatmentLogs: {
        include: { invoices: true },
        orderBy: { createdAt: 'desc' },
      },
      callLogs: {
        orderBy: { createdAt: 'desc' },
      },
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        include: { service: true }
      }
    }
  });
}
