// // lib/whatsappService.ts
// import { getPDFAsBlob } from './pdfGenerator';

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
//   paymentMethods: string[];
//   services: any[];
//   products: any[];
//   // Add missing properties from pdfGenerator's QuotationData
//   createdAt?: string | Date;
//   updatedAt?: string | Date;
//   createdBy?: string;
// }

// // Format phone number for WhatsApp
// export const formatPhoneForWhatsApp = (phone: string): string => {
//   if (!phone) return '';
  
//   // Remove all non-numeric characters except +
//   let cleaned = phone.replace(/[^\d+]/g, '');
  
//   // If number doesn't start with +, add UAE country code
//   if (!cleaned.startsWith('+')) {
//     if (cleaned.startsWith('05')) {
//       // UAE mobile number starting with 05
//       cleaned = '+971' + cleaned.substring(1);
//     } else if (cleaned.startsWith('5') && cleaned.length === 9) {
//       // UAE mobile number starting with 5 (9 digits)
//       cleaned = '+971' + cleaned;
//     } else if (cleaned.startsWith('04') || cleaned.startsWith('02') || cleaned.startsWith('03')) {
//       // UAE landline number
//       cleaned = '+971' + cleaned;
//     } else if (cleaned.length === 10) {
//       // Assume UAE number without country code
//       cleaned = '+971' + cleaned.substring(1);
//     } else {
//       // Default to UAE country code
//       cleaned = '+971' + cleaned;
//     }
//   }
  
//   return cleaned;
// };

// // Generate WhatsApp message
// export const generateWhatsAppMessage = (quotation: QuotationData): string => {
//   const items = [...(quotation.services || []), ...(quotation.products || [])];
  
//   let message = `*Quotation ${quotation.quoteNumber}*\n`;
//   message += `*Date:* ${formatDate(quotation.date)}\n`;
//   message += `*Valid Until:* ${formatDate(quotation.validUntil)}\n\n`;
  
//   message += `*Client Information:*\n`;
//   message += `Name: ${quotation.client}\n`;
//   message += `Company: ${quotation.company}\n`;
//   message += `Phone: ${quotation.phone}\n\n`;
  
//   if (items.length > 0) {
//     message += `*Items Summary:*\n`;
//     items.slice(0, 3).forEach(item => {
//       message += `• ${item.name}: ${item.quantity} × ${item.unitPrice} AED = ${item.total} AED\n`;
//     });
//     if (items.length > 3) {
//       message += `• Plus ${items.length - 3} more items\n`;
//     }
//     message += `\n`;
//   }
  
//   message += `*Financial Summary:*\n`;
//   message += `Subtotal: ${quotation.subtotal?.toLocaleString()} AED\n`;
//   if (quotation.discountAmount > 0) {
//     const discountText = quotation.discountType === 'percentage' 
//       ? `Discount (${quotation.discount}%):`
//       : 'Discount:';
//     message += `${discountText} -${quotation.discountAmount?.toLocaleString()} AED\n`;
//   }
//   message += `Tax (${quotation.taxRate}%): ${quotation.taxAmount?.toLocaleString()} AED\n`;
//   message += `*Total Amount: ${quotation.total?.toLocaleString()} AED*\n\n`;
  
//   if (quotation.notes) {
//     message += `*Notes:*\n${quotation.notes}\n\n`;
//   }
  
//   message += `A detailed PDF quotation is being sent separately.\n\n`;
//   message += `Please review and let us know if you have any questions.\n`;
//   message += `Thank you!`;
  
//   return encodeURIComponent(message);
// };

// // Open WhatsApp with message
// export const openWhatsAppWithMessage = (
//   phoneNumber: string,
//   message: string
// ): void => {
//   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
//   window.open(whatsappUrl, '_blank');
// };

// // Prepare quotation data for PDF generation
// const prepareQuotationData = (quotation: QuotationData): any => {
//   return {
//     ...quotation,
//     // Add missing properties with default values
//     createdAt: quotation.createdAt || new Date(),
//     updatedAt: quotation.updatedAt || new Date(),
//     createdBy: quotation.createdBy || 'system'
//   };
// };

// // Share PDF via WhatsApp Web
// export const sharePDFViaWhatsApp = async (
//   quotation: QuotationData,
//   onSuccess?: () => void,
//   onError?: (error: string) => void
// ): Promise<void> => {
//   try {
//     // Step 1: Prepare quotation data with all required properties
//     const preparedQuotation = prepareQuotationData(quotation);
    
//     // Step 2: Generate PDF
//     const pdfBlob = getPDFAsBlob(preparedQuotation);
//     const pdfFile = new File(
//       [pdfBlob],
//       `Quotation_${quotation.quoteNumber.replace('#', '')}_${quotation.client.replace(/\s+/g, '_')}.pdf`,
//       { type: 'application/pdf' }
//     );
    
//     // Step 3: Format phone number
//     const formattedPhone = formatPhoneForWhatsApp(quotation.phone);
//     if (!formattedPhone) {
//       throw new Error('Invalid phone number');
//     }
    
//     // Step 4: Generate WhatsApp message
//     const message = generateWhatsAppMessage(quotation);
    
//     // Step 5: Create WhatsApp share URL
//     const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${message}`;
    
//     // Step 6: Open WhatsApp Web
//     window.open(whatsappUrl, '_blank', 'width=800,height=600');
    
//     // Step 7: Guide user to attach PDF
//     setTimeout(() => {
//       alert(`📱 WhatsApp opened!\n\nPlease follow these steps:\n\n1. Wait for WhatsApp Web to load\n2. Click the paperclip icon (📎)\n3. Select "Document"\n4. Choose the PDF file:\n   "Quotation_${quotation.quoteNumber.replace('#', '')}.pdf"\n5. Click send\n\nNote: You need to have WhatsApp Web already connected.`);
//     }, 1500);
    
//     // Step 8: Download PDF for user to attach
//     const downloadUrl = URL.createObjectURL(pdfBlob);
//     const downloadLink = document.createElement('a');
//     downloadLink.href = downloadUrl;
//     downloadLink.download = `Quotation_${quotation.quoteNumber.replace('#', '')}.pdf`;
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);
//     URL.revokeObjectURL(downloadUrl);
    
//     if (onSuccess) onSuccess();
    
//   } catch (error) {
//     console.error('Error sharing via WhatsApp:', error);
//     if (onError) onError('Failed to open WhatsApp');
//   }
// };

// // Alternative: Use WhatsApp API (if you have Business API)
// export const sendWhatsAppViaAPI = async (
//   quotation: QuotationData,
//   pdfBlob: Blob
// ): Promise<boolean> => {
//   try {
//     // This would require WhatsApp Business API setup
//     // Steps:
//     // 1. Register for WhatsApp Business API
//     // 2. Get API credentials
//     // 3. Upload PDF to server
//     // 4. Send message with PDF link
    
//     const API_URL = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
//     const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
    
//     // Convert PDF to base64
//     const pdfBase64 = await blobToBase64(pdfBlob);
    
//     // First, upload media to Facebook
//     const mediaResponse = await fetch(`https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/media`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${ACCESS_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         file: pdfBase64,
//         type: 'document/pdf',
//         filename: `Quotation_${quotation.quoteNumber.replace('#', '')}.pdf`
//       })
//     });
    
//     const mediaData = await mediaResponse.json();
    
//     // Then send message with media
//     const messageResponse = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${ACCESS_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: formatPhoneForWhatsApp(quotation.phone),
//         type: 'document',
//         document: {
//           id: mediaData.id,
//           filename: `Quotation_${quotation.quoteNumber.replace('#', '')}.pdf`,
//           caption: `Quotation ${quotation.quoteNumber} for ${quotation.client}`
//         }
//       })
//     });
    
//     return messageResponse.ok;
    
//   } catch (error) {
//     console.error('WhatsApp API error:', error);
//     return false;
//   }
// };

// // Helper functions
// const formatDate = (dateString: string): string => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// const blobToBase64 = (blob: Blob): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64String = (reader.result as string).split(',')[1];
//       resolve(base64String);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// };

// new code
// lib/whatsappService.ts

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
  services: any[];
  products: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
}

// Format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If number doesn't start with +, add UAE country code
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('05')) {
      // UAE mobile number starting with 05
      cleaned = '+971' + cleaned.substring(1);
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
      // UAE mobile number starting with 5 (9 digits)
      cleaned = '+971' + cleaned;
    } else if (cleaned.startsWith('04') || cleaned.startsWith('02') || cleaned.startsWith('03')) {
      // UAE landline number
      cleaned = '+971' + cleaned;
    } else if (cleaned.length === 10) {
      // Assume UAE number without country code
      cleaned = '+971' + cleaned.substring(1);
    } else {
      // Default to UAE country code
      cleaned = '+971' + cleaned;
    }
  }
  
  // Remove any spaces or special characters
  cleaned = cleaned.replace(/\s/g, '');
  
  return cleaned;
};

// Generate complete WhatsApp message with all quotation details
export const generateWhatsAppMessage = (quotation: QuotationData): string => {
  let message = `*QUOTATION DETAILS*\n\n`;
  message += `*Quote #:* ${quotation.quoteNumber}\n`;
  message += `*Date:* ${formatDate(quotation.date)}\n`;
  message += `*Valid Until:* ${formatDate(quotation.validUntil)}\n\n`;
  
  message += `*CLIENT INFORMATION*\n`;
  message += `Name: ${quotation.client}\n`;
  message += `Company: ${quotation.company}\n`;
  message += `Location: ${quotation.location || 'N/A'}\n`;
  message += `Email: ${quotation.email || 'N/A'}\n`;
  message += `Phone: ${quotation.phone || 'N/A'}\n\n`;
  
  // Services section
  if (quotation.services && quotation.services.length > 0) {
    message += `*SERVICES*\n`;
    quotation.services.forEach((s, index) => {
      message += `${index + 1}. ${s.name || 'Service'}\n`;
      message += `   Qty: ${s.quantity} x ${quotation.currency} ${s.unitPrice} = ${quotation.currency} ${s.total}\n`;
      if (s.description) message += `   Note: ${s.description}\n`;
    });
    message += `\n`;
  }
  
  // Products section
  if (quotation.products && quotation.products.length > 0) {
    message += `*PRODUCTS*\n`;
    quotation.products.forEach((p, index) => {
      message += `${index + 1}. ${p.name || 'Product'}\n`;
      if (p.sku) message += `   SKU: ${p.sku}\n`;
      message += `   Qty: ${p.quantity} x ${quotation.currency} ${p.unitPrice} = ${quotation.currency} ${p.total}\n`;
    });
    message += `\n`;
  }
  
  // Price summary
  message += `*PRICE SUMMARY*\n`;
  message += `Subtotal: ${quotation.currency} ${(quotation.subtotal || 0).toFixed(2)}\n`;
  
  if (quotation.discount > 0) {
    const discountText = quotation.discountType === 'percentage' 
      ? `Discount (${quotation.discount}%)` 
      : 'Discount';
    message += `${discountText}: -${quotation.currency} ${(quotation.discountAmount || 0).toFixed(2)}\n`;
  }
  
  message += `Tax (${quotation.taxRate}%): ${quotation.currency} ${(quotation.taxAmount || 0).toFixed(2)}\n`;
  message += `*TOTAL AMOUNT: ${quotation.currency} ${(quotation.total || 0).toFixed(2)}*\n\n`;
  
  // Notes
  if (quotation.notes) {
    message += `*NOTES*\n${quotation.notes}\n\n`;
  }
  
  // Terms
  if (quotation.terms) {
    message += `*TERMS & CONDITIONS*\n${quotation.terms}\n\n`;
  }
  
  message += `Thank you for your business!\n`;
  message += `Please let us know if you have any questions.`;
  
  return message;
};

// Open WhatsApp with pre-filled message
export const openWhatsAppWithQuotation = (
  quotation: QuotationData,
  onSuccess?: () => void,
  onError?: (error: string) => void
): void => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneForWhatsApp(quotation.phone);
    
    if (!formattedPhone) {
      throw new Error('Invalid phone number');
    }
    
    // Generate complete message
    const message = generateWhatsAppMessage(quotation);
    
    // Create WhatsApp URL with encoded message
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    if (onSuccess) onSuccess();
    
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    if (onError) onError('Failed to open WhatsApp');
  }
};

// Simple function to open WhatsApp with just number and message
export const openWhatsApp = (phoneNumber: string, message: string): void => {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  if (!formattedPhone) return;
  
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};