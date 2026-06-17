import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });

interface AssetEntry { tag: string; name: string; type: string; }

const rooms: { room: string; department: string; items: AssetEntry[] }[] = [
  {
    room: 'MH-1', department: 'Meeting Hall-1',
    items: [
      ...Array.from({ length: 17 }, (_, i) => ({ tag: `SEF/Meeting Hall-1/Special Chair/${String(i + 7).padStart(3, '0')}/25-26`, name: 'Executive Chair', type: 'Chair' })),
      ...['SEF/MD-Secretariat/Special Chair/004/25-26', 'SEF/MD-Secretariat/Special Chair/005/25-26', 'SEF/MD-Secretariat/Special Chair/006/25-26'].map(t => ({ tag: t, name: 'Executive Chair', type: 'Chair' })),
    ]
  },
  {
    room: 'R-2 (Wing-1)', department: 'Director P&P',
    items: [
      ...Array.from({ length: 7 }, (_, i) => ({ tag: `SEF/Dir/P&P/Special Chair/${String(i + 21).padStart(3, '0')}/25-26`, name: 'Executive Chair', type: 'Chair' })),
      { tag: 'SEF/Dir/P&P/Table/007/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/Dir/P&P/Table/008/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/Dir/P&P/Side drawer/01/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/Dir/P&P/side Cabinet/02/25-26', name: 'Side Cabinet', type: 'Cabinet' },
    ]
  },
  {
    room: 'R-3 (Wing-1)', department: 'Director T&A',
    items: [
      { tag: 'SEF/Dir/T&A/Special Chair/28/25-26', name: 'Executive Chair', type: 'Chair' },
      { tag: 'SEF/Dir/T&A/Chair/01/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/Dir/T&A/Chair/02/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/Dir/T&A/Table/09/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/Dir/T&A/Table/10/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/Dir/T&A/SC/03/25-26', name: 'Side Cabinet', type: 'Cabinet' },
      { tag: 'SEF/Dir/T&A/SC/04/25-26', name: 'Side Cabinet', type: 'Cabinet' },
      { tag: 'SEF/Dir/T&A/Sofa/04/25-26', name: 'Sofa', type: 'Sofa' },
      { tag: 'SEF/Dir/T&A/Sofa/05/25-26', name: 'Sofa', type: 'Sofa' },
      { tag: 'SEF/Dir/T&A/Sofa/06/25-26', name: 'Sofa', type: 'Sofa' },
      { tag: 'SEF/Dir/T&A/Sofa/07/25-26', name: 'Sofa', type: 'Sofa' },
    ]
  },
  {
    room: 'H-1', department: 'T&A TEAM',
    items: [
      { tag: 'SEF/T&A/Team/Special Chair/29/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 7 }, (_, i) => ({ tag: `SEF/T&A/Team/Chair/${String(i + 3).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/T&A/Team/WS/${String(i + 1).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 5 }, (_, i) => ({ tag: `SEF/T&A/Team/SD/${String(i + 2).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 7 }, (_, i) => ({ tag: `SEF/T&A/Team/SC/${String(i + 5).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
    ]
  },
  {
    room: 'H-2', department: 'RPU Team',
    items: [
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/RPU/Team/Chair/${String(i + 10).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/RPU/Team/WS/${String(i + 5).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/RPU/Team/SD/${String(i + 7).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/RPU/Team/SC/${String(i + 12).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
    ]
  },
  {
    room: 'H-2', department: 'ACU Team',
    items: [
      ...Array.from({ length: 7 }, (_, i) => ({ tag: `SEF/ACU/Team/Chair/${String(i + 16).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/ACU/Team/Table/11/25-26', name: 'Table', type: 'Table' },
      ...Array.from({ length: 8 }, (_, i) => ({ tag: `SEF/ACU/Team/WS/${String(i + 11).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/ACU/Team/SD/${String(i + 13).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 2 }, (_, i) => ({ tag: `SEF/ACU/Team/SC/${String(i + 15).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
    ]
  },
  {
    room: 'H-3', department: 'MD-Secretariat Staff Officer',
    items: [
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/MD-Secretariat/SO/Special Chair/${String(i + 30).padStart(2, '0')}/25-26`, name: 'Executive Chair', type: 'Chair' })),
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/MD-Secretariat/SO/Chair/${String(i + 23).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/MD-Secretariat/SO/Table/${String(i + 12).padStart(2, '0')}/25-26`, name: 'Table', type: 'Table' })),
      { tag: 'SEF/MD-Secretariat/SO/SD/19/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/MD-Secretariat/SO/SC/17/25-26', name: 'Side Cabinet', type: 'Cabinet' },
    ]
  },
  {
    room: 'H-4', department: 'AASP Team',
    items: [
      { tag: 'SEF/AASP/Team/Chair/26/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/AASP/Team/Chair/27/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/AASP/Team/Table/15/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/AASP/Team/Table/16/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/AASP/Team/SD/20/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/AASP/Team/SD/21/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/AASP/Team/SC/18/25-26', name: 'Side Cabinet', type: 'Cabinet' },
      { tag: 'SEF/AASP/Team/SC/19/25-26', name: 'Side Cabinet', type: 'Cabinet' },
    ]
  },
  {
    room: 'H-5', department: 'PSDU/P&P Team',
    items: [
      ...Array.from({ length: 13 }, (_, i) => ({ tag: `SEF/PSDU/Team/Chair/${String(i + 28).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/PSDU/Team/Table/17/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/PSDU/Team/Table/18/25-26', name: 'Table', type: 'Table' },
      ...Array.from({ length: 8 }, (_, i) => ({ tag: `SEF/PSDU/Team/WS/${String(i + 19).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 8 }, (_, i) => ({ tag: `SEF/PSDU/Team/SD/${String(i + 22).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 8 }, (_, i) => ({ tag: `SEF/PSDU/Team/SC/${String(i + 20).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
      { tag: 'SEF/PSDU/Team/FD/01/25-26', name: 'File Drawer', type: 'Drawer' },
      ...['SEF/P&P/Team/Chair/39/25-26', 'SEF/P&P/Team/Chair/40/25-26'].map(t => ({ tag: t, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/P&P/Team/WS/26/25-26', name: 'Work Station', type: 'Workstation' },
    ]
  },
  {
    room: 'H-6', department: 'Program & Planning Team',
    items: [
      { tag: 'SEF/P&P/Team/Special Chair/34/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 17 }, (_, i) => ({ tag: `SEF/P&P/Team/Chair/${String(i + 41).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      ...Array.from({ length: 16 }, (_, i) => ({ tag: `SEF/P&P/Team/WS/${String(i + 27).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 17 }, (_, i) => ({ tag: `SEF/P&P/Team/SD/${String(i + 30).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 6 }, (_, i) => ({ tag: `SEF/P&P/Team/SC/${String(i + 28).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
      { tag: 'SEF/P&P/Team/FD/02/25-26', name: 'File Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-4', department: 'Board Sec/PSDU/Deputy Director',
    items: [
      { tag: 'SEF/PSDU/DD/Special Chair/35/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/PSDU/DD/Chair/${String(i + 58).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/PSDU/DD/Table/19/25-26', name: 'Table', type: 'Table' },
    ]
  },
  {
    room: 'R-5', department: 'Acting Deputy Director Central',
    items: [
      { tag: 'SEF/P&P Central/DD/Special Chair/36/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/P&P Central/DD/Chair/${String(i + 61).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/P&P Central/DD/Table/20/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/P&P Central/DD/SD/48/25-26', name: 'Side Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-6', department: 'Acting Deputy Director North',
    items: [
      { tag: 'SEF/P&P North/DD/Special Chair/37/25-26', name: 'Executive Chair', type: 'Chair' },
      { tag: 'SEF/P&P North/DD/Chair/64/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/P&P North/DD/Chair/65/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/P&P North/DD/Table/21/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/P&P North/DD/SD/49/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/P&P North/DD/SC/34/25-26', name: 'Side Cabinet', type: 'Cabinet' },
    ]
  },
  {
    room: 'R-7', department: 'IT Server Room',
    items: [
      { tag: 'SEF/IT/Team/Special Chair/38/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/IT/Team/Chair/${String(i + 66).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/IT/Team/Table/22/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/IT/Team/Table/23/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/IT/Team/SD/50/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/IT/Team/SC/35/25-26', name: 'Side Cabinet', type: 'Cabinet' },
    ]
  },
  {
    room: 'R-8', department: 'Assistant Director IT',
    items: [
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/IT/AD/Special Chair/${String(i + 39).padStart(2, '0')}/25-26`, name: 'Special Chair', type: 'Chair' })),
      { tag: 'SEF/IT/AD/Table/24/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/IT/AD/SD/51/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/IT/AD/Sofa/08/25-26', name: 'Sofa', type: 'Sofa' },
    ]
  },
  {
    room: 'R-9', department: 'Acting Deputy Director South',
    items: [
      { tag: 'SEF/P&P South/DD/Chair/69/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/P&P South/DD/Table/25/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/P&P South/DD/Table/26/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/P&P South/DD/SD/52/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/P&P South/DD/SD/53/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/P&P South/DD/Sofa/09/25-26', name: 'Sofa', type: 'Sofa' },
      { tag: 'SEF/P&P South/DD/Sofa/10/25-26', name: 'Sofa', type: 'Sofa' },
    ]
  },
  {
    room: 'H-7', department: 'Reception Area',
    items: [
      { tag: 'SEF/GA&C/Reception/Chair/70/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/GA&C/Reception/Chair/71/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/GA&C/Reception/Table/27/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/GA&C/Reception/Table/28/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/GA&C/Reception/SD/54/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/GA&C/Reception/SD/55/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/GA&C/Reception/Sofa/11/25-26', name: 'Sofa', type: 'Sofa' },
      { tag: 'SEF/GA&C/Reception/Sofa/12/25-26', name: 'Sofa', type: 'Sofa' },
    ]
  },
  {
    room: 'R-10', department: 'Deputy Director ACU',
    items: [
      { tag: 'SEF/ACU/DD/Special Chair/42/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/ACU/DD/Chair/${String(i + 72).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/ACU/DD/Table/29/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/ACU/DD/Table/30/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/ACU/DD/SD/56/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/ACU/DD/SD/57/25-26', name: 'Side Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-11', department: 'Acting Deputy Director C&L',
    items: [
      { tag: 'SEF/C&L/DD/Special Chair/54/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/C&L/DD/Chair/${String(i + 135).padStart(3, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/C&L/DD/WS/76/25-26', name: 'Work Station', type: 'Workstation' },
      { tag: 'SEF/C&L/DD/WS/77/25-26', name: 'Work Station', type: 'Workstation' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/C&L/DD/SD/${String(i + 123).padStart(3, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
    ]
  },
  {
    room: 'R-12', department: 'Senior Officers Larkana & Hyderabad',
    items: [
      { tag: 'SEF/P&P/SO/Special Chair/55/25-26', name: 'Executive Chair', type: 'Chair' },
      { tag: 'SEF/P&P/SO/Chair/138/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/P&P/SO/Chair/139/25-26', name: 'Office Chair', type: 'Chair' },
      { tag: 'SEF/P&P/SO/WS/78/25-26', name: 'Work Station', type: 'Workstation' },
      { tag: 'SEF/P&P/SO/WS/79/25-26', name: 'Work Station', type: 'Workstation' },
      { tag: 'SEF/P&P/SO/SD/126/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/P&P/SO/SD/127/25-26', name: 'Side Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-13', department: 'T&A & TFC Team Temporary',
    items: [
      ...Array.from({ length: 5 }, (_, i) => ({ tag: `SEF/TFC/SO/Chair/${String(i + 76).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/TFC/SO/Table/31/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/TFC/SO/Table/32/25-26', name: 'Table', type: 'Table' },
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/TFC/DD/SO/${String(i + 58).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      { tag: 'SEF/TFC/SO/SC/36/25-26', name: 'Side Cabinet', type: 'Cabinet' },
      { tag: 'SEF/TFC/SO/FD/03/25-26', name: 'File Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-14', department: 'Senior Officer AALTP',
    items: [
      { tag: 'SEF/AALTP/SO/Special Chair/43/25-26', name: 'Executive Chair', type: 'Chair' },
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/AALTP/SO/Chair/${String(i + 81).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      { tag: 'SEF/AALTP/SO/Table/33/25-26', name: 'Table', type: 'Table' },
      { tag: 'SEF/AALTP/SO/SD/61/25-26', name: 'Side Drawer', type: 'Drawer' },
      { tag: 'SEF/AALTP/SO/SD/62/25-26', name: 'Side Drawer', type: 'Drawer' },
    ]
  },
  {
    room: 'R-15', department: 'AALTP Team',
    items: [
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/AALTP/Team/Chair/${String(i + 85).padStart(2, '0')}/25-26`, name: 'Office Chair', type: 'Chair' })),
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/AALTP/Team/WS/${String(i + 43).padStart(2, '0')}/25-26`, name: 'Work Station', type: 'Workstation' })),
      ...Array.from({ length: 3 }, (_, i) => ({ tag: `SEF/AALTP/Team/SD/${String(i + 63).padStart(2, '0')}/25-26`, name: 'Side Drawer', type: 'Drawer' })),
      ...Array.from({ length: 4 }, (_, i) => ({ tag: `SEF/AALTP/Team/SC/${String(i + 37).padStart(2, '0')}/25-26`, name: 'Side Cabinet', type: 'Cabinet' })),
    ]
  },
];

async function main() {
  const company = await prisma.company.findFirst({ where: { companyName: 'NICL Building' } });
  if (!company) { console.log('Run seed-offices.ts first!'); return; }

  let total = 0;

  for (const room of rooms) {
    // Create location
    let loc = await prisma.location.findFirst({ where: { locationName: room.room } });
    if (!loc) {
      loc = await prisma.location.create({
        data: { locationName: room.room, building: 'NICL Building', roomType: 'Office', description: room.department }
      });
    }

    for (const item of room.items) {
      const exists = await prisma.furnitureAsset.findFirst({ where: { assetTag: item.tag } });
      if (exists) continue;
      await prisma.furnitureAsset.create({
        data: {
          assetTag: item.tag,
          assetName: item.name,
          furnitureType: item.type,
          condition: 'GOOD',
          status: 'IN_USE',
          companyId: company.id,
          locationId: loc.id,
        } as any,
      });
      total++;
    }
    console.log(`  ✓ ${room.room} (${room.department}) - ${room.items.length} items`);
  }

  console.log(`\nDone! ${total} furniture assets added.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());