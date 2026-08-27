import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (sample: any, results: any = {}, parameters: any[] = []) => {
  const doc = new jsPDF();
  
  // Header Block
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('AQUALAB ANALYTICAL SERVICES', 14, 22);
  
  doc.setFontSize(14);
  doc.setTextColor(168, 85, 247); // Purple
  doc.text('WATER QUALITY LAB ANALYSIS REPORT', 14, 32);

  // Metadata Grid
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  
  const reportDate = new Date().toLocaleDateString();
  
  (doc as any).autoTable({
    startY: 40,
    theme: 'plain',
    head: [],
    body: [
      [{ content: 'Sample ID:', styles: { fontStyle: 'bold' } }, sample.sampleNumber, { content: 'Report Date:', styles: { fontStyle: 'bold' } }, reportDate],
      [{ content: 'Client Name:', styles: { fontStyle: 'bold' } }, sample.client || 'N/A', { content: 'Date Received:', styles: { fontStyle: 'bold' } }, reportDate],
      [{ content: 'Location:', styles: { fontStyle: 'bold' } }, sample.sourceLocation || 'N/A', { content: 'Sample Type:', styles: { fontStyle: 'bold' } }, sample.type || 'N/A'],
    ],
    styles: { cellPadding: 2, fontSize: 10, textColor: [71, 85, 105] },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 15;

  // Analysis Results Table (only if parameters are provided)
  if (parameters.length > 0) {
    const tableBody = parameters.map(param => {
      const val = parseFloat(results[param.id] || '0');
      const hasValue = results[param.id] !== undefined && results[param.id] !== '';
      const isCompliant = hasValue && val >= param.min && val <= param.max;
      
      const statusText = !hasValue ? 'Pending' : isCompliant ? 'PASS' : 'FAIL';
      
      return [
        param.name,
        results[param.id] || '-',
        `${param.min} - ${param.max}`,
        param.unit,
        statusText
      ];
    });

    (doc as any).autoTable({
      startY: currentY,
      head: [['Parameter', 'Measured Value', 'Limits', 'Unit', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [88, 28, 135], textColor: [255, 255, 255] }, // Purple-900
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'PASS') {
            data.cell.styles.textColor = [16, 185, 129]; // Emerald
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.raw === 'FAIL') {
            data.cell.styles.textColor = [225, 29, 72]; // Rose
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }



  // Save the document
  doc.save(`${sample.sampleNumber}_Lab_Report.pdf`);
};
