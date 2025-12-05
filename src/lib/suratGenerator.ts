import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { JENIS_SURAT_OPTIONS } from './types';

interface SuratData {
  id: string;
  nomor_surat: string | null;
  jenis_surat: string;
  keperluan: string | null;
  created_at: string;
  processed_at: string | null;
  penduduk_nama: string;
  penduduk_nik?: string;
  penduduk_alamat?: string;
  rt_nama?: string;
  rw_nama?: string;
}

export function generateSuratHTML(surat: SuratData): string {
  const jenisSurat = JENIS_SURAT_OPTIONS.find(o => o.value === surat.jenis_surat)?.label || surat.jenis_surat;
  const tanggal = surat.processed_at 
    ? format(new Date(surat.processed_at), 'd MMMM yyyy', { locale: id })
    : format(new Date(), 'd MMMM yyyy', { locale: id });
  
  const nomorSurat = surat.nomor_surat || `${surat.id.slice(0, 8).toUpperCase()}/RT/RW/${new Date().getFullYear()}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${jenisSurat} - ${surat.penduduk_nama}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 3px double #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 16pt;
      font-weight: bold;
    }
    .header h2 {
      margin: 5px 0;
      font-size: 14pt;
      font-weight: normal;
    }
    .header p {
      margin: 5px 0;
      font-size: 10pt;
    }
    .title {
      text-align: center;
      margin: 30px 0;
    }
    .title h3 {
      margin: 0;
      font-size: 14pt;
      text-decoration: underline;
      font-weight: bold;
    }
    .title p {
      margin: 5px 0;
      font-size: 11pt;
    }
    .content {
      text-align: justify;
      margin: 20px 0;
    }
    .data-table {
      margin: 20px 0;
    }
    .data-table tr td:first-child {
      width: 150px;
      vertical-align: top;
    }
    .data-table tr td:nth-child(2) {
      width: 20px;
      text-align: center;
      vertical-align: top;
    }
    .signature {
      margin-top: 50px;
      text-align: right;
    }
    .signature p {
      margin: 5px 0;
    }
    .signature-space {
      height: 80px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak Surat</button>
  
  <div class="header">
    <h1>RUKUN TETANGGA ${surat.rt_nama || 'RT'}</h1>
    <h2>RUKUN WARGA ${surat.rw_nama || 'RW'}</h2>
    <p>Alamat: ___________________</p>
  </div>

  <div class="title">
    <h3>${jenisSurat.toUpperCase()}</h3>
    <p>Nomor: ${nomorSurat}</p>
  </div>

  <div class="content">
    <p>Yang bertanda tangan di bawah ini, Ketua RT ${surat.rt_nama || ''} RW ${surat.rw_nama || ''}, dengan ini menerangkan bahwa:</p>
    
    <table class="data-table">
      <tr>
        <td>Nama</td>
        <td>:</td>
        <td><strong>${surat.penduduk_nama}</strong></td>
      </tr>
      <tr>
        <td>NIK</td>
        <td>:</td>
        <td>${surat.penduduk_nik || '-'}</td>
      </tr>
      <tr>
        <td>Alamat</td>
        <td>:</td>
        <td>${surat.penduduk_alamat || '-'}</td>
      </tr>
    </table>

    <p>Adalah benar warga kami yang berdomisili di wilayah RT ${surat.rt_nama || ''} RW ${surat.rw_nama || ''}.</p>
    
    ${surat.keperluan ? `<p>Surat ini dibuat untuk keperluan: <strong>${surat.keperluan}</strong></p>` : ''}
    
    <p>Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
  </div>

  <div class="signature">
    <p>Dikeluarkan di: _______________</p>
    <p>Pada tanggal: ${tanggal}</p>
    <p>Ketua RT ${surat.rt_nama || ''}</p>
    <div class="signature-space"></div>
    <p>(_______________________)</p>
  </div>
</body>
</html>
  `;
}

export function downloadSurat(surat: SuratData): void {
  const html = generateSuratHTML(surat);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
