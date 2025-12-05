// Export utilities for data export to CSV/Excel

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => string;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // Create CSV header
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value: string;
      if (col.render) {
        value = col.render(item);
      } else {
        const rawValue = (item as Record<string, unknown>)[col.key as string];
        value = rawValue != null ? String(rawValue) : '';
      }
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatGender(gender: string | null): string {
  if (!gender) return '-';
  return gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : gender;
}
