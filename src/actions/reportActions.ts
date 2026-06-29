'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function getBusinessId() {
  const session = await getSession();
  if (!session || !session.businessId) throw new Error('Unauthorized');
  return session.businessId;
}

export async function getReportData(startDate: string, endDate: string) {
  const businessId = await getBusinessId();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const newClientsCount = await prisma.client.count({
    where: { businessId, createdAt: { gte: start, lte: end } }
  });

  const treatmentsCount = await prisma.treatmentLog.count({
    where: { businessId, createdAt: { gte: start, lte: end } }
  });

  const invoices = await prisma.invoice.findMany({
    where: { businessId, date: { gte: start, lte: end } }
  });

  const totalIncome = invoices
    .filter(i => i.type !== 'CREDIT_INVOICE')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalRefunds = invoices
    .filter(i => i.type === 'CREDIT_INVOICE')
    .reduce((sum, i) => sum + i.amount, 0);

  const incomeByMethod: Record<string, number> = {};
  invoices.forEach(i => {
    if (i.type === 'CREDIT_INVOICE') return;
    const method = i.paymentMethod || 'אחר';
    incomeByMethod[method] = (incomeByMethod[method] || 0) + i.amount;
  });

  const recentInvoices = await prisma.invoice.findMany({
    where: { businessId, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
    include: { client: true },
    take: 100
  });

  return {
    newClientsCount,
    treatmentsCount,
    totalIncome,
    totalRefunds,
    netIncome: totalIncome - totalRefunds,
    incomeByMethod,
    recentInvoices
  };
}
