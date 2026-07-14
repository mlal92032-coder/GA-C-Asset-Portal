import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, createAuditLog } from '@/lib/api-auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const { action, reviewNotes } = await req.json();

    const request = await prisma.assetAddRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: 'Asset add request not found' },
        { status: 404 }
      );
    }

    // Update request status
    const updated = await prisma.assetAddRequest.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewedById: authResult.user.id,
        reviewNotes: reviewNotes || null,
      },
    });

    if (action === 'APPROVE') {
      // Parse and create the asset
      const assetData = JSON.parse(request.assetData);
      let createdAsset: any = null;

      try {
        if (request.assetType === 'FURNITURE') {
          createdAsset = await prisma.furnitureAsset.create({
            data: {
              assetTag: assetData.assetTag,
              assetName: assetData.assetName,
              imageUrl: assetData.imageUrl || null,
              furnitureType: assetData.furnitureType || null,
              material: assetData.material || null,
              purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
              purchasePrice: assetData.purchasePrice ? parseFloat(assetData.purchasePrice) : null,
              companyId: assetData.companyId || null,
              manufacturerId: assetData.manufacturerId || null,
              locationId: assetData.locationId || null,
              assignedUserId: assetData.assignedUserId || null,
              condition: assetData.condition || 'GOOD',
              status: assetData.status || 'IN_STORE',
              remarks: assetData.remarks || null,
              usefulLifeYears: assetData.usefulLifeYears ? parseInt(assetData.usefulLifeYears) : null,
              salvageValue: assetData.salvageValue ? parseFloat(assetData.salvageValue) : null,
              depreciationMethod: assetData.depreciationMethod || null,
            },
          });
        } else if (request.assetType === 'ELECTRONIC') {
          createdAsset = await prisma.electronicAsset.create({
            data: {
              assetTag: assetData.assetTag,
              assetName: assetData.assetName,
              imageUrl: assetData.imageUrl || null,
              deviceType: assetData.deviceType || null,
              brand: assetData.brand || null,
              model: assetData.model || null,
              serialNumber: assetData.serialNumber || null,
              purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
              warrantyEndDate: assetData.warrantyEndDate ? new Date(assetData.warrantyEndDate) : null,
              companyId: assetData.companyId || null,
              manufacturerId: assetData.manufacturerId || null,
              locationId: assetData.locationId || null,
              assignedUserId: assetData.assignedUserId || null,
              condition: assetData.condition || 'GOOD',
              status: assetData.status || 'IN_STORE',
              remarks: assetData.remarks || null,
              usefulLifeYears: assetData.usefulLifeYears ? parseInt(assetData.usefulLifeYears) : null,
              salvageValue: assetData.salvageValue ? parseFloat(assetData.salvageValue) : null,
              depreciationMethod: assetData.depreciationMethod || null,
            },
          });
        } else if (request.assetType === 'VEHICLE') {
          createdAsset = await prisma.vehicleAsset.create({
            data: {
              assetTag: assetData.assetTag,
              assetName: assetData.assetName,
              imageUrl: assetData.imageUrl || null,
              vehicleType: assetData.vehicleType || null,
              brand: assetData.brand || null,
              model: assetData.model || null,
              registrationNumber: assetData.registrationNumber,
              engineNumber: assetData.engineNumber || null,
              chassisNumber: assetData.chassisNumber || null,
              fuelType: assetData.fuelType || null,
              purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
              purchasePrice: assetData.purchasePrice ? parseFloat(assetData.purchasePrice) : null,
              companyId: assetData.companyId || null,
              manufacturerId: assetData.manufacturerId || null,
              locationId: assetData.locationId || null,
              assignedUserId: assetData.assignedUserId || null,
              condition: assetData.condition || 'GOOD',
              status: assetData.status || 'IN_STORE',
              remarks: assetData.remarks || null,
              usefulLifeYears: assetData.usefulLifeYears ? parseInt(assetData.usefulLifeYears) : null,
              salvageValue: assetData.salvageValue ? parseFloat(assetData.salvageValue) : null,
              depreciationMethod: assetData.depreciationMethod || null,
            },
          });
        }

        // Create audit log
        await createAuditLog({
          action: 'CREATE',
          entity: request.assetType,
          entityId: createdAsset?.id || '',
          details: { requestId: id, assetName: assetData.assetName },
        });

        // Notify the user who requested
        await prisma.notification.create({
          data: {
            userId: request.requestedById,
            title: 'Asset Add Request Approved',
            message: `Your request to add "${assetData.assetName}" has been approved and the asset has been created.`,
            type: 'SUCCESS',
            link: `/admin/requests`,
          },
        });
      } catch (error) {
        console.error('Error creating asset:', error);
        throw error;
      }
    } else {
      // Notify the user who requested
      const assetData = JSON.parse(request.assetData);
      await prisma.notification.create({
        data: {
          userId: request.requestedById,
          title: 'Asset Add Request Rejected',
          message: `Your request to add "${assetData.assetName}" has been rejected. ${reviewNotes || ''}`,
          type: 'ERROR',
          link: `/admin/requests`,
        },
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error processing asset add request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process asset add request' },
      { status: 500 }
    );
  }
}
