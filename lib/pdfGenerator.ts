import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuotationData {
  id: string;
  quoteNumber: string;
  client: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  validUntil: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  discountAmount: number;
  discountType: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  paymentMethods: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export const generateQuotationPDF = (quotation: QuotationData): { pdf: jsPDF, fileName: string, blobUrl: string } => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  let currentPage = 1;

  // Function to check and add new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      doc.addPage();
      currentPage++;
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header function (call on each page)
  const addHeader = () => {
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth / 2, 15, { align: 'center' });
    
    // Page number
    doc.setFontSize(8);
    doc.text(`Page ${currentPage}`, pageWidth - margin, 35, { align: 'right' });
  };

  // Add header on first page
  addHeader();
  yPos = 50;

  // Quotation Number and Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`QUOTATION #: ${quotation.quoteNumber}`, margin, yPos);
  doc.text(`DATE: ${formatDate(quotation.date)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.text(`VALID UNTIL: ${formatDate(quotation.validUntil)}`, pageWidth - margin, yPos, { align: 'right' });

  yPos += 15;

  // Check space for From/To section
  checkPageBreak(40);

  // From/To Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // From (Your Company)
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('HOMEWORK CLEANING SERVICES', margin, yPos + 6);
  doc.text('Al Quoz- Dubai - United Arab Emirates ', margin, yPos + 12);
  doc.text('Dubai, UAE', margin, yPos + 18);
  doc.text('Phone: 80046639675', margin, yPos + 24);
  doc.text('Email: services@homeworkuae.com', margin, yPos + 30);

  // To (Client)
  doc.setFont('helvetica', 'bold');
  doc.text('TO:', pageWidth / 2, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.client, pageWidth / 2, yPos + 6);
  doc.text(quotation.company, pageWidth / 2, yPos + 12);
  doc.text(quotation.location || 'Dubai, UAE', pageWidth / 2, yPos + 18);
  doc.text(`Phone: ${quotation.phone}`, pageWidth / 2, yPos + 24);
  doc.text(`Email: ${quotation.email}`, pageWidth / 2, yPos + 30);

  yPos += 45;

  // Prepare items for table
  const allItems = [
    ...quotation.services.map(service => ({
      type: 'Service',
      name: service.name,
      description: service.description,
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      total: service.total
    })),
    ...quotation.products.map(product => ({
      type: 'Product',
      name: product.name,
      description: product.sku ? `SKU: ${product.sku}` : '',
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      total: product.total
    }))
  ];

  // Items Table with auto page break
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', `Total (${quotation.currency})`]],
    body: allItems.map((item, index) => [
      index + 1,
      { 
        content: `${item.name}\n${item.description || ''}`,
        styles: { valign: 'middle' }
      },
      item.quantity,
      { 
        content: `${item.unitPrice.toLocaleString()}`,
        styles: { halign: 'right' }
      },
      { 
        content: `${item.total.toLocaleString()}`,
        styles: { halign: 'right' }
      }
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 0, 0], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 4,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Add header on new pages
      if (data.pageNumber > 1) {
        addHeader();
      }
    }
  });

  // Get last autoTable position
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need new page for financial summary
  checkPageBreak(80);

  // Financial Summary Box
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - margin - 120, yPos - 5, 120, 75, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(pageWidth - margin - 120, yPos - 5, 120, 75, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FINANCIAL SUMMARY', pageWidth - margin - 115, yPos);

  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const lineHeight = 7;
  let summaryY = yPos;
  
  // Subtotal
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal:', pageWidth - margin - 115, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${quotation.subtotal.toLocaleString()} ${quotation.currency}`, pageWidth - margin - 15, summaryY, { align: 'right' });
  summaryY += lineHeight;
  
  // Discount
  if (quotation.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const discountText = quotation.discountType === 'percentage' 
      ? `Discount (${quotation.discount}%):` 
      : 'Discount:';
    doc.text(discountText, pageWidth - margin - 115, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 50, 50);
    doc.text(`-${quotation.discountAmount.toLocaleString()} ${quotation.currency}`, pageWidth - margin - 15, summaryY, { align: 'right' });
    summaryY += lineHeight;
  }
  
  // Tax
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`VAT (${quotation.taxRate}%):`, pageWidth - margin - 115, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`${quotation.taxAmount.toLocaleString()} ${quotation.currency}`, pageWidth - margin - 15, summaryY, { align: 'right' });
  summaryY += lineHeight + 3;
  
  // Line separator
  doc.setDrawColor(0, 0, 0);
  doc.line(pageWidth - margin - 115, summaryY - 2, pageWidth - margin - 15, summaryY - 2);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', pageWidth - margin - 115, summaryY + 2);
  doc.text(`${quotation.total.toLocaleString()} ${quotation.currency}`, pageWidth - margin - 15, summaryY + 2, { align: 'right' });

  yPos += 85;

  // Notes Section
  if (quotation.notes) {
    checkPageBreak(30);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 3, pageWidth - (2 * margin), 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('NOTES', margin + 5, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - (2 * margin) - 10);
    
    // Check if notes need new page
    if (yPos + (notesLines.length * 5) > pageHeight - 30) {
      doc.addPage();
      currentPage++;
      addHeader();
      yPos = margin + 10;
    }
    
    doc.text(notesLines, margin + 5, yPos);
    yPos += notesLines.length * 5 + 15;
  }
  
  // Terms Section
  if (quotation.terms) {
    checkPageBreak(30);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 3, pageWidth - (2 * margin), 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('TERMS & CONDITIONS', margin + 5, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const termsLines = doc.splitTextToSize(quotation.terms, pageWidth - (2 * margin) - 10);
    
    // Check if terms need new page
    if (yPos + (termsLines.length * 5) > pageHeight - 30) {
      doc.addPage();
      currentPage++;
      addHeader();
      yPos = margin + 10;
    }
    
    doc.text(termsLines, margin + 5, yPos);
  }
  
  // Add footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
   
    doc.text('For inquiries: services@homeworkuae.com | 80046639675', pageWidth / 2, footerY + 4, { align: 'center' });
    
    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }
  
  // Generate file name
  const fileName = `Quotation_${quotation.quoteNumber.replace('#', '')}_${quotation.client.replace(/\s+/g, '_')}.pdf`;
  
  // Convert to Blob URL for download/preview
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  return { pdf: doc, fileName, blobUrl };
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to download PDF
export const downloadPDF = (quotation: QuotationData) => {
  const { pdf, fileName } = generateQuotationPDF(quotation);
  pdf.save(fileName);
};

// Helper to get PDF as Blob
export const getPDFAsBlob = (quotation: QuotationData): Blob => {
  const { pdf } = generateQuotationPDF(quotation);
  return pdf.output('blob');
};

