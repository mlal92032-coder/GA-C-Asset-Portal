import { prisma } from '../src/lib/prisma';

async function assignTestAssets() {
  console.log('🚀 Starting asset assignment test...');

  try {
    // Get all employees
    const employees = await prisma.user.findMany({
      select: { id: true, fullName: true },
    });

    if (employees.length === 0) {
      console.log('❌ No employees found. Create employees first!');
      return;
    }

    console.log(`✅ Found ${employees.length} employees`);

    // Get unassigned assets
    const unassignedFurniture = await prisma.furnitureAsset.findMany({
      where: { assignedUserId: null },
      take: 50,
    });

    const unassignedElectronic = await prisma.electronicAsset.findMany({
      where: { assignedUserId: null },
      take: 30,
    });

    const unassignedVehicle = await prisma.vehicleAsset.findMany({
      where: { assignedUserId: null },
      take: 20,
    });

    const totalAssets = unassignedFurniture.length + unassignedElectronic.length + unassignedVehicle.length;
    console.log(`📦 Found ${totalAssets} unassigned assets to distribute`);

    let assignedCount = 0;

    // Assign furniture
    for (const asset of unassignedFurniture) {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      await prisma.furnitureAsset.update({
        where: { id: asset.id },
        data: { assignedUserId: randomEmployee.id },
      });
      assignedCount++;
    }
    console.log(`✅ Assigned ${unassignedFurniture.length} furniture assets`);

    // Assign electronics
    for (const asset of unassignedElectronic) {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      await prisma.electronicAsset.update({
        where: { id: asset.id },
        data: { assignedUserId: randomEmployee.id },
      });
      assignedCount++;
    }
    console.log(`✅ Assigned ${unassignedElectronic.length} electronic assets`);

    // Assign vehicles
    for (const asset of unassignedVehicle) {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      await prisma.vehicleAsset.update({
        where: { id: asset.id },
        data: { assignedUserId: randomEmployee.id },
      });
      assignedCount++;
    }
    console.log(`✅ Assigned ${unassignedVehicle.length} vehicle assets`);

    console.log(`\n✨ Successfully assigned ${assignedCount} assets to employees!`);

    // Show summary
    const summary = await prisma.user.findMany({
      select: {
        fullName: true,
        department: true,
        designation: true,
        _count: {
          select: {
            assignedFurniture: true,
            assignedElectronic: true,
            assignedVehicle: true,
          },
        },
      },
    });

    console.log('\n📊 Assignment Summary:');
    console.log('═'.repeat(80));
    summary
      .filter((emp) => emp._count.assignedFurniture + emp._count.assignedElectronic + emp._count.assignedVehicle > 0)
      .forEach((emp) => {
        const total = emp._count.assignedFurniture + emp._count.assignedElectronic + emp._count.assignedVehicle;
        console.log(`${emp.fullName.padEnd(30)} | Dept: ${(emp.department || 'N/A').padEnd(20)} | Assets: ${total}`);
      });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTestAssets();
