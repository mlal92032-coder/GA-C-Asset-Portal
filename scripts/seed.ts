import { prisma } from '@/lib/prisma';

async function main() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await Promise.all([
      prisma.furnitureAsset.deleteMany(),
      prisma.electronicAsset.deleteMany(),
      prisma.vehicleAsset.deleteMany(),
      prisma.location.deleteMany(),
      prisma.company.deleteMany(),
      prisma.manufacturer.deleteMany(),
    ]);
    console.log('🗑️ Cleared existing data');

    // Create Companies/Offices
    const companies = await Promise.all([
      prisma.company.create({ data: { companyName: 'Main Office - Karachi', address: 'Karachi, Sindh', phone: '+92-21-123456', email: 'karachi@sefgov.pk' } }),
      prisma.company.create({ data: { companyName: 'Branch - Lahore', address: 'Lahore, Punjab', phone: '+92-42-123456', email: 'lahore@sefgov.pk' } }),
      prisma.company.create({ data: { companyName: 'Branch - Islamabad', address: 'Islamabad, ICT', phone: '+92-51-123456', email: 'islamabad@sefgov.pk' } }),
      prisma.company.create({ data: { companyName: 'Branch - Multan', address: 'Multan, Punjab', phone: '+92-61-123456', email: 'multan@sefgov.pk' } }),
      prisma.company.create({ data: { companyName: 'Branch - Peshawar', address: 'Peshawar, KPK', phone: '+92-91-123456', email: 'peshawar@sefgov.pk' } }),
      prisma.company.create({ data: { companyName: 'Warehouse - Rawalpindi', address: 'Rawalpindi, Punjab', phone: '+92-51-987654', email: 'warehouse@sefgov.pk' } }),
    ]);
    console.log('✅ Created 6 companies/offices');

    // Create Locations
    const locations = await Promise.all([
      prisma.location.create({ data: { locationName: 'Main Building', building: 'Building A', floor: '1st Floor', room: 'Office 101', roomType: 'Office' } }),
      prisma.location.create({ data: { locationName: 'Conference Hall', building: 'Building A', floor: '2nd Floor', roomType: 'Hall' } }),
      prisma.location.create({ data: { locationName: 'IT Department', building: 'Building B', floor: '3rd Floor', roomType: 'Department' } }),
      prisma.location.create({ data: { locationName: 'Storage Room', building: 'Building C', floor: 'Ground', roomType: 'Store' } }),
      prisma.location.create({ data: { locationName: 'Training Center', building: 'Building D', floor: '1st Floor', roomType: 'Training Room' } }),
      prisma.location.create({ data: { locationName: 'Branch Office - Lahore', building: 'Building A', city: 'Lahore', roomType: 'Office' } }),
      prisma.location.create({ data: { locationName: 'Warehouse', building: 'Warehouse A', floor: 'Ground', roomType: 'Warehouse' } }),
    ]);
    console.log('✅ Created 7 locations');

    // Create Manufacturers
    const manufacturers = await Promise.all([
      prisma.manufacturer.create({ data: { manufacturerName: 'IKEA', country: 'Sweden', supportEmail: 'support@ikea.com' } }),
      prisma.manufacturer.create({ data: { manufacturerName: 'Dell', country: 'USA', supportEmail: 'support@dell.com' } }),
      prisma.manufacturer.create({ data: { manufacturerName: 'HP', country: 'USA', supportEmail: 'support@hp.com' } }),
      prisma.manufacturer.create({ data: { manufacturerName: 'Toyota', country: 'Japan', supportEmail: 'support@toyota.com' } }),
      prisma.manufacturer.create({ data: { manufacturerName: 'Honda', country: 'Japan', supportEmail: 'support@honda.com' } }),
      prisma.manufacturer.create({ data: { manufacturerName: 'Apple', country: 'USA', supportEmail: 'support@apple.com' } }),
    ]);
    console.log('✅ Created 6 manufacturers');

    // Helper functions
    const conditions = ['GOOD', 'REPAIR', 'DAMAGED'];
    const statuses = ['IN_USE', 'IN_STORE', 'DISPOSED'];

    const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomCondition = () => {
      const rand = Math.random();
      if (rand < 0.7) return 'GOOD';
      if (rand < 0.9) return 'REPAIR';
      return 'DAMAGED';
    };
    const getRandomStatus = () => {
      const rand = Math.random();
      if (rand < 0.6) return 'IN_USE';
      if (rand < 0.9) return 'IN_STORE';
      return 'DISPOSED';
    };

    // Create 30 Furniture Assets
    console.log('📦 Creating 30 Furniture Assets...');
    const furnitureNames = ['Office Chair', 'Desk', 'Table', 'Cabinet', 'Shelf', 'Bookcase', 'Sofa', 'Bench'];
    for (let i = 1; i <= 30; i++) {
      await prisma.furnitureAsset.create({
        data: {
          assetTag: `FUR-${String(i).padStart(4, '0')}`,
          assetName: `${getRandomItem(furnitureNames)} #${i}`,
          furnitureType: 'Wood',
          material: 'Wood/Steel',
          purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          purchasePrice: Math.floor(Math.random() * 50000) + 5000,
          companyId: getRandomItem(companies).id,
          manufacturerId: manufacturers[0].id,
          locationId: getRandomItem(locations).id,
          condition: getRandomCondition(),
          status: getRandomStatus(),
          remarks: 'Test furniture asset',
        },
      });
    }
    console.log('✅ Created 30 Furniture Assets');

    // Create 40 Electronic Assets
    console.log('📱 Creating 40 Electronic Assets...');
    const electronicNames = ['Laptop', 'Desktop PC', 'Monitor', 'Printer', 'Scanner', 'Router', 'Switch', 'Mouse', 'Keyboard', 'Projector'];
    for (let i = 1; i <= 40; i++) {
      await prisma.electronicAsset.create({
        data: {
          assetTag: `ELE-${String(i).padStart(4, '0')}`,
          assetName: `${getRandomItem(electronicNames)} #${i}`,
          deviceType: 'Computer Equipment',
          brand: getRandomItem(['Dell', 'HP', 'Apple', 'Lenovo', 'Asus']),
          model: `Model-${Math.floor(Math.random() * 1000)}`,
          serialNumber: `SN-${Math.random().toString(36).substring(7).toUpperCase()}`,
          purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          warrantyEndDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          companyId: getRandomItem(companies).id,
          manufacturerId: getRandomItem(manufacturers.slice(1, 6)).id,
          locationId: getRandomItem(locations).id,
          condition: getRandomCondition(),
          status: getRandomStatus(),
          remarks: 'Test electronic asset',
        },
      });
    }
    console.log('✅ Created 40 Electronic Assets');

    // Create 30 Vehicle Assets
    console.log('🚗 Creating 30 Vehicle Assets...');
    const vehicleNames = ['Toyota Corolla', 'Honda Civic', 'Ford Focus', 'Suzuki Swift', 'Hyundai Elantra'];
    for (let i = 1; i <= 30; i++) {
      await prisma.vehicleAsset.create({
        data: {
          assetTag: `VEH-${String(i).padStart(4, '0')}`,
          assetName: `${getRandomItem(vehicleNames)} #${i}`,
          vehicleType: 'Car',
          brand: getRandomItem(['Toyota', 'Honda', 'Ford', 'Suzuki', 'Hyundai']),
          model: `2023-${Math.floor(Math.random() * 100)}`,
          registrationNumber: `PKR-${Math.floor(Math.random() * 10000)}`,
          engineNumber: `EN-${Math.random().toString(36).substring(7).toUpperCase()}`,
          chassisNumber: `CH-${Math.random().toString(36).substring(7).toUpperCase()}`,
          fuelType: getRandomItem(['Petrol', 'Diesel', 'Hybrid']),
          purchaseDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          purchasePrice: Math.floor(Math.random() * 5000000) + 1000000,
          companyId: getRandomItem(companies).id,
          manufacturerId: getRandomItem(manufacturers.slice(3, 5)).id,
          locationId: getRandomItem(locations).id,
          condition: getRandomCondition(),
          status: getRandomStatus(),
          remarks: 'Test vehicle asset',
        },
      });
    }
    console.log('✅ Created 30 Vehicle Assets');

    console.log('\n✨ Database seed completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 6 Companies/Offices');
    console.log('   - 7 Locations');
    console.log('   - 6 Manufacturers');
    console.log('   - 30 Furniture Assets');
    console.log('   - 40 Electronic Assets');
    console.log('   - 30 Vehicle Assets');
    console.log('   - Total: 100 Assets');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
