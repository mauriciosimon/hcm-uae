import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { DocumentType, DocumentStatus } from '@prisma/client';

const DEFAULT_COMPANY_ID = 'company-1';

function calculateExpiryStatus(expiryDate: Date | null): string {
  if (!expiryDate) return 'valid';

  const today = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 30) return 'urgent';
  if (daysUntilExpiry <= 60) return 'warning';
  if (daysUntilExpiry <= 90) return 'upcoming';
  return 'valid';
}

function calculateDaysRemaining(expiryDate: Date | null): number {
  if (!expiryDate) return 999;

  const today = new Date();
  return Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

// GET /api/documents - Get documents or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const getStats = searchParams.get('stats');

    // Return stats if requested
    if (getStats === 'true') {
      const documents = await prisma.document.findMany({
        where: { companyId: DEFAULT_COMPANY_ID },
        select: { expiryDate: true },
      });

      const stats = {
        expired: 0,
        critical: 0,
        urgent: 0,
        warning: 0,
        upcoming: 0,
        valid: 0,
      };

      documents.forEach((doc) => {
        const status = calculateExpiryStatus(doc.expiryDate) as keyof typeof stats;
        if (stats[status] !== undefined) {
          stats[status]++;
        }
      });

      return NextResponse.json(stats);
    }

    const employeeId = searchParams.get('employeeId');
    const documentType = searchParams.get('documentType');
    const expiryStatus = searchParams.get('expiryStatus');
    const daysAhead = searchParams.get('daysAhead');

    let dateFilter = {};
    if (daysAhead) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(daysAhead));
      dateFilter = {
        expiryDate: { lte: futureDate },
      };
    }

    const documents = await prisma.document.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        ...(employeeId && { employeeId }),
        ...(documentType && { documentType: documentType.toUpperCase() as DocumentType }),
        ...dateFilter,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    let result = documents.map((doc) => ({
      id: doc.id,
      employeeId: doc.employeeId,
      employeeName: `${doc.employee.firstName} ${doc.employee.lastName}`,
      employeeCode: doc.employee.employeeId,
      department: doc.employee.department,
      documentType: doc.documentType.toLowerCase().replace('_', ' '),
      documentNumber: doc.documentNumber || '',
      issueDate: doc.issueDate?.toISOString().split('T')[0] || '',
      expiryDate: doc.expiryDate?.toISOString().split('T')[0] || '',
      issuingAuthority: doc.issuingAuthority || '',
      status: calculateExpiryStatus(doc.expiryDate),
      daysRemaining: calculateDaysRemaining(doc.expiryDate),
      fileUrl: doc.fileUrl,
      notes: doc.notes,
      createdAt: doc.createdAt.toISOString(),
    }));

    // Filter by expiry status if specified
    if (expiryStatus) {
      result = result.filter((doc) => doc.status === expiryStatus);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Create document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const document = await prisma.document.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        employeeId: body.employeeId,
        documentType: body.documentType.toUpperCase().replace(' ', '_') as DocumentType,
        documentNumber: body.documentNumber,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: new Date(body.expiryDate),
        issuingAuthority: body.issuingAuthority,
        fileUrl: body.fileUrl,
        notes: body.notes,
        status: DocumentStatus.ACTIVE,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: document.id,
      employeeId: document.employeeId,
      employeeName: `${document.employee.firstName} ${document.employee.lastName}`,
      documentType: document.documentType.toLowerCase().replace('_', ' '),
      documentNumber: document.documentNumber || '',
      expiryDate: document.expiryDate?.toISOString().split('T')[0] || '',
      status: calculateExpiryStatus(document.expiryDate),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

// PUT /api/documents - Update document
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(updateData.documentNumber && { documentNumber: updateData.documentNumber }),
        ...(updateData.issueDate && { issueDate: new Date(updateData.issueDate) }),
        ...(updateData.expiryDate && { expiryDate: new Date(updateData.expiryDate) }),
        ...(updateData.issuingAuthority && { issuingAuthority: updateData.issuingAuthority }),
        ...(updateData.fileUrl && { fileUrl: updateData.fileUrl }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
      },
    });

    return NextResponse.json({ success: true, id: document.id });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/documents - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

