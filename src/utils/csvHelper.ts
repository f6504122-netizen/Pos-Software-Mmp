import { Product } from '../types';

export function parseCSV(csvText: string): Partial<Product>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('title') || h.includes('item'));
  const priceIdx = header.findIndex((h) => h.includes('price') || h.includes('cost') || h.includes('rate'));
  const categoryIdx = header.findIndex((h) => h.includes('category') || h.includes('type') || h.includes('dept'));
  const barcodeIdx = header.findIndex((h) => h.includes('barcode') || h.includes('sku') || h.includes('upc') || h.includes('code_id'));
  const codeIdx = header.findIndex((h) => h === 'code' || h.includes('tier') || h.includes('rack'));
  const stockIdx = header.findIndex((h) => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
  const descIdx = header.findIndex((h) => h.includes('desc'));

  const results: Partial<Product>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `Item #${i}`;
    const priceRaw = priceIdx !== -1 && row[priceIdx] ? row[priceIdx].replace(/[^0-9.]/g, '') : '0';
    const price = parseFloat(priceRaw) || 0;
    const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim().toLowerCase() : 'birthday';
    const barcode = barcodeIdx !== -1 && row[barcodeIdx] ? row[barcodeIdx].trim() : `SKU-${1000 + i}`;
    const code = codeIdx !== -1 && row[codeIdx] ? row[codeIdx].trim() : undefined;
    const stockRaw = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx].replace(/[^0-9]/g, ''), 10) : 50;
    const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : undefined;

    if (name && price >= 0) {
      results.push({
        id: `prod-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        name,
        price,
        category: category || 'birthday',
        barcode,
        code: code || 'Tier A',
        stock: isNaN(stockRaw) ? 50 : stockRaw,
        description,
        icon: getCategoryIcon(category),
      });
    }
  }

  return results;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function getCategoryIcon(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes('birth')) return '🎂';
  if (c.includes('anniv') || c.includes('love')) return '💖';
  if (c.includes('symp') || c.includes('care')) return '🕊️';
  if (c.includes('holi') || c.includes('xmas')) return '🎄';
  if (c.includes('wrap') || c.includes('bag')) return '🎁';
  if (c.includes('plush') || c.includes('bear')) return '🧸';
  if (c.includes('candl')) return '🕯️';
  if (c.includes('novel') || c.includes('gift')) return '🎈';
  if (c.includes('tier') || c.includes('price')) return '🏷️';
  return '💌';
}

export function downloadSampleCSVTemplate() {
  const sample = [
    'Name,Price,Category,Barcode,Code,Stock,Description',
    'Birthday Floral Card,3.99,birthday,880101,Tier B,50,Floral embossed card with envelope',
    'Laser Pop-Up Birthday,5.99,birthday,880102,Tier D,30,3D Pop up birthday celebration card',
    'Anniversary Gold Foil,4.99,anniversary,880201,Tier C,40,Deluxe metallic gold anniversary card',
    'Sympathy Watercolor,2.99,sympathy,880301,Tier A,50,Peaceful watercolor sympathy card',
    'Holiday Sparkle Card,3.99,holiday,880401,Tier B,45,Glitter festive winter holiday card',
    'Jumbo Matte Gift Bag,3.49,wrap,880501,Bag,60,Heavyweight matte paper bag with ribbon handles',
    'Roll of Satin Ribbon,2.99,wrap,880502,Ribbon,40,Double face satin ribbon 25 yards',
    'Plush Teddy Bear (8"),12.99,plush,880601,Plush,20,Soft cuddle bear with ribbon',
    'Soy Candle Vanilla Amber,16.99,candles,880701,Candle,25,8oz hand poured aromatherapy candle',
    'Helium Celebration Balloon,4.99,novelty,880801,Balloon,50,18 inch foil metallic helium balloon',
  ].join('\n');

  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'greeting_cards_products_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProductsToCSV(products: Product[]) {
  const headers = ['Name', 'Price', 'Category', 'Barcode', 'Code', 'Stock', 'Description'];
  const rows = products.map((p) => [
    `"${(p.name || '').replace(/"/g, '""')}"`,
    p.price.toFixed(2),
    p.category,
    `"${(p.barcode || '').replace(/"/g, '""')}"`,
    `"${(p.code || '').replace(/"/g, '""')}"`,
    p.stock ?? 50,
    `"${(p.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
