/**
 * Exports arbitrary tabular data to CSV and triggers client-side download.
 */
export function exportToCSV(
  rows: Array<Record<string, unknown>>,
  filename: string = 'canopy-emissions-export.csv'
): void {
  if (!rows || rows.length === 0) {
    console.warn('No rows provided to exportToCSV');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvLines: string[] = [];

  // Header line
  csvLines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data lines
  for (const row of rows) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvLines.push(values.join(','));
  }

  // Prepend disclaimer row
  const disclaimer = '# Canopy Stage 1 Illustrative Carbon Footprint Data Export - Not Certified for Regulatory Filing';
  const csvContent = `${disclaimer}\n${csvLines.join('\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
