import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbPath.replace(/\\/g, '/')}` }) });

async function main() {
  const company = await prisma.company.findFirst({ where: { companyName: 'NICL Building' } });
  if (!company) { console.log('Run seed-offices.ts first!'); return; }

  const getLoc = async (name: string, dept?: string) => {
    let loc = await prisma.location.findFirst({ where: { locationName: name } });
    if (!loc) loc = await prisma.location.create({ data: { locationName: name, building: 'NICL Building', roomType: 'Office', description: dept || '' } });
    return loc;
  };

  const add = async (tag: string, name: string, type: string, brand: string, locName: string) => {
    const exists = await prisma.electronicAsset.findFirst({ where: { assetTag: tag } });
    if (exists) return false;
    const loc = await getLoc(locName);
    await prisma.electronicAsset.create({
      data: { assetTag: tag, assetName: name, deviceType: type, brand, condition: 'GOOD', status: 'IN_USE', companyId: company.id, locationId: loc.id } as any,
    });
    return true;
  };

  let total = 0;

  // Vertical ACs - 10
  const verticals = [
    ['SEF/MD/Vertical AC-2.5 Ton/001/25-26', 'Vertical AC', 'AC', 'Gree', 'MD'],
    ['SEF/PSDU Hall/Vertical AC-2 Ton/005/25-26', 'Vertical AC', 'AC', 'Haier', 'PSDU Hall'],
    ['SEF/FR/FFM-Team/ AC-2 Ton/053/25-26', 'Vertical AC', 'AC', 'Haier', 'FR/FFM'],
    ['SEF/Meeting Hall 2/Vertical AC-2 Ton/049/25-26', 'Vertical AC', 'AC', 'Haier', 'Meeting Hall-2'],
    ['SEF/HR-Hall-A1 2/Vertical AC-2 Ton/050/25-26', 'Vertical AC', 'AC', 'Haier', 'HR Hall'],
    ['SEF/HR-Hall-A1 2/Vertical AC-2 Ton/051/25-26', 'Vertical AC', 'AC', 'Haier', 'HR Hall'],
    ['SEF/ServerRoom/Vertical AC-2 Ton/056/25-26', 'Vertical AC', 'AC', 'Haier', 'Server Room IT'],
    ['SEF/ServerRoom/Vertical AC-2 Ton/057/25-26', 'Vertical AC', 'AC', 'Haier', 'Server Room IT'],
    ['SEF/FA&A/ IC&C-Team/ Vertical AC-2Ton/058/25-26', 'Vertical AC', 'AC', 'Haier', 'FA&A IC/C'],
    ['SEF/HR-Hall-A2/Vertical AC-2 Ton/059/25-26', 'Vertical AC', 'AC', 'Haier', 'HR Hall-2'],
  ];

  // Split ACs - 51
  const splits = [
    ['SEF/MD/AC 002/25-26', 'Split AC', 'AC', 'Haier', 'MD'],
    ['SEF/MD-Secretariat/Ac-1.5 Ton/005/25-26', 'Split AC', 'AC', 'Haier', 'MD Secretariat'],
    ['SEF/Meeting Hall-1/AC-1.5 Ton/003/25-26', 'Split AC', 'AC', 'Haier', 'Meeting Hall-1'],
    ['SEF/Meeting Hall-1/AC-2 Ton/004/25-26', 'Split AC', 'AC', 'Mitsubishi', 'Meeting Hall-1'],
    ['SEF/PSDU Hall/AC-1.5 Ton/005/25-26', 'Split AC', 'AC', 'Mitsubishi', 'PSDU Hall'],
    ['SEF/Dir/P&P/AC-1.5 Ton/006/25-26', 'Split AC', 'AC', 'Haier', 'Dir. P&P'],
    ['SEF/Dir/T&A/AC-1.5 Ton/007/25-26', 'Split AC', 'AC', 'Haier', 'Dir. T&A'],
    ['SEF/Dy.Dir/PSDU/AC-1.5 Ton/008/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Director PSDU'],
    ['SEF/Dy.Dir/AC-1.5 Ton/009/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Director P&P'],
    ['SEF/Dy.Dir/AC-1.5 Ton/010/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Director P&P'],
    ['SEF/IT Room 1/AC-1 Ton/011/25-26', 'Split AC', 'AC', 'Haier', 'IT Room'],
    ['SEF/IT Room 1/AC-1.5 Ton/012/25-26', 'Split AC', 'AC', 'Daikin', 'IT Room'],
    ['SEF/AD-IT/AC-1 Ton/013/25-26', 'Split AC', 'AC', 'Acson', 'AD-IT'],
    ['SEF/Dy.Dir/AC-1 Ton/014/25-26', 'Split AC', 'AC', 'Acson', 'Dy. Dir. North'],
    ['SEF/Dy.Dir/ACU/AC-1.5 Ton/015/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Director ACU'],
    ['SEF/Dy.Dir/C&L/AC-1 Ton/016/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Dir. C&L'],
    ['SEF/SO\'s/Lark/Hyd/AC-1.5 Ton/017/25-26', 'Split AC', 'AC', 'Haier', 'S.O Room'],
    ['SEF/SO-AALTP/AC-1.5 Ton/018/25-26', 'Split AC', 'AC', 'Haier', 'S.O Room'],
    ['SEF/AALTP-Team/AC-1.5 Ton/019/25-26', 'Split AC', 'AC', 'Haier', 'AALTP Team'],
    ['SEF/SMU Team/AC-1.5 Ton/020/25-26', 'Split AC', 'AC', 'Haier', 'SMU'],
    ['SEF/Prayer Room/AC-1.5 Ton/021/25-26', 'Split AC', 'AC', 'Haier', 'Prayer Room'],
    ['SEF/CIA/AC-1.5 Ton/022/25-26', 'Split AC', 'AC', 'Haier', 'CIA'],
    ['SEF/DMD-Ops/AC-1.5 Ton/023/25-26', 'Split AC', 'AC', 'Haier', 'DMD Ops'],
    ['SEF/Dir-HR/AC-1.5 Ton/024/25-26', 'Split AC', 'AC', 'Haier', 'Dir. HR'],
    ['SEF/Dy.Dir-GA&CD/AC-1.5 Ton/025/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Dir. GA&C'],
    ['SEF/AD,PRO/AC-1.5 Ton/026/25-26', 'Split AC', 'AC', 'Haier', 'AD PRO'],
    ['SEF/PS-DMD-SS/AC-1.5 Ton/027/25-26', 'Split AC', 'AC', 'Haier', 'DMD SS'],
    ['SEF/Proc-Team/AC-1.5 Ton/028/25-26', 'Split AC', 'AC', 'Haier', 'Procurement Team'],
    ['SEF/Dy. Dir-Proc/AC-1.5 Ton/029/25-26', 'Split AC', 'AC', 'Haier', 'DD Procurement'],
    ['SEF/GA&CD Team/AC-1.5 Ton/030/25-26', 'Split AC', 'AC', 'Haier', 'Team GA&C'],
    ['SEF/AD-HR/AC-1.5 Ton/031/25-26', 'Split AC', 'AC', 'Haier', 'AD HR'],
    ['SEF/C&L Team/AC-1.5 Ton/032/25-26', 'Split AC', 'AC', 'Haier', 'C&L Team'],
    ['SEF/SO-MPK Team/AC-1.5 Ton/033/25-26', 'Split AC', 'AC', 'Haier', 'S.O Room'],
    ['SEF/SO-North/AC-1.5 Ton/034/25-26', 'Split AC', 'AC', 'Haier', 'S.O Room'],
    ['SEF/SO-SMU/AC-1.5 Ton/035/25-26', 'Split AC', 'AC', 'Haier', 'SO SMU'],
    ['SEF/AD-IC/C/AC-1.5 Ton/036/25-26', 'Split AC', 'AC', 'Haier', 'AD ICC'],
    ['SEF/AD-GA&CDAC-1.5 Ton/037/25-26', 'Split AC', 'AC', 'Haier', 'AD GA&C'],
    ['SEF/GA&CD-Team/AC-1.5 Ton/038/25-26', 'Split AC', 'AC', 'Haier', 'GA&C Team'],
    ['SEF/Proc-Team/AC-1.5 Ton/039/25-26', 'Split AC', 'AC', 'Haier', 'Procurement Team'],
    ['SEF/Proc-Team/AC-1.5 Ton/040/25-26', 'Split AC', 'AC', 'Haier', 'Procurement Team'],
    ['SEF/Dy.Dir-HR/AC-1.5 Ton/041/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Dir. HR'],
    ['SEF/AD-Fin/AC-1.5 Ton/042/25-26', 'Split AC', 'AC', 'Haier', 'AD Finance'],
    ['SEF/Dy.Dir-Fin/AC-1.5 Ton/043/25-26', 'Split AC', 'AC', 'Haier', 'Dy. Dir. FA&A'],
    ['SEF/IT-Room 2/AC-1.5 Ton/044/25-26', 'Split AC', 'AC', 'Haier', 'IT Room'],
    ['SEF/Dy.Dir-Region/AC-1.5 Ton/045/25-26', 'Split AC', 'AC', 'Pel Inverter', 'Dy. Dir Region'],
    ['SEF/Dir-Fin/AC-1.5 Ton/046/25-26', 'Split AC', 'AC', 'Haier', 'Dir. Finance'],
    ['SEF/PS-DMD-Ops/AC-1.5 Ton/047/25-26', 'Split AC', 'AC', 'Haier', 'PS to DMD Ops'],
    ['SEF/Photocopy Area/AC-1.5 Ton/048/25-26', 'Split AC', 'AC', 'Haier', 'Photocopy Area'],
    ['SEF/FR/FFM/-Team/ AC-1.5Ton/052/25-26', 'Split AC', 'AC', 'Haier', 'FR/FFM Team'],
    ['SEF/FR/FFM-Team/ AC-1.5Ton/053/25-26', 'Split AC', 'AC', 'Haier', 'FR/FFM Team'],
    ['SEF/Reception Area/ AC-1.5Ton/054/25-26', 'Split AC', 'AC', 'Haier', 'Reception'],
  ];

  // Microwave Ovens - 11
  const microwaves = [
    ['SEF/MW/HR/001/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'HR'],
    ['SEF/MW/Finance/002/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'Finance'],
    ['SEF/MW/Finance/003/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'Finance'],
    ['SEF/MW/SMU/004/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'SMU Sr. Officer'],
    ['SEF/MW/Kitchen/005/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'Kitchen Open Area'],
    ['SEF/MW/Kitchen/006/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'Kitchen'],
    ['SEF/MW/Kitchen/007/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'Kitchen'],
    ['SEF/MW/T&A/008/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'T&A'],
    ['SEF/MW/MD-Sec/009/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'MD Secretariat'],
    ['SEF/MW/MD-Sec/010/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'MD Secretariat'],
    ['SEF/MW/PSDU/011/25-26', 'Microwave Oven', 'Microwave', 'Dawlance', 'PSDU Team'],
  ];

  // Other electronics
  const others = [
    ['SEF/Ref/GA&C/001/25-26', 'Refrigerator', 'Refrigerator', 'Dawlance', 'GA&C Kitchen'],
    ...Array.from({length:14}, (_,i) => [`SEF/Fan/Pedestal/${String(i+1).padStart(3,'0')}/25-26`, 'Pedestal Fan', 'Fan', 'Generic', `Building Fan Area`] as [string,string,string,string,string]),
    ...Array.from({length:6}, (_,i) => [`SEF/Fan/Bracket/${String(i+1).padStart(3,'0')}/25-26`, 'Bracket Fan', 'Fan', 'Generic', `Building Fan Area`] as [string,string,string,string,string]),
    ...Array.from({length:11}, (_,i) => [`SEF/Kettle/${String(i+1).padStart(3,'0')}/25-26`, 'Electric Kettle', 'Kettle', 'Generic', 'Kitchen'] as [string,string,string,string,string]),
    ...Array.from({length:2}, (_,i) => [`SEF/Air Cutter/${String(i+1).padStart(3,'0')}/25-26`, 'Air Cutter', 'Air Cutter', 'Generic', 'Building'] as [string,string,string,string,string]),
    ...Array.from({length:9}, (_,i) => [`SEF/Dispenser/${String(i+1).padStart(3,'0')}/25-26`, 'Water Dispenser', 'Water Dispenser', 'Generic', 'Building'] as [string,string,string,string,string]),
  ];

  const allItems = [...verticals, ...splits, ...microwaves, ...others];

  console.log(`Seeding ${allItems.length} electronic assets...\n`);

  for (const [tag, name, type, brand, locName] of allItems) {
    if (await add(tag, name, type, brand, locName)) total++;
  }

  console.log(`\nDone! ${total} electronic assets added.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());