import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.furnitureAsset.deleteMany();
  await prisma.electronicAsset.deleteMany();
  await prisma.vehicleAsset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.location.deleteMany();

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      email: 'admin@company.com',
      password: adminPassword,
      department: 'IT',
      designation: 'System Administrator',
      phone: '+1-555-0100',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  const manager = await prisma.user.create({
    data: {
      fullName: 'John Manager',
      email: 'manager@company.com',
      password: userPassword,
      department: 'Operations',
      designation: 'Operations Manager',
      phone: '+1-555-0101',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      fullName: 'Alice Johnson',
      email: 'alice@company.com',
      password: userPassword,
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '+1-555-0102',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      fullName: 'Bob Williams',
      email: 'bob@company.com',
      password: userPassword,
      department: 'Marketing',
      designation: 'Marketing Specialist',
      phone: '+1-555-0103',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Carol Davis',
      email: 'carol@company.com',
      password: userPassword,
      department: 'HR',
      designation: 'HR Manager',
      phone: '+1-555-0104',
      role: 'USER',
      status: 'INACTIVE',
    },
  });

  console.log('✅ Users created');

  // Create Companies
  const company1 = await prisma.company.create({
    data: {
      companyName: 'TechCorp International',
      address: '123 Innovation Drive, Silicon Valley, CA',
      phone: '+1-555-0200',
      email: 'info@techcorp.com',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      companyName: 'Global Services Ltd',
      address: '456 Business Park, London, UK',
      phone: '+44-20-7946-0958',
      email: 'contact@globalservices.co.uk',
    },
  });

  console.log('✅ Companies created');

  // Create Manufacturers
  const mfg1 = await prisma.manufacturer.create({
    data: {
      manufacturerName: 'Herman Miller',
      country: 'USA',
      supportEmail: 'support@hermanmiller.com',
      supportPhone: '+1-800-533-6646',
    },
  });

  const mfg2 = await prisma.manufacturer.create({
    data: {
      manufacturerName: 'Dell Technologies',
      country: 'USA',
      supportEmail: 'support@dell.com',
      supportPhone: '+1-800-624-9897',
    },
  });

  const mfg3 = await prisma.manufacturer.create({
    data: {
      manufacturerName: 'Toyota Motor Corp',
      country: 'Japan',
      supportEmail: 'support@toyota.com',
      supportPhone: '+81-565-28-2121',
    },
  });

  const mfg4 = await prisma.manufacturer.create({
    data: {
      manufacturerName: 'Apple Inc',
      country: 'USA',
      supportEmail: 'support@apple.com',
      supportPhone: '+1-800-275-2273',
    },
  });

  const mfg5 = await prisma.manufacturer.create({
    data: {
      manufacturerName: 'Steelcase',
      country: 'USA',
      supportEmail: 'support@steelcase.com',
      supportPhone: '+1-800-333-9939',
    },
  });

  console.log('✅ Manufacturers created');

  // Create Locations
  const loc1 = await prisma.location.create({
    data: {
      locationName: 'Head Office - Floor 1',
      building: 'Main Building',
      floor: '1',
      room: 'Lobby & Reception',
      description: 'Main entrance and reception area',
    },
  });

  const loc2 = await prisma.location.create({
    data: {
      locationName: 'Head Office - Floor 2',
      building: 'Main Building',
      floor: '2',
      room: 'Engineering Department',
      description: 'Software engineering team workspace',
    },
  });

  const loc3 = await prisma.location.create({
    data: {
      locationName: 'Head Office - Floor 3',
      building: 'Main Building',
      floor: '3',
      room: 'Management Suite',
      description: 'Executive offices and meeting rooms',
    },
  });

  const loc4 = await prisma.location.create({
    data: {
      locationName: 'Warehouse A',
      building: 'Storage Complex',
      floor: 'Ground',
      room: 'Section A1',
      description: 'Main storage for surplus assets',
    },
  });

  const loc5 = await prisma.location.create({
    data: {
      locationName: 'Branch Office',
      building: 'Downtown Tower',
      floor: '15',
      room: 'Suite 1501',
      description: 'Regional branch office',
    },
  });

  console.log('✅ Locations created');

  // Create Furniture Assets
  await prisma.furnitureAsset.createMany({
    data: [
      {
        assetTag: 'AST-FUR-2025-0001',
        assetName: 'Executive Office Desk',
        furnitureType: 'Desk',
        material: 'Oak Wood',
        purchaseDate: new Date('2023-06-15'),
        purchasePrice: 1200,
        companyId: company1.id,
        manufacturerId: mfg1.id,
        locationId: loc3.id,
        assignedUserId: manager.id,
        condition: 'GOOD',
        status: 'IN_USE',
        remarks: 'Premium executive desk with built-in cable management',
      },
      {
        assetTag: 'AST-FUR-2025-0002',
        assetName: 'Ergonomic Office Chair',
        furnitureType: 'Chair',
        material: 'Mesh/Aluminum',
        purchaseDate: new Date('2024-01-10'),
        purchasePrice: 850,
        companyId: company1.id,
        manufacturerId: mfg5.id,
        locationId: loc2.id,
        assignedUserId: employee1.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-FUR-2025-0003',
        assetName: 'Conference Table (12-seater)',
        furnitureType: 'Table',
        material: 'Walnut',
        purchaseDate: new Date('2023-03-20'),
        purchasePrice: 3500,
        companyId: company1.id,
        manufacturerId: mfg1.id,
        locationId: loc3.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-FUR-2025-0004',
        assetName: 'Standing Desk - Adjustable',
        furnitureType: 'Desk',
        material: 'Bamboo/Steel',
        purchaseDate: new Date('2024-02-28'),
        purchasePrice: 650,
        companyId: company1.id,
        manufacturerId: mfg5.id,
        locationId: loc2.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-FUR-2025-0005',
        assetName: 'Reception Sofa',
        furnitureType: 'Sofa',
        material: 'Leather',
        purchaseDate: new Date('2022-11-05'),
        purchasePrice: 1800,
        companyId: company1.id,
        manufacturerId: mfg1.id,
        locationId: loc1.id,
        condition: 'REPAIR',
        status: 'IN_USE',
        remarks: 'Needs upholstery repair on left armrest',
      },
      {
        assetTag: 'AST-FUR-2025-0006',
        assetName: 'Filing Cabinet (4-drawer)',
        furnitureType: 'Cabinet',
        material: 'Steel',
        purchaseDate: new Date('2023-09-12'),
        purchasePrice: 350,
        companyId: company2.id,
        manufacturerId: mfg5.id,
        locationId: loc4.id,
        condition: 'GOOD',
        status: 'IN_STORE',
      },
      {
        assetTag: 'AST-FUR-2025-0007',
        assetName: 'Bookshelf - Open',
        furnitureType: 'Shelf',
        material: 'Pine Wood',
        purchaseDate: new Date('2023-04-18'),
        purchasePrice: 420,
        companyId: company1.id,
        manufacturerId: mfg5.id,
        locationId: loc2.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-FUR-2025-0008',
        assetName: 'Damaged Office Chair',
        furnitureType: 'Chair',
        material: 'Fabric/Plastic',
        purchaseDate: new Date('2021-05-10'),
        purchasePrice: 200,
        companyId: company1.id,
        manufacturerId: mfg1.id,
        locationId: loc4.id,
        condition: 'DAMAGED',
        status: 'DISPOSED',
        remarks: 'Broken wheel base, beyond repair',
      },
    ],
  });

  // Add 22 more furniture assets (30 total)
  const furnitureNames = ['Office Chair', 'Desk', 'Table', 'Cabinet', 'Shelf', 'Bookcase', 'Sofa', 'Bench'];
  const furnitureData = [];
  for (let i = 9; i <= 30; i++) {
    furnitureData.push({
      assetTag: `AST-FUR-2025-${String(i).padStart(4, '0')}`,
      assetName: `${furnitureNames[Math.floor(Math.random() * furnitureNames.length)]} #${i}`,
      furnitureType: 'Wood',
      material: 'Wood/Steel',
      purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      purchasePrice: Math.floor(Math.random() * 50000) + 5000,
      companyId: [company1.id, company2.id][Math.floor(Math.random() * 2)],
      manufacturerId: mfg1.id,
      locationId: [loc1.id, loc2.id, loc3.id, loc4.id, loc5.id][Math.floor(Math.random() * 5)],
      condition: ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'REPAIR', 'REPAIR', 'DAMAGED'][Math.floor(Math.random() * 10)] as any,
      status: ['IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_STORE', 'IN_STORE', 'IN_STORE', 'DISPOSED'][Math.floor(Math.random() * 10)] as any,
      remarks: 'Additional furniture asset',
    });
  }
  await prisma.furnitureAsset.createMany({ data: furnitureData });
  console.log('✅ Furniture assets created (30 total)');

  // Create 40 Electronic Assets
  const electronicNames = ['Laptop', 'Desktop PC', 'Monitor', 'Printer', 'Scanner', 'Router', 'Switch', 'Projector'];
  const electronicData = [];
  for (let i = 1; i <= 40; i++) {
    electronicData.push({
      assetTag: `AST-ELE-2025-${String(i).padStart(4, '0')}`,
      assetName: `${electronicNames[Math.floor(Math.random() * electronicNames.length)]} #${i}`,
      deviceType: 'Computer Equipment',
      brand: ['Dell', 'HP', 'Apple', 'Lenovo', 'Asus'][Math.floor(Math.random() * 5)],
      model: `Model-${Math.floor(Math.random() * 1000)}`,
      serialNumber: `SN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      warrantyEndDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      companyId: [company1.id, company2.id][Math.floor(Math.random() * 2)],
      manufacturerId: [mfg2.id, mfg4.id][Math.floor(Math.random() * 2)],
      locationId: [loc1.id, loc2.id, loc3.id, loc4.id, loc5.id][Math.floor(Math.random() * 5)],
      condition: ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'REPAIR', 'REPAIR', 'DAMAGED'][Math.floor(Math.random() * 10)] as any,
      status: ['IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_STORE', 'IN_STORE', 'IN_STORE', 'DISPOSED'][Math.floor(Math.random() * 10)] as any,
      remarks: 'Additional electronic asset',
    });
  }
  await prisma.electronicAsset.createMany({ data: electronicData });
  console.log('✅ Electronic assets created (40 total)');

  // Create 30 Vehicle Assets
  const vehicleNames = ['Toyota Corolla', 'Honda Civic', 'Ford Focus', 'Suzuki Swift', 'Hyundai Elantra'];
  const vehicleData = [];
  for (let i = 1; i <= 30; i++) {
    vehicleData.push({
      assetTag: `AST-VEH-2025-${String(i).padStart(4, '0')}`,
      assetName: `${vehicleNames[Math.floor(Math.random() * vehicleNames.length)]} #${i}`,
      vehicleType: 'Car',
      brand: ['Toyota', 'Honda', 'Ford', 'Suzuki', 'Hyundai'][Math.floor(Math.random() * 5)],
      model: `2023-${Math.floor(Math.random() * 100)}`,
      registrationNumber: `REG-${String(i).padStart(4, '0')}`,
      engineNumber: `EN-${Math.random().toString(36).substring(7).toUpperCase()}`,
      chassisNumber: `CH-${Math.random().toString(36).substring(7).toUpperCase()}`,
      fuelType: ['Petrol', 'Diesel', 'Hybrid'][Math.floor(Math.random() * 3)],
      purchaseDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      purchasePrice: Math.floor(Math.random() * 5000000) + 1000000,
      companyId: [company1.id, company2.id][Math.floor(Math.random() * 2)],
      manufacturerId: mfg3.id,
      locationId: [loc1.id, loc2.id, loc3.id, loc4.id, loc5.id][Math.floor(Math.random() * 5)],
      condition: ['GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'REPAIR', 'REPAIR', 'DAMAGED'][Math.floor(Math.random() * 10)] as any,
      status: ['IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_USE', 'IN_STORE', 'IN_STORE', 'IN_STORE', 'DISPOSED'][Math.floor(Math.random() * 10)] as any,
      remarks: 'Additional vehicle asset',
    });
  }
  await prisma.vehicleAsset.createMany({ data: vehicleData });
  console.log('✅ Vehicle assets created (30 total)');

  // Get created vehicles for reference
  const vehicles = await prisma.vehicleAsset.findMany({ take: 5 });

  // Create sample maintenance records
  await prisma.maintenance.createMany({
    data: [
      {
        assetId: vehicles[0]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2024-11-01'),
        description: 'Regular oil change and filter replacement',
        cost: 5000,
        performedBy: 'Ahmed Auto Service',
        vendorName: 'Ahmed Auto Service',
        workType: 'Oil Change',
        paymentMethod: 'Bank Transfer',
        status: 'COMPLETED',
        odometerReading: 45000,
        nextDueDate: new Date('2025-05-01'),
        remarks: 'All checks passed, vehicle in excellent condition',
      },
      {
        assetId: vehicles[0]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2024-12-10'),
        description: 'Tire rotation and pressure check',
        cost: 2000,
        performedBy: 'Ali Tires Workshop',
        vendorName: 'Ali Tires Workshop',
        workType: 'Tire Change',
        paymentMethod: 'Cash',
        status: 'COMPLETED',
        odometerReading: 46500,
        remarks: 'Tires rotated and pressure adjusted to 32 PSI',
      },
      {
        assetId: vehicles[1]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2024-12-15'),
        description: 'Engine service and transmission fluid check',
        cost: 12000,
        performedBy: 'Professional Auto Care',
        vendorName: 'Professional Auto Care',
        workType: 'Engine Service',
        paymentMethod: 'Bank Transfer',
        status: 'COMPLETED',
        odometerReading: 32000,
        nextDueDate: new Date('2025-12-15'),
        remarks: 'Full engine diagnostics completed, transmission fluid replaced',
      },
      {
        assetId: vehicles[2]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2024-10-20'),
        description: 'Brake pads and rotors inspection',
        cost: 8500,
        performedBy: 'Brake Specialist Center',
        vendorName: 'Brake Specialist Center',
        workType: 'Brake Service',
        paymentMethod: 'Card',
        status: 'COMPLETED',
        odometerReading: 78000,
        remarks: 'Front pads replaced, rotors resurfaced, braking system excellent',
      },
      {
        assetId: vehicles[3]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2024-12-01'),
        description: 'Regular maintenance and safety inspection',
        cost: 3500,
        performedBy: 'Authorized Service Center',
        vendorName: 'Authorized Service Center',
        workType: 'Inspection',
        paymentMethod: 'Bank Transfer',
        status: 'COMPLETED',
        odometerReading: 125000,
        nextDueDate: new Date('2025-06-01'),
        remarks: 'All safety systems checked and certified',
      },
      {
        assetId: vehicles[1]?.id || '',
        assetType: 'VEHICLE',
        maintenanceDate: new Date('2025-01-15'),
        description: 'Battery replacement and electrical system check',
        cost: 6000,
        performedBy: 'Power Auto Electronics',
        vendorName: 'Power Auto Electronics',
        workType: 'Battery',
        paymentMethod: 'Cash',
        status: 'SCHEDULED',
        remarks: 'New heavy-duty battery installed, warranty 2 years',
      },
    ],
  });

  console.log('✅ Maintenance records created');

  // Create sample spare parts records
  await prisma.sparePart.createMany({
    data: [
      {
        partDate: new Date('2024-11-01'),
        partName: 'Engine Oil (Synthetic 10W-30)',
        quantity: 5,
        unitPrice: 800,
        totalCost: 4000,
        supplierName: 'Castrol Pakistan',
        vehicleId: vehicles[0]?.id || null,
        remarks: 'High-quality synthetic oil for extended service intervals',
      },
      {
        partDate: new Date('2024-11-15'),
        partName: 'Air Filter - Replacement',
        quantity: 2,
        unitPrice: 450,
        totalCost: 900,
        supplierName: 'Auto Parts Store',
        vehicleId: vehicles[0]?.id || null,
        remarks: 'OEM quality air filters for improved engine efficiency',
      },
      {
        partDate: new Date('2024-12-10'),
        partName: 'Brake Pads - Front Axle',
        quantity: 1,
        unitPrice: 3500,
        totalCost: 3500,
        supplierName: 'Brake Specialist Supplies',
        vehicleId: vehicles[2]?.id || null,
        remarks: 'Premium ceramic brake pads for superior braking performance',
      },
      {
        partDate: new Date('2024-12-15'),
        partName: 'Transmission Fluid (Dexron III)',
        quantity: 6,
        unitPrice: 1200,
        totalCost: 7200,
        supplierName: 'Mobil Oil Distributor',
        vehicleId: vehicles[1]?.id || null,
        remarks: 'Automatic transmission fluid - bulk purchase for fleet maintenance',
      },
      {
        partDate: new Date('2025-01-10'),
        partName: 'Car Battery 12V 150AH',
        quantity: 1,
        unitPrice: 6000,
        totalCost: 6000,
        supplierName: 'Interstate Battery',
        vehicleId: vehicles[1]?.id || null,
        remarks: 'Heavy-duty battery with 2-year warranty for commercial vehicles',
      },
    ],
  });

  console.log('✅ Spare parts records created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin: admin@company.com / admin123');
  console.log('  User:  manager@company.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
