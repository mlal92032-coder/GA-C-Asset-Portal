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

  console.log('✅ Furniture assets created');

  // Create Electronic Assets
  await prisma.electronicAsset.createMany({
    data: [
      {
        assetTag: 'AST-ELE-2025-0001',
        assetName: 'MacBook Pro 16"',
        deviceType: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro M3 Max',
        serialNumber: 'SN-APPLE-001',
        purchaseDate: new Date('2024-01-15'),
        warrantyEndDate: new Date('2027-01-15'),
        companyId: company1.id,
        manufacturerId: mfg4.id,
        locationId: loc2.id,
        assignedUserId: admin.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-ELE-2025-0002',
        assetName: 'Dell Monitor 27"',
        deviceType: 'Monitor',
        brand: 'Dell',
        model: 'UltraSharp U2723QE',
        serialNumber: 'SN-DELL-MON-001',
        purchaseDate: new Date('2024-02-01'),
        warrantyEndDate: new Date('2027-02-01'),
        companyId: company1.id,
        manufacturerId: mfg2.id,
        locationId: loc2.id,
        assignedUserId: employee1.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-ELE-2025-0003',
        assetName: 'Dell Desktop Workstation',
        deviceType: 'Desktop',
        brand: 'Dell',
        model: 'Precision 7780',
        serialNumber: 'SN-DELL-WS-001',
        purchaseDate: new Date('2023-08-20'),
        warrantyEndDate: new Date('2026-08-20'),
        companyId: company1.id,
        manufacturerId: mfg2.id,
        locationId: loc2.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastMaintenanceDate: new Date('2024-11-15'),
      },
      {
        assetTag: 'AST-ELE-2025-0004',
        assetName: 'Network Switch (48-port)',
        deviceType: 'Networking',
        brand: 'Cisco',
        model: 'Catalyst 9300',
        serialNumber: 'SN-CISCO-SW-001',
        purchaseDate: new Date('2023-05-10'),
        warrantyEndDate: new Date('2025-05-10'),
        companyId: company1.id,
        manufacturerId: mfg2.id,
        locationId: loc1.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastMaintenanceDate: new Date('2024-12-01'),
      },
      {
        assetTag: 'AST-ELE-2025-0005',
        assetName: 'HP LaserJet Printer',
        deviceType: 'Printer',
        brand: 'HP',
        model: 'LaserJet Pro M404dn',
        serialNumber: 'SN-HP-PRT-001',
        purchaseDate: new Date('2023-07-15'),
        warrantyEndDate: new Date('2025-07-15'),
        companyId: company2.id,
        manufacturerId: mfg2.id,
        locationId: loc5.id,
        condition: 'REPAIR',
        status: 'IN_USE',
        remarks: 'Toner cartridge replacement needed',
      },
      {
        assetTag: 'AST-ELE-2025-0006',
        assetName: 'iPad Pro 12.9"',
        deviceType: 'Tablet',
        brand: 'Apple',
        model: 'iPad Pro M2',
        serialNumber: 'SN-APPLE-IPAD-001',
        purchaseDate: new Date('2024-03-01'),
        warrantyEndDate: new Date('2025-03-01'),
        companyId: company1.id,
        manufacturerId: mfg4.id,
        locationId: loc3.id,
        assignedUserId: employee2.id,
        condition: 'GOOD',
        status: 'IN_USE',
      },
      {
        assetTag: 'AST-ELE-2025-0007',
        assetName: 'Projector (Conference Room)',
        deviceType: 'Projector',
        brand: 'Epson',
        model: 'PowerLite 2250U',
        serialNumber: 'SN-EPSON-PROJ-001',
        purchaseDate: new Date('2023-02-20'),
        warrantyEndDate: new Date('2026-02-20'),
        companyId: company1.id,
        manufacturerId: mfg2.id,
        locationId: loc3.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastMaintenanceDate: new Date('2024-10-15'),
      },
      {
        assetTag: 'AST-ELE-2025-0008',
        assetName: 'Old Desktop PC',
        deviceType: 'Desktop',
        brand: 'Dell',
        model: 'OptiPlex 7070',
        serialNumber: 'SN-DELL-OLD-001',
        purchaseDate: new Date('2020-01-10'),
        warrantyEndDate: new Date('2023-01-10'),
        companyId: company1.id,
        manufacturerId: mfg2.id,
        locationId: loc4.id,
        condition: 'DAMAGED',
        status: 'DISPOSED',
        remarks: 'Motherboard failure, not economical to repair',
      },
    ],
  });

  console.log('✅ Electronic assets created');

  // Create Vehicle Assets
  await prisma.vehicleAsset.createMany({
    data: [
      {
        assetTag: 'AST-VEH-2025-0001',
        assetName: 'Executive Sedan',
        vehicleType: 'Sedan',
        brand: 'Toyota',
        model: 'Camry Hybrid 2024',
        registrationNumber: 'REG-EXEC-001',
        engineNumber: 'ENG-CAM-2024-001',
        fuelType: 'Hybrid',
        purchaseDate: new Date('2024-01-01'),
        companyId: company1.id,
        manufacturerId: mfg3.id,
        locationId: loc1.id,
        assignedUserId: manager.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastServiceDate: new Date('2024-11-01'),
        insuranceExpiryDate: new Date('2025-12-31'),
      },
      {
        assetTag: 'AST-VEH-2025-0002',
        assetName: 'Delivery Van',
        vehicleType: 'Van',
        brand: 'Toyota',
        model: 'HiAce 2023',
        registrationNumber: 'REG-DEL-002',
        engineNumber: 'ENG-HIA-2023-001',
        fuelType: 'Diesel',
        purchaseDate: new Date('2023-06-15'),
        companyId: company2.id,
        manufacturerId: mfg3.id,
        locationId: loc4.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastServiceDate: new Date('2024-12-15'),
        insuranceExpiryDate: new Date('2025-06-15'),
      },
      {
        assetTag: 'AST-VEH-2025-0003',
        assetName: 'Field Service Truck',
        vehicleType: 'Truck',
        brand: 'Toyota',
        model: 'Hilux 2023',
        registrationNumber: 'REG-FLD-003',
        engineNumber: 'ENG-HIL-2023-001',
        fuelType: 'Diesel',
        purchaseDate: new Date('2023-04-10'),
        companyId: company1.id,
        manufacturerId: mfg3.id,
        locationId: loc1.id,
        condition: 'REPAIR',
        status: 'IN_USE',
        remarks: 'Brake pads replacement scheduled',
        lastServiceDate: new Date('2024-10-20'),
        insuranceExpiryDate: new Date('2025-04-10'),
      },
      {
        assetTag: 'AST-VEH-2025-0004',
        assetName: 'Office Shuttle Bus',
        vehicleType: 'Bus',
        brand: 'Toyota',
        model: 'Coaster 2022',
        registrationNumber: 'REG-SHT-004',
        engineNumber: 'ENG-COA-2022-001',
        fuelType: 'Diesel',
        purchaseDate: new Date('2022-08-20'),
        companyId: company1.id,
        manufacturerId: mfg3.id,
        locationId: loc1.id,
        condition: 'GOOD',
        status: 'IN_USE',
        lastServiceDate: new Date('2024-12-01'),
        insuranceExpiryDate: new Date('2025-08-20'),
      },
      {
        assetTag: 'AST-VEH-2025-0005',
        assetName: 'Old Company Car',
        vehicleType: 'Sedan',
        brand: 'Toyota',
        model: 'Corolla 2018',
        registrationNumber: 'REG-OLD-005',
        engineNumber: 'ENG-COR-2018-001',
        fuelType: 'Petrol',
        purchaseDate: new Date('2018-03-15'),
        companyId: company2.id,
        manufacturerId: mfg3.id,
        locationId: loc4.id,
        condition: 'DAMAGED',
        status: 'DISPOSED',
        remarks: 'Engine replacement needed, written off',
        insuranceExpiryDate: new Date('2024-03-15'),
      },
    ],
  });

  console.log('✅ Vehicle assets created');

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
