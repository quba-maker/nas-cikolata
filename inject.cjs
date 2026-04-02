const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/data/seedData.ts');
let code = fs.readFileSync(file, 'utf8');

const baseSakayik = `  {
    id: 'mock_sakayik_ID',
    type: 'buket',
    categoryId: 'cat1',
    subCategoryId: 'SUB_CAT',
    name: 'Şakayık Model ID',
    description: 'Klasik şakayık aranjmanı',
    price: 850,
    cost: 400,
    imageUrl: PHOTOS.buket_sakayik,
    gallery: [],
    badge: null,
    sortOrder: ID,
    isActive: true,
    bouquetKind: 'TYPE',
    subType: 'sakayik',
  },`;

const baseGul = `  {
    id: 'mock_gul_ID',
    type: 'buket',
    categoryId: 'cat1',
    subCategoryId: 'SUB_CAT',
    name: 'Gül Model ID',
    description: 'Lüks gül tasarımı',
    price: 950,
    cost: 450,
    imageUrl: PHOTOS.buket_gul,
    gallery: [],
    badge: null,
    sortOrder: ID,
    isActive: true,
    bouquetKind: 'TYPE',
    subType: 'yapay-gul',
  },`;

const baseAnne = `  {
    id: 'mock_anne_ID',
    type: 'anne-gulu',
    categoryId: 'cat1',
    name: 'Anne Gülü ID',
    description: 'Özel tasarım anne gülü',
    price: 150,
    cost: 70,
    imageUrl: PHOTOS.rose_gul,
    gallery: [],
    badge: null,
    sortOrder: ID,
    isActive: true,
  },`;

const baseKahve = `  {
    id: 'mock_kahve_ID',
    type: 'kahve-yani',
    categoryId: 'cat1',
    name: 'Kahve Yanı Çikolata ID',
    description: 'Özel döküm çikolata serisi',
    price: 80,
    cost: 30,
    imageUrl: PHOTOS.set_bebek, // fallback image
    gallery: [],
    badge: null,
    sortOrder: ID,
    isActive: true,
  },`;

const newProducts = [];
for (let i = 1; i <= 10; i++) {
  // Buket Şakayık (1-10) -> sub_buket2
  newProducts.push(baseSakayik.replace(/ID/g, i).replace('TYPE', 'buket').replace('SUB_CAT', 'sub_buket2'));
  // Kutu Şakayık (11-20) -> sub_buket4
  newProducts.push(baseSakayik.replace(/ID/g, i + 10).replace('TYPE', 'kutu').replace('SUB_CAT', 'sub_buket4'));
  // Buket Gül (21-30) -> sub_buket1
  newProducts.push(baseGul.replace(/ID/g, i + 20).replace('TYPE', 'buket').replace('SUB_CAT', 'sub_buket1'));
  // Kutu Gül (31-40) -> sub_buket3
  newProducts.push(baseGul.replace(/ID/g, i + 30).replace('TYPE', 'kutu').replace('SUB_CAT', 'sub_buket3'));
  // Anne Güleri (41-50)
  newProducts.push(baseAnne.replace(/ID/g, i + 40));
  // Kahve Yanı (51-60)
  newProducts.push(baseKahve.replace(/ID/g, i + 50));
}

const targetStr = "];\n\n// ============================================================\n// DEFAULT STATE";
if(code.includes(targetStr)) {
   code = code.replace(targetStr, newProducts.join('\\n') + '\\n' + targetStr);
   fs.writeFileSync(file, code);
   console.log('SUCCESS');
} else {
   console.log('FAILED TO MATCH');
}
