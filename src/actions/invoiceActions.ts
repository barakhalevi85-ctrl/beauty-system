'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function cancelInvoice(invoiceId: string) {
  const businessId = await getBusinessId();
  const originalInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, businessId }
  });

  if (!originalInvoice) {
    throw new Error('חשבונית לא נמצאה');
  }

  if (originalInvoice.type === 'CREDIT_INVOICE') {
    throw new Error('לא ניתן לזכות חשבונית זיכוי');
  }

  const lastCreditInvoice = await prisma.invoice.findFirst({
    where: { type: 'CREDIT_INVOICE', businessId },
    orderBy: { invoiceNumber: 'desc' }
  });

  let newInvoiceNumber = 'C-1000';
  if (lastCreditInvoice && lastCreditInvoice.invoiceNumber) {
    const numPart = parseInt(lastCreditInvoice.invoiceNumber.replace('C-', ''));
    if (!isNaN(numPart)) {
      newInvoiceNumber = `C-${numPart + 1}`;
    }
  }

  await prisma.invoice.create({
    data: {
      businessId,
      invoiceNumber: newInvoiceNumber,
      clientId: originalInvoice.clientId,
      amount: originalInvoice.amount,
      type: 'CREDIT_INVOICE',
      paymentMethod: originalInvoice.paymentMethod,
      description: `זיכוי עבור חשבונית ${originalInvoice.invoiceNumber}`,
      items: `זיכוי עבור: ${originalInvoice.items || 'שירות כללי'}`
    }
  });

  revalidatePath('/invoices');
}
