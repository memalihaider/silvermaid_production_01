// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// interface QuotationData {
//   id: string;
//   quoteNumber: string;
//   client: string;
//   company: string;
//   email: string;
//   phone: string;
//   location: string;
//   date: string;
//   validUntil: string;
//   dueDate: string;
//   currency: string;
//   taxRate: number;
//   discount: number;
//   discountAmount: number;
//   discountType: string;
//   status: string;
//   subtotal: number;
//   taxAmount: number;
//   total: number;
//   notes: string;
//   terms: string;
//   confirmationLetter?: string;
//   bankDetails?: {
//     accountName: string;
//     accountNumber: string;
//     bankName: string;
//     swiftCode: string;
//     iban: string;
//   };
//   paymentMethods: string[];
//   services: Array<{
//     id: string;
//     name: string;
//     description: string;
//     quantity: number;
//     unitPrice: number;
//     total: number;
//   }>;
//   products: Array<{
//     id: string;
//     name: string;
//     sku: string;
//     quantity: number;
//     unitPrice: number;
//     total: number;
//   }>;
//   createdAt: any;
//   updatedAt: any;
//   createdBy: string;
// }

// export const generateQuotationPDF = (quotation: QuotationData): { pdf: jsPDF, fileName: string, blobUrl: string } => {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 15;
//   let yPos = margin;
//   let currentPage = 1;

//   // Updated checkPageBreak with minimal bottom space
//   const checkPageBreak = (requiredSpace: number) => {
//     if (yPos + requiredSpace > pageHeight - 15) { // Reduced from 20 to 15
//       doc.addPage();
//       currentPage++;
//       yPos = margin;
//       addHeader(); // Add header on every new page
//       yPos = 32; // Position after header
//       return true;
//     }
//     return false;
//   };

//   // ==================== PROFESSIONAL HEADER (MINIMAL HEIGHT) ====================
//   const addHeader = () => {
//     // Pure white background
//     doc.setFillColor(255, 255, 255);
//     doc.rect(0, 0, pageWidth, 26, 'F');
    
//     // Thin shadow line
//     doc.setFillColor(40, 40, 40);
//     doc.rect(0, 26, pageWidth, 0.5, 'F');
    
//     // ===== LEFT SIDE - LOGO =====
//     try {
//       const logoWidth = 48;
//       const logoHeight = 40;
//       const logoX = margin;
//       const logoY = -5;
      
//       doc.addImage('/logo.jpeg', 'JPEG', logoX, logoY, logoWidth, logoHeight);
//     } catch (error) {
//       console.log('Logo not found, using text only');
//       doc.setTextColor(255, 255, 255);
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'bold');
//       doc.text('LOGO', margin, 15);
//     }
    
//     // ===== CENTER - QUOTATION =====
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
    
//     doc.setTextColor(255, 105, 180);
//     doc.text('QUOT', pageWidth / 2 - 9, 13, { align: 'center' });
    
//     doc.setTextColor(70, 130, 180);
//     doc.text('ATION', pageWidth / 2 + 7, 13, { align: 'center' });
    
//     doc.setFontSize(6);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(120, 120, 120);
//     doc.text(`Ref: ${quotation.quoteNumber}`, pageWidth / 2, 20, { align: 'center' });
    
//     // ===== RIGHT SIDE - COMPANY NAME =====
//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.text('SILVER MAID', pageWidth - margin, 12, { align: 'right' });
    
//     doc.setFontSize(7);
//     doc.setFont('helvetica', 'light');
//     doc.setTextColor(0, 0, 0);
//     doc.text('CLEANING', pageWidth - margin, 19, { align: 'right' });
//   };

//   addHeader();
//   yPos = 32;

//   // ==================== QUOTATION INFO BAR ====================
//   doc.setFillColor(248, 248, 248);
//   doc.rect(margin, yPos - 2, pageWidth - (2 * margin), 8, 'F');
  
//   doc.setTextColor(80, 80, 80);
//   doc.setFontSize(6);
//   doc.setFont('helvetica', 'normal');
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('REF:', margin + 1, yPos);
//   doc.setFont('helvetica', 'normal');
//   doc.text(quotation.quoteNumber, margin + 12, yPos);

//   doc.setFont('helvetica', 'bold');
//   doc.text('ISSUE:', pageWidth / 2 - 15, yPos);
//   doc.setFont('helvetica', 'normal');
//   doc.text(formatDate(quotation.date), pageWidth / 2 - 7, yPos);
  
//   doc.setFont('helvetica', 'bold');
//   doc.text('VALID:', pageWidth - margin - 15, yPos, { align: 'right' });
//   doc.setFont('helvetica', 'normal');
//   doc.text(formatDate(quotation.validUntil), pageWidth - margin - 2, yPos, { align: 'right' });

//   yPos += 11;

//   // ==================== FROM / TO SECTION ====================
//   checkPageBreak(32);

//   const fromToBaseY = yPos - 1;
//   let fromToContentHeight = 24;
  
//   if (quotation.company) {
//     fromToContentHeight += 3;
//   }
  
//   const fromToBoxHeight = fromToContentHeight;

//   doc.setFillColor(255, 255, 255);
//   doc.rect(margin, fromToBaseY, pageWidth - (2 * margin), fromToBoxHeight, 'F');
  
//   doc.setFillColor(255, 105, 180);
//   doc.rect(margin, fromToBaseY, 2, fromToBoxHeight, 'F');
  
//   doc.setFillColor(70, 130, 180);
//   doc.rect(pageWidth - margin - 2, fromToBaseY, 2, fromToBoxHeight, 'F');
  
//   doc.setDrawColor(220, 220, 220);
//   doc.setLineWidth(0.3);
//   doc.rect(margin, fromToBaseY, pageWidth - (2 * margin), fromToBoxHeight, 'S');

//   // FROM Section
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(9);
//   doc.setTextColor(0, 0, 0);
//   doc.text('FROM:', margin + 4, fromToBaseY + 4);
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(6);
//   doc.setTextColor(80, 80, 80);
  
//   let fromY = fromToBaseY + 8;
//   doc.text('SILVER MAID CLEANING', margin + 4, fromY);
//   fromY += 3;
//   doc.text('Al Quoz Ind Area 1', margin + 4, fromY);
//   fromY += 3;
//   doc.text('Dubai, UAE', margin + 4, fromY);
//   fromY += 4;
//   doc.setTextColor(0, 0, 0);
//   doc.text('+971 800 4663', margin + 4, fromY);
//   fromY += 3;
//   doc.text('info@silvermaid.ae', margin + 4, fromY);

//   doc.setDrawColor(220, 220, 220);
//   doc.line(pageWidth / 2, fromToBaseY, pageWidth / 2, fromToBaseY + fromToBoxHeight);

//   // TO Section
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(9);
//   doc.setTextColor(0, 0, 0);
//   doc.text('TO:', pageWidth / 2 + 4, fromToBaseY + 4);
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(6);
//   doc.setTextColor(80, 80, 80);
  
//   let toY = fromToBaseY + 8;
//   const clientName = quotation.client || 'Valued Customer';
//   doc.text(clientName, pageWidth / 2 + 4, toY);
//   toY += 3;
  
//   const companyName = quotation.company || '';
//   if (companyName) {
//     doc.text(companyName, pageWidth / 2 + 4, toY);
//     toY += 3;
//   }
  
//   const location = quotation.location || 'Dubai, UAE';
//   doc.text(location, pageWidth / 2 + 4, toY);
//   toY += 4;
  
//   doc.setTextColor(0, 0, 0);
//   const clientPhone = quotation.phone || '+971 XX XXX';
//   doc.text(clientPhone, pageWidth / 2 + 4, toY);
//   toY += 3;
  
//   const clientEmail = quotation.email || 'client@email.com';
//   doc.text(clientEmail, pageWidth / 2 + 4, toY);

//   yPos = fromToBaseY + fromToBoxHeight + 3; // Reduced from 4 to 3

//   // ==================== SECTION TITLE ====================
//   checkPageBreak(15);
  
//   doc.setFillColor(245, 245, 245);
//   doc.rect(margin, yPos - 1, pageWidth - (2 * margin), 8, 'F');
  
//   doc.setFillColor(255, 105, 180);
//   doc.rect(margin, yPos - 1, (pageWidth - (2 * margin)) / 2, 1.5, 'F');
  
//   doc.setFillColor(70, 130, 180);
//   doc.rect(margin + ((pageWidth - (2 * margin)) / 2), yPos - 1, (pageWidth - (2 * margin)) / 2, 1.5, 'F');
  
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(10);
//   doc.setTextColor(40, 40, 40);
//   doc.text('SERVICES & PRODUCTS', pageWidth / 2, yPos + 4, { align: 'center' });

//   yPos += 9; // Reduced from 10 to 9

//   // ==================== ITEMS TABLE ====================
//   const allItems = [
//     ...quotation.services.map(service => ({
//       type: 'Service',
//       name: service.name,
//       description: service.description,
//       quantity: service.quantity,
//       unitPrice: service.unitPrice,
//       total: service.total
//     })),
//     ...quotation.products.map(product => ({
//       type: 'Product',
//       name: product.name,
//       description: product.sku ? `SKU: ${product.sku}` : '',
//       quantity: product.quantity,
//       unitPrice: product.unitPrice,
//       total: product.total
//     }))
//   ];

//   autoTable(doc, {
//     startY: yPos,
//     head: [['#', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
//     body: allItems.map((item, index) => [
//       index + 1,
//       { 
//         content: `${item.name}${item.description ? '\n' + item.description : ''}`,
//         styles: { valign: 'middle' }
//       },
//       item.quantity,
//       { 
//         content: formatCurrency(item.unitPrice),
//         styles: { halign: 'right', fontStyle: 'normal' }
//       },
//       { 
//         content: formatCurrency(item.total),
//         styles: { halign: 'right', fontStyle: 'bold' }
//       }
//     ]),
//     theme: 'grid',
//     headStyles: { 
//       fillColor: [135, 206, 235],
//       textColor: [255, 255, 255], 
//       fontStyle: 'bold',
//       fontSize: 6.5,
//       halign: 'center',
//       lineWidth: 0
//     },
//     alternateRowStyles: {
//       fillColor: [250, 250, 250]
//     },
//     styles: { 
//       fontSize: 6.5,
//       cellPadding: 2,
//       overflow: 'linebreak',
//       lineColor: [230, 230, 230],
//       lineWidth: 0.1
//     },
//     columnStyles: {
//       0: { cellWidth: 23, halign: 'center' },
//       1: { cellWidth: 88, halign: 'left' },
//       2: { cellWidth: 23, halign: 'center' },
//       3: { cellWidth: 23, halign: 'right' },
//       4: { cellWidth: 23, halign: 'right' }
//     },
//     margin: { left: margin, right: margin },
//     didDrawPage: (data) => {
//       addHeader();
//     }
//   });

//   yPos = (doc as any).lastAutoTable.finalY + 4; // Reduced from 6 to 4

//   // ==================== FINANCIAL SUMMARY ====================
//   checkPageBreak(35);

//   const summaryWidth = 105;
//   const summaryX = pageWidth - margin - summaryWidth;

//   let summaryLines = 3;
//   if (quotation.discountAmount > 0) {
//     summaryLines += 1;
//   }
  
//   const summaryContentHeight = (summaryLines * 4) + 8;
//   const summaryBoxHeight = summaryContentHeight + 1; // Reduced padding

//   doc.setFillColor(250, 250, 250);
//   doc.rect(summaryX - 1, yPos - 2, summaryWidth + 2, summaryBoxHeight, 'F');
  
//   doc.setFillColor(230, 230, 230);
//   doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'F');
  
//   doc.setFillColor(255, 255, 255);
//   doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'F');
  
//   doc.setFillColor(255, 105, 180);
//   doc.rect(summaryX, yPos - 1, summaryWidth / 2, 2, 'F');
  
//   doc.setFillColor(70, 130, 180);
//   doc.rect(summaryX + (summaryWidth / 2), yPos - 1, summaryWidth / 2, 2, 'F');
  
//   doc.setDrawColor(200, 200, 200);
//   doc.setLineWidth(0.3);
//   doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'S');

//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(9);
//   doc.setTextColor(40, 40, 40);
//   doc.text('FINANCIAL SUMMARY', summaryX + (summaryWidth / 2), yPos + 3, { align: 'center' }); // Reduced from 4 to 3

//   let summaryY = yPos + 6; // Reduced from 7 to 6
  
//   doc.setFont('helvetica', 'normal');
//   doc.setFontSize(6.5);
//   const lineHeight = 4;
  
//   // Subtotal
//   doc.setTextColor(100, 100, 100);
//   doc.text('Subtotal:', summaryX + 5, summaryY);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(0, 0, 0);
//   doc.text(formatCurrency(quotation.subtotal), summaryX + summaryWidth - 5, summaryY, { align: 'right' });
//   summaryY += lineHeight;
  
//   // Discount
//   if (quotation.discountAmount > 0) {
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(100, 100, 100);
//     const discountText = quotation.discountType === 'percentage' 
//       ? `Disc (${quotation.discount}%):` : 'Discount:';
//     doc.text(discountText, summaryX + 5, summaryY);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(255, 105, 180);
//     doc.text(`- ${formatCurrency(quotation.discountAmount)}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
//     summaryY += lineHeight;
//   }
  
//   // Tax
//   doc.setFont('helvetica', 'normal');
//   doc.setTextColor(100, 100, 100);
//   doc.text(`VAT (${quotation.taxRate}%):`, summaryX + 5, summaryY);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(70, 130, 180);
//   doc.text(formatCurrency(quotation.taxAmount), summaryX + summaryWidth - 5, summaryY, { align: 'right' });
//   summaryY += lineHeight + 1;
  
//   // Separator line
//   doc.setDrawColor(0, 0, 0);
//   doc.setLineWidth(0.1);
//   doc.line(summaryX + 5, summaryY - 1, summaryX + summaryWidth - 5, summaryY - 1);
  
//   // Total
//   doc.setFont('helvetica', 'bold');
//   doc.setFontSize(8);
//   doc.setTextColor(0, 0, 0);
//   doc.text('TOTAL:', summaryX + 5, summaryY + 2);
//   doc.setFontSize(9);
//   doc.setTextColor(40, 40, 40);
//   doc.text(formatCurrency(quotation.total), summaryX + summaryWidth - 5, summaryY + 2, { align: 'right' });

//   yPos += summaryBoxHeight + 3; // Reduced from 4 to 3

//   // ==================== NOTES SECTION ====================
//   if (quotation.notes) {
//     checkPageBreak(18); // Reduced from 20
    
//     const notesLabel = 'PAYMENT TERMS';
//     doc.setFillColor(255, 240, 245);
//     doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 7, 'F'); // Reduced height

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.setTextColor(0, 0, 0);
//     doc.text(notesLabel, pageWidth / 2, yPos + 1, { align: 'center' });

//     yPos += 7; // Reduced from 8
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(80, 80, 80);
//     const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - (2 * margin) - 10);
    
//     // Check if notes need new page
//     if (yPos + (notesLines.length * 3) > pageHeight - 15) {
//       doc.addPage();
//       currentPage++;
//       yPos = margin;
//       addHeader();
//       yPos = 32;
//     }
    
//     doc.text(notesLines, margin + 5, yPos);
//     yPos += notesLines.length * 3 + 4; // Reduced from 6
//   }
  
//   // ==================== TERMS SECTION ====================
//   if (quotation.terms) {
//     checkPageBreak(18);
    
//     const termsLabel = 'TERMS AND CONDITIONS';
//     doc.setFillColor(235, 245, 250);
//     doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 7, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.setTextColor(0, 0, 0);
//     doc.text(termsLabel, pageWidth / 2, yPos + 1, { align: 'center' });

//     yPos += 7;
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(80, 80, 80);
//     const termsLines = doc.splitTextToSize(quotation.terms, pageWidth - (2 * margin) - 10);
    
//     if (yPos + (termsLines.length * 3) > pageHeight - 15) {
//       doc.addPage();
//       currentPage++;
//       yPos = margin;
//       addHeader();
//       yPos = 32;
//     }
    
//     doc.text(termsLines, margin + 5, yPos);
//     yPos += termsLines.length * 3 + 4;
//   }
  
//   // ==================== CONFIRMATION LETTER SECTION ====================
//   if (quotation.confirmationLetter && quotation.confirmationLetter.trim() !== '') {
//     checkPageBreak(45); // Reduced from 50
    
//     const confirmLabel = 'CONFIRMATION LETTER';
//    doc.setFillColor(255, 240, 245);
//     doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 7, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.setTextColor(0, 0, 0);
//     doc.text(confirmLabel, pageWidth / 2, yPos + 1, { align: 'center' });

//     yPos += 7;
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(0, 0, 0);
    
//     const acceptanceText = `We accept the terms & conditions of your above quotation with Quotation No: ${quotation.quoteNumber} dated on ${formatDate(quotation.date)}`;
    
//     const confirmLines = doc.splitTextToSize(quotation.confirmationLetter, pageWidth - (2 * margin) - 10);
    
//     if (yPos + (confirmLines.length * 3) + 25 > pageHeight - 15) {
//       doc.addPage();
//       currentPage++;
//       yPos = margin;
//       addHeader();
//       yPos = 32;
//     }
    
//     doc.text(confirmLines, margin + 5, yPos);
//     yPos += confirmLines.length * 3 + 4;
    
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.setTextColor(0, 0, 0);
//     const acceptLines = doc.splitTextToSize(acceptanceText, pageWidth - (2 * margin) - 10);
//     doc.text(acceptLines, margin + 5, yPos);
//     yPos += acceptLines.length * 3 + 6;
    
//     // ===== CENTERED SIGNATURE DIV =====
//     if (yPos + 35 > pageHeight - 15) {
//       doc.addPage();
//       currentPage++;
//       yPos = margin;
//       addHeader();
//       yPos = 32;
//     }
    
//     const signatureDivWidth = 140;
//     const signatureDivX = (pageWidth - signatureDivWidth) / 2;
//     const signatureDivY = yPos;
//     const signatureDivHeight = 35; // Reduced from 40
    
//     doc.setDrawColor(180, 180, 180);
//     doc.setLineWidth(0.5);
//     doc.rect(signatureDivX, signatureDivY, signatureDivWidth, signatureDivHeight, 'S');
    
//     doc.setFillColor(250, 250, 250);
//     doc.rect(signatureDivX, signatureDivY, signatureDivWidth, signatureDivHeight, 'F');
    
   
    
//     // Signature Line
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(80, 80, 80);
//     doc.text('Signature:', signatureDivX + 10, signatureDivY + 13);
    
//     doc.setDrawColor(150, 150, 150);
//     doc.setLineWidth(0.3);
//     doc.line(signatureDivX + 35, signatureDivY + 13, signatureDivX + 100, signatureDivY + 13);
    
//     doc.setFont('helvetica', 'italic');
//     doc.setFontSize(4.5);
//     doc.setTextColor(150, 150, 150);
//     doc.text('(Sign here)', signatureDivX + 65, signatureDivY + 16, { align: 'center' });
    
//     // Date Line
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(80, 80, 80);
//     doc.text('Date:', signatureDivX + 10, signatureDivY + 24);
    
//     doc.setDrawColor(150, 150, 150);
//     doc.setLineWidth(0.3);
//     doc.line(signatureDivX + 35, signatureDivY + 24, signatureDivX + 100, signatureDivY + 24);
    
//     const todayForSig = new Date().toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(4.5);
//     doc.setTextColor(180, 180, 180);
//     doc.text(todayForSig, signatureDivX + 40, signatureDivY + 22);
    
//     // Stamp box
//     doc.setDrawColor(200, 200, 200);
//     doc.setLineWidth(0.2);
//     doc.rect(signatureDivX + 110, signatureDivY + 7, 18, 18, 'S');
//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(4.5);
//     doc.setTextColor(150, 150, 150);
//     doc.text('STAMP', signatureDivX + 119, signatureDivY + 15, { align: 'center' });
    
//     yPos += signatureDivHeight + 5; // Reduced from 8
//   }
  
//   // ==================== BANK DETAILS SECTION ====================
//   if (quotation.bankDetails) {
//     checkPageBreak(35);
    
//     const bankLabel = 'BANK ACCOUNT DETAILS (AED)';
//     doc.setFillColor(235, 245, 250);
//     doc.rect(pageWidth / 2 - 22, yPos - 3, 44, 7, 'F');

//     doc.setFont('helvetica', 'bold');
//     doc.setFontSize(7);
//     doc.setTextColor(0, 0, 0);
//     doc.text(bankLabel, pageWidth / 2, yPos + 1, { align: 'center' });

//     yPos += 7;
    
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(6);
//     doc.setTextColor(0, 0, 0);
    
//     const bankDetails = [
//       ['Account Name:', quotation.bankDetails.accountName || 'SILVER MAID CLEANING SERVICES LLC'],
//       ['Account Number:', quotation.bankDetails.accountNumber || '1234567890123'],
//       ['Bank Name:', quotation.bankDetails.bankName || 'Emirates NBD'],
//       ['SWIFT Code:', quotation.bankDetails.swiftCode || 'EBILAEAD'],
//       ['IBAN Number:', quotation.bankDetails.iban || 'AE180260001234567890123']
//     ];
    
//     let bankY = yPos;
//     const leftColX = margin + 8;
//     const rightColX = margin + 45;
    
//     bankDetails.forEach(([label, value]) => {
//       if (bankY + 3 > pageHeight - 15) {
//         doc.addPage();
//         currentPage++;
//         bankY = margin;
//         addHeader();
//         bankY = 32;
//       }
      
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(80, 80, 80);
//       doc.text(label, leftColX, bankY);
      
//       doc.setFont('helvetica', 'normal');
//       doc.setTextColor(0, 0, 0);
//       doc.text(value, rightColX, bankY);
      
//       bankY += 3.5;
//     });
    
//     yPos = bankY + 3;
//   }
  
//   // ==================== MINIMAL FOOTER ====================
//   const totalPages = doc.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
    
//     const footerY = pageHeight - 6; // Reduced from 8
    
//     doc.setFillColor(255, 105, 180);
//     doc.rect(margin, footerY - 3, (pageWidth - (2 * margin)) / 2, 0.2, 'F');
//     doc.setFillColor(70, 130, 180);
//     doc.rect(margin + ((pageWidth - (2 * margin)) / 2), footerY - 3, (pageWidth - (2 * margin)) / 2, 0.2, 'F');
    
//     doc.setFontSize(4.5); // Reduced from 5
//     doc.setTextColor(100, 100, 100);
    
//     doc.setFont('helvetica', 'bold');
//     doc.text('HW', margin, footerY);
    
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(120, 120, 120);
//     doc.text(`${i}/${totalPages} | ${quotation.quoteNumber}`, pageWidth - margin, footerY, { align: 'right' });
//   }
  
//   const fileName = `Quotation_${quotation.quoteNumber.replace('#', '')}_${(quotation.client || 'Client').replace(/\s+/g, '_')}.pdf`;
//   const pdfBlob = doc.output('blob');
//   const blobUrl = URL.createObjectURL(pdfBlob);
  
//   return { pdf: doc, fileName, blobUrl };
// };

// const formatCurrency = (amount: number): string => {
//   return amount.toLocaleString('en-AE', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }) + ' AED';
// };

// const formatDate = (dateString: string): string => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric'
//   }).replace(/ /g, ' ');
// };

// export const downloadPDF = (quotation: QuotationData) => {
//   const { pdf, fileName } = generateQuotationPDF(quotation);
//   pdf.save(fileName);
// };

// export const getPDFAsBlob = (quotation: QuotationData): Blob => {
//   const { pdf } = generateQuotationPDF(quotation);
//   return pdf.output('blob');
// };


// new code
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
  confirmationLetter?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode: string;
    iban: string;
  };
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
  const margin = 15;
  let yPos = margin;
  let currentPage = 1;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 15) {
      doc.addPage();
      currentPage++;
      yPos = margin;
      addHeader();
      yPos = 32;
      return true;
    }
    return false;
  };

  const addHeader = () => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 26, 'F');
    
    doc.setFillColor(40, 40, 40);
    doc.rect(0, 26, pageWidth, 0.5, 'F');
    
    try {
      const logoWidth = 48;
      const logoHeight = 40;
      const logoX = margin;
      const logoY = -5;
      
      doc.addImage('/logo.jpeg', 'JPEG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.log('Logo not found, using text only');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('LOGO', margin, 15);
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    doc.setTextColor(255, 105, 180);
    doc.text('QUOT', pageWidth / 2 - 9, 13, { align: 'center' });
    
    doc.setTextColor(70, 130, 180);
    doc.text('ATION', pageWidth / 2 + 7, 13, { align: 'center' });
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Ref: ${quotation.quoteNumber}`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SILVER MAID', pageWidth - margin, 12, { align: 'right' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'light');
    doc.setTextColor(0, 0, 0);
    doc.text('CLEANING', pageWidth - margin, 19, { align: 'right' });
  };

  addHeader();
  yPos = 32;

  // ==================== QUOTATION INFO BAR ====================
  doc.setFillColor(248, 248, 248);
  doc.rect(margin, yPos - 2, pageWidth - (2 * margin), 8, 'F');
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('REF:', margin + 1, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quoteNumber, margin + 12, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('ISSUE:', pageWidth / 2 - 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.date), pageWidth / 2 - 7, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('VALID:', pageWidth - margin - 15, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.validUntil), pageWidth - margin - 2, yPos, { align: 'right' });

  yPos += 11;

  // ==================== FROM / TO SECTION ====================
  checkPageBreak(32);

  const fromToBaseY = yPos - 1;
  let fromToContentHeight = 24;
  
  if (quotation.company) {
    fromToContentHeight += 3;
  }
  
  const fromToBoxHeight = fromToContentHeight;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, fromToBaseY, pageWidth - (2 * margin), fromToBoxHeight, 'F');
  
  doc.setFillColor(255, 105, 180);
  doc.rect(margin, fromToBaseY, 2, fromToBoxHeight, 'F');
  
  doc.setFillColor(70, 130, 180);
  doc.rect(pageWidth - margin - 2, fromToBaseY, 2, fromToBoxHeight, 'F');
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(margin, fromToBaseY, pageWidth - (2 * margin), fromToBoxHeight, 'S');

  // FROM Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('FROM:', margin + 4, fromToBaseY + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 80);
  
  let fromY = fromToBaseY + 8;
  doc.text('SILVER MAID CLEANING', margin + 4, fromY);
  fromY += 3;
  doc.text('Al Quoz Ind Area 1', margin + 4, fromY);
  fromY += 3;
  doc.text('Dubai, UAE', margin + 4, fromY);
  fromY += 4;
  doc.setTextColor(0, 0, 0);
  doc.text('+971 800 4663', margin + 4, fromY);
  fromY += 3;
  doc.text('info@silvermaid.ae', margin + 4, fromY);

  doc.setDrawColor(220, 220, 220);
  doc.line(pageWidth / 2, fromToBaseY, pageWidth / 2, fromToBaseY + fromToBoxHeight);

  // TO Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('TO:', pageWidth / 2 + 4, fromToBaseY + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 80);
  
  let toY = fromToBaseY + 8;
  const clientName = quotation.client || 'Valued Customer';
  doc.text(clientName, pageWidth / 2 + 4, toY);
  toY += 3;
  
  const companyName = quotation.company || '';
  if (companyName) {
    doc.text(companyName, pageWidth / 2 + 4, toY);
    toY += 3;
  }
  
  const location = quotation.location || 'Dubai, UAE';
  doc.text(location, pageWidth / 2 + 4, toY);
  toY += 4;
  
  doc.setTextColor(0, 0, 0);
  const clientPhone = quotation.phone || '+971 XX XXX';
  doc.text(clientPhone, pageWidth / 2 + 4, toY);
  toY += 3;
  
  const clientEmail = quotation.email || 'client@email.com';
  doc.text(clientEmail, pageWidth / 2 + 4, toY);

  yPos = fromToBaseY + fromToBoxHeight + 3;

  // ==================== SECTION TITLE ====================
  checkPageBreak(15);
  
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos - 1, pageWidth - (2 * margin), 8, 'F');
  
  doc.setFillColor(255, 105, 180);
  doc.rect(margin, yPos - 1, (pageWidth - (2 * margin)) / 2, 1.5, 'F');
  
  doc.setFillColor(70, 130, 180);
  doc.rect(margin + ((pageWidth - (2 * margin)) / 2), yPos - 1, (pageWidth - (2 * margin)) / 2, 1.5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text('SERVICES & PRODUCTS', pageWidth / 2, yPos + 4, { align: 'center' });

  yPos += 9;

  // ==================== ITEMS TABLE ====================
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

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'DESCRIPTION', 'QTY', 'PRICE', 'TOTAL']],
    body: allItems.map((item, index) => [
      index + 1,
      { 
        content: `${item.name}${item.description ? '\n' + item.description : ''}`,
        styles: { valign: 'middle' }
      },
      item.quantity,
      { 
        content: formatCurrency(item.unitPrice),
        styles: { halign: 'right', fontStyle: 'normal' }
      },
      { 
        content: formatCurrency(item.total),
        styles: { halign: 'right', fontStyle: 'bold' }
      }
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [135, 206, 235],
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
      lineWidth: 0
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    styles: { 
      fontSize: 6.5,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [230, 230, 230],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 23, halign: 'center' },
      1: { cellWidth: 88, halign: 'left' },
      2: { cellWidth: 23, halign: 'center' },
      3: { cellWidth: 23, halign: 'right' },
      4: { cellWidth: 23, halign: 'right' }
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      addHeader();
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 4;

  // ==================== FINANCIAL SUMMARY ====================
  checkPageBreak(35);

  const summaryWidth = 105;
  const summaryX = pageWidth - margin - summaryWidth;

  let summaryLines = 3;
  if (quotation.discountAmount > 0) {
    summaryLines += 1;
  }
  
  const summaryContentHeight = (summaryLines * 4) + 8;
  const summaryBoxHeight = summaryContentHeight + 1;

  doc.setFillColor(250, 250, 250);
  doc.rect(summaryX - 1, yPos - 2, summaryWidth + 2, summaryBoxHeight, 'F');
  
  doc.setFillColor(230, 230, 230);
  doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'F');
  
  doc.setFillColor(255, 105, 180);
  doc.rect(summaryX, yPos - 1, summaryWidth / 2, 2, 'F');
  
  doc.setFillColor(70, 130, 180);
  doc.rect(summaryX + (summaryWidth / 2), yPos - 1, summaryWidth / 2, 2, 'F');
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(summaryX, yPos - 1, summaryWidth, summaryBoxHeight - 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text('FINANCIAL SUMMARY', summaryX + (summaryWidth / 2), yPos + 5, { align: 'center' });

  let summaryY = yPos + 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const lineHeight = 4;
  
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', summaryX + 5, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(formatCurrency(quotation.subtotal), summaryX + summaryWidth - 5, summaryY, { align: 'right' });
  summaryY += lineHeight;
  
  if (quotation.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const discountText = quotation.discountType === 'percentage' 
      ? `Disc (${quotation.discount}%):` : 'Discount:';
    doc.text(discountText, summaryX + 5, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 105, 180);
    doc.text(`- ${formatCurrency(quotation.discountAmount)}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
    summaryY += lineHeight;
  }
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`VAT (${quotation.taxRate}%):`, summaryX + 5, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 130, 180);
  doc.text(formatCurrency(quotation.taxAmount), summaryX + summaryWidth - 5, summaryY, { align: 'right' });
  summaryY += lineHeight + 1;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);
  doc.line(summaryX + 5, summaryY - 1, summaryX + summaryWidth - 5, summaryY - 1);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', summaryX + 5, summaryY + 2);
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(formatCurrency(quotation.total), summaryX + summaryWidth - 5, summaryY + 2, { align: 'right' });

  yPos += summaryBoxHeight + 3;

  // ==================== NOTES SECTION ====================
  if (quotation.notes) {
    checkPageBreak(20);
    
    const notesLabel = 'PAYMENT TERMS';
    doc.setFillColor(255, 240, 245);
    doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(notesLabel, pageWidth / 2, yPos + 1, { align: 'center' });

    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - (2 * margin) - 10);
    
    const notesRequiredSpace = (notesLines.length * 4) + 5;
    
    if (yPos + notesRequiredSpace > pageHeight - 15) {
      doc.addPage();
      currentPage++;
      yPos = margin;
      addHeader();
      yPos = 32;
    }
    
    doc.text(notesLines, margin + 5, yPos);
    yPos += notesLines.length * 4 + 5;
  }
  
  // ==================== TERMS SECTION (WITHOUT (Cont.)) ====================
  if (quotation.terms) {
    checkPageBreak(12);
    
    const termsLabel = 'TERMS AND CONDITIONS';
    doc.setFillColor(235, 245, 250);
    doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(termsLabel, pageWidth / 2, yPos + 1, { align: 'center' });

    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    
    const termsLines = doc.splitTextToSize(quotation.terms, pageWidth - (2 * margin) - 10);
    
    // Print terms with proper formatting on multiple pages
    let termsIndex = 0;
    let currentY = yPos;
    
    while (termsIndex < termsLines.length) {
      const availableSpace = pageHeight - 15 - currentY;
      const maxLinesPerPage = Math.floor(availableSpace / 4);
      
      if (maxLinesPerPage <= 0) {
        doc.addPage();
        currentPage++;
        currentY = margin;
        addHeader();
        currentY = 32;
        continue;
      }
      
      const linesForThisPage = Math.min(maxLinesPerPage, termsLines.length - termsIndex);
      const pageLines = termsLines.slice(termsIndex, termsIndex + linesForThisPage);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(pageLines, margin + 5, currentY);
      
      termsIndex += linesForThisPage;
      currentY += pageLines.length * 4;
      
      // Agar next page pe continue karna hai to simple terms header with same label
      if (termsIndex < termsLines.length) {
        doc.addPage();
        currentPage++;
        currentY = margin;
        addHeader();
        currentY = 32;
        
        // Simple header with same label (without Cont.)
        doc.setFillColor(235, 245, 250);
        doc.rect(pageWidth / 2 - 18, currentY - 3, 36, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(termsLabel, pageWidth / 2, currentY + 1, { align: 'center' });
        currentY += 8;
      }
    }
    
    yPos = currentY + 2;
  }
  
  // ==================== CONFIRMATION LETTER SECTION (FIXED) ====================
  if (quotation.confirmationLetter && quotation.confirmationLetter.trim() !== '') {
    // Pehle se check karo ke space hai ya nahi
    checkPageBreak(10);
    
    const confirmLines = doc.splitTextToSize(quotation.confirmationLetter, pageWidth - (2 * margin) - 10);
    const acceptanceText = `We accept the terms & conditions of your above quotation with Quotation No: ${quotation.quoteNumber} dated on ${formatDate(quotation.date)}`;
    const acceptLines = doc.splitTextToSize(acceptanceText, pageWidth - (2 * margin) - 10);
    
    // Confirmation letter ke liye space check karo
    const totalConfirmHeight = 8 + (confirmLines.length * 4) + 4 + (acceptLines.length * 4) + 6 + 35 + 5;
    
    console.log('yPos:', yPos, 'pageHeight:', pageHeight, 'totalConfirmHeight:', totalConfirmHeight);
    
    if (yPos + totalConfirmHeight > pageHeight - 15) {
      console.log('Not enough space, adding new page for confirmation letter');
      doc.addPage();
      currentPage++;
      yPos = margin;
      addHeader();
      yPos = 32;
    }
    
    const confirmLabel = 'CONFIRMATION LETTER';
    doc.setFillColor(230, 245, 230);
    doc.rect(pageWidth / 2 - 18, yPos - 3, 36, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 100, 0);
    doc.text(confirmLabel, pageWidth / 2, yPos + 1, { align: 'center' });

    yPos += 8;
    
    // Print confirmation letter content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(confirmLines, margin + 5, yPos);
    yPos += confirmLines.length * 4 + 4;
    
    // Print acceptance text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text(acceptLines, margin + 5, yPos);
    yPos += acceptLines.length * 4 + 6;
    
    // Signature div ke liye space check karo
    if (yPos + 35 > pageHeight - 15) {
      console.log('Not enough space for signature div, adding new page');
      doc.addPage();
      currentPage++;
      yPos = margin;
      addHeader();
      yPos = 32;
    }
    
    // ===== CENTERED SIGNATURE DIV =====
    const signatureDivWidth = 140;
    const signatureDivX = (pageWidth - signatureDivWidth) / 2;
    const signatureDivY = yPos;
    const signatureDivHeight = 35;
    
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(signatureDivX, signatureDivY, signatureDivWidth, signatureDivHeight, 'S');
    
    doc.setFillColor(250, 250, 250);
    doc.rect(signatureDivX, signatureDivY, signatureDivWidth, signatureDivHeight, 'F');
    
    // Signature Line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 80);
    doc.text('Signature:', signatureDivX + 10, signatureDivY + 13);
    
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(signatureDivX + 35, signatureDivY + 13, signatureDivX + 100, signatureDivY + 13);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(4.5);
    doc.setTextColor(150, 150, 150);
    doc.text('(Sign here)', signatureDivX + 65, signatureDivY + 16, { align: 'center' });
    
    // Date Line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(80, 80, 80);
    doc.text('Date:', signatureDivX + 10, signatureDivY + 24);
    
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(signatureDivX + 35, signatureDivY + 24, signatureDivX + 100, signatureDivY + 24);
    
    const todayForSig = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.setTextColor(180, 180, 180);
    doc.text(todayForSig, signatureDivX + 40, signatureDivY + 22);
    
    // Stamp box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(signatureDivX + 110, signatureDivY + 7, 18, 18, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.setTextColor(150, 150, 150);
    doc.text('STAMP', signatureDivX + 119, signatureDivY + 15, { align: 'center' });
    
    yPos += signatureDivHeight + 5;
    
    console.log('Confirmation letter added successfully at yPos:', yPos);
  }
  
  // ==================== BANK DETAILS SECTION ====================
  if (quotation.bankDetails) {
    // Calculate space needed for bank details
    const bankDetailsHeight = 8 + (5 * 4) + 3; // header + 5 lines + margin
    
    if (yPos + bankDetailsHeight > pageHeight - 15) {
      doc.addPage();
      currentPage++;
      yPos = margin;
      addHeader();
      yPos = 32;
    }
    
    const bankLabel = 'BANK ACCOUNT DETAILS (AED)';
    doc.setFillColor(235, 245, 250);
    doc.rect(pageWidth / 2 - 22, yPos - 3, 44, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(bankLabel, pageWidth / 2, yPos + 1, { align: 'center' });

    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    
    const bankDetails = [
      ['Account Name:', quotation.bankDetails.accountName || 'SILVER MAID CLEANING SERVICES LLC'],
      ['Account Number:', quotation.bankDetails.accountNumber || '1234567890123'],
      ['Bank Name:', quotation.bankDetails.bankName || 'Emirates NBD'],
      ['SWIFT Code:', quotation.bankDetails.swiftCode || 'EBILAEAD'],
      ['IBAN Number:', quotation.bankDetails.iban || 'AE180260001234567890123']
    ];
    
    let bankY = yPos;
    const leftColX = margin + 8;
    const rightColX = margin + 45;
    
    bankDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(label, leftColX, bankY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(value, rightColX, bankY);
      
      bankY += 4;
    });
    
    yPos = bankY + 3;
  }
  
  // ==================== MINIMAL FOOTER ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 6;
    
    doc.setFillColor(255, 105, 180);
    doc.rect(margin, footerY - 3, (pageWidth - (2 * margin)) / 2, 0.2, 'F');
    doc.setFillColor(70, 130, 180);
    doc.rect(margin + ((pageWidth - (2 * margin)) / 2), footerY - 3, (pageWidth - (2 * margin)) / 2, 0.2, 'F');
    
    doc.setFontSize(4.5);
    doc.setTextColor(100, 100, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('HW', margin, footerY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`${i}/${totalPages} | ${quotation.quoteNumber}`, pageWidth - margin, footerY, { align: 'right' });
  }
  
  const fileName = `Quotation_${quotation.quoteNumber.replace('#', '')}_${(quotation.client || 'Client').replace(/\s+/g, '_')}.pdf`;
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  return { pdf: doc, fileName, blobUrl };
};

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' AED';
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, ' ');
};

export const downloadPDF = (quotation: QuotationData) => {
  const { pdf, fileName } = generateQuotationPDF(quotation);
  pdf.save(fileName);
};

export const getPDFAsBlob = (quotation: QuotationData): Blob => {
  const { pdf } = generateQuotationPDF(quotation);
  return pdf.output('blob');
};