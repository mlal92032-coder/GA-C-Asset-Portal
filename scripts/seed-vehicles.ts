import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbPath.replace(/\\/g, '/')}` }) });

const vehicles = [
  ['Toyota Corolla', 'GSE-922', '1299cc', '2019', 'NICL Building'],
  ['Suzuki Cultus', 'GSG-133', '998CC', '2024', 'NICL Building'],
  ['Toyota Corolla', 'GSE-851', '1598cc', '2018', 'NICL Building'],
  ['Toyota Corolla', 'GSB-163', '1299CC', '2012', 'NICL Building'],
  ['Suzuki Swift', 'GSE-727', '1328cc', '2018', 'NICL Building'],
  ['New Wagon-R', 'GSF-935', '998CC', '2023', 'NICL Building'],
  ['Toyota Corolla', 'GSD-122', '1299cc', '2016', 'NICL Building'],
  ['New Wagon-R', 'GSF-934', '998CC', '2023', 'NICL Building'],
  ['Suzuki Swift', 'GSE-723', '1328cc', '2018', 'NICL Building'],
  ['Kia Picanto Automatic', 'GSG-098', '998CC', '2024', 'NICL Building'],
  ['Honda City', 'GSD-124', '1300cc', '2016', 'NICL Building'],
  ['Toyota Corolla', 'GSC-567', '1299cc', '2015', 'NICL Building'],
  ['Kia Picanto Automatic', 'GSG-101', '998CC', '2024', 'NICL Building'],
  ['Hundayi Truck', 'GSG-127', '2607CC', '2024', 'NICL Building'],
  ['Honda City', 'GSB-162', '1300cc', '2013', 'NICL Building'],
  ['Suzuki APV', 'GSE-861', '1493cc', '2018', 'NICL Building'],
  ['Suzuki APV', 'GSE-860', '1493cc', '2018', 'NICL Building'],
  ['Toyota Hiace', 'GS-7835', '2986cc', '2009', 'NICL Building'],
  ['Toyota Hiace (School Van)', 'GSE-896', '2500cc', '2018', 'NICL Building'],
  ['Hino Truck (Loading)', 'GSC-518', '4009cc', '2015', 'NICL Building'],
  ['Hino Truck (Loading)', 'GSE-852', '4009cc', '2018', 'NICL Building'],
  ['Master Foton', 'EJ-189', '2800cc', '2015', 'NICL Building'],
  ['Master Foton', 'EJ-188', '2800cc', '2015', 'NICL Building'],
  ['Suzuki Swift', 'GSE-729', '1328cc', '2018', 'NICL Building'],
  ['Suzuki Wagon-R', 'GSF-936', '998CC', '2023', 'NICL Building'],
  ['Honda City', 'AYF-375', '1300cc', '2012', 'NICL Building'],
  ['Suzuki Cultus', 'GSD-109', '993cc', '2016', 'NICL Building'],
  ['Suzuki Cultus', 'GSD-340', '993cc', '2016', 'NICL Building'],
  ['Suzuki Bolan', 'GSB-161', '799cc', '2013', 'NICL Building'],
  ['Suzuki Bolan', 'GSC-569', '799cc', '2015', 'NICL Building'],
  ['Suzuki Bolan', 'GSB-159', '799cc', '2013', 'NICL Building'],
  ['Toyota Hiace (New Van)', 'GSE-824', '2446cc', '2018', 'YPDC Office'],
  ['New Wagon-R', 'GSF-932', '998cc', '2023', 'YPDC Office'],
  ['Toyota Hiace', 'GS-7836', '2986cc', '2009', 'Regional Office Karachi'],
  ['Suzuki APV', 'GSE-859', '1576cc', '2018', 'Regional Office Karachi'],
];

async function main() {
  let total = 0;
  for (const [model, reg, engine, year, office] of vehicles) {
    const tag = `SEF/Vehicle/${reg}/${year}`;
    const exists = await prisma.vehicleAsset.findFirst({ where: { assetTag: tag } });
    if (exists) { console.log(`  ⏭  ${reg} (exists)`); continue; }

    let company = await prisma.company.findFirst({ where: { companyName: office } });
    if (!company) company = await prisma.company.create({ data: { companyName: office, address: office } });

    const locName = office === 'YPDC Office' ? 'YPDC Office' : office === 'Regional Office Karachi' ? 'Regional Office Karachi' : 'NICL Building Parking';
    let loc = await prisma.location.findFirst({ where: { locationName: locName } });
    if (!loc) loc = await prisma.location.create({ data: { locationName: locName, building: office, roomType: 'Parking' } });

    await prisma.vehicleAsset.create({
      data: {
        assetTag: tag, assetName: `${model} (${reg})`, vehicleType: model.includes('Truck') ? 'Truck' : model.includes('Van') || model.includes('Hiace') || model.includes('APV') || model.includes('Bolan') ? 'Van' : 'Car',
        brand: model.split(' ')[0], model, registrationNumber: reg, engineNumber: engine, fuelType: 'Petrol',
        condition: 'GOOD', status: 'IN_USE', companyId: company.id, locationId: loc.id,
      } as any,
    });
    console.log(`  ✓  ${model} - ${reg} (${year})`);
    total++;
  }
  console.log(`\nDone! ${total} vehicles added.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());