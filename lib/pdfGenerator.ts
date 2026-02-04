// lib/pdfGenerator.ts
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
  const margin = 20;
  let yPos = margin;

  // Add Logo/Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth / 2, 25, { align: 'center' });

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

  // From/To Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // From (Your Company)
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Company Name', margin, yPos + 6);
  doc.text('Your Address', margin, yPos + 12);
  doc.text('Dubai, UAE', margin, yPos + 18);
  doc.text('Phone: +971 4 123 4567', margin, yPos + 24);
  doc.text('Email: info@yourcompany.com', margin, yPos + 30);

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

  // Items Table
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
      description: product.sku,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      total: product.total
    }))
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Item Description', 'Qty', 'Unit Price', 'Total']],
    body: allItems.map((item, index) => [
      index + 1,
      `${item.name}\n${item.description || ''}`,
      item.quantity,
      `${item.unitPrice.toLocaleString()} ${quotation.currency}`,
      `${item.total.toLocaleString()} ${quotation.currency}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  // Get last autoTable position
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Financial Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Financial Summary', margin, yPos);
  
  yPos += 15;
  
  doc.setFont('helvetica', 'normal');
  const lineHeight = 7;
  
  // Subtotal
  doc.text('Subtotal:', margin, yPos);
  doc.text(`${quotation.subtotal.toLocaleString()} ${quotation.currency}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  // Discount
  if (quotation.discountAmount > 0) {
    const discountText = quotation.discountType === 'percentage' 
      ? `Discount (${quotation.discount}%):`
      : 'Discount:';
    doc.text(discountText, margin, yPos);
    doc.text(`-${quotation.discountAmount.toLocaleString()} ${quotation.currency}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += lineHeight;
  }
  
  // Tax
  doc.text(`Tax (${quotation.taxRate}%):`, margin, yPos);
  doc.text(`${quotation.taxAmount.toLocaleString()} ${quotation.currency}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += lineHeight;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL AMOUNT:', margin, yPos);
  doc.text(`${quotation.total.toLocaleString()} ${quotation.currency}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 20;
  
  // Notes
  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    yPos += notesLines.length * 5 + 10;
  }
  
  // Terms
  if (quotation.terms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(quotation.terms, pageWidth - 2 * margin);
    doc.text(termsLines, margin, yPos);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('For any inquiries, please contact: info@yourcompany.com | +971 4 123 4567', pageWidth / 2, footerY + 5, { align: 'center' });
  
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