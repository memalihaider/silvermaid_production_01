// lib/gmailService.ts
interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  pdfAttachment?: {
    filename: string;
    content: string; // base64 encoded
  };
}

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
}

// Generate HTML email template
export const generateEmailTemplate = (quotation: QuotationData): { html: string, text: string } => {
  const items = [...(quotation.services || []), ...(quotation.products || [])];
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation ${quotation.quoteNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000000; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #ffffff; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-box { background-color: #000000; color: white; padding: 20px; text-align: right; font-weight: bold; margin: 20px 0; }
        .highlight { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f2f2f2; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 12px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">QUOTATION</h1>
            <h2 style="margin: 10px 0; font-size: 20px;">${quotation.quoteNumber}</h2>
            <p style="margin: 5px 0; opacity: 0.9;">Date: ${formatDate(quotation.date)} | Valid Until: ${formatDate(quotation.validUntil)}</p>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Dear ${quotation.client},</h2>
           
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #000;">Client Information</h3>
                <p><strong>Client:</strong> ${quotation.client}</p>
                <p><strong>Company:</strong> ${quotation.company}</p>
                <p><strong>Email:</strong> ${quotation.email}</p>
                <p><strong>Phone:</strong> ${quotation.phone || 'N/A'}</p>
                <p><strong>Location:</strong> ${quotation.location || 'Dubai, UAE'}</p>
            </div>
            
            ${items.length > 0 ? `
            <h3 style="color: #000; margin-top: 30px;">Items Summary</h3>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price (AED)</th>
                        <th style="text-align: right;">Total (AED)</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                    <tr>
                        <td>${item.name || 'Item'}</td>
                        <td style="text-align: center;">${item.quantity || 1}</td>
                        <td style="text-align: right;">${(item.unitPrice || 0).toLocaleString()}</td>
                        <td style="text-align: right;">${(item.total || 0).toLocaleString()}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : ''}
            
            <h3 style="color: #000; margin-top: 30px;">Financial Summary</h3>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>Subtotal:</span>
                    <span>${quotation.subtotal?.toLocaleString()} AED</span>
                </div>
                ${quotation.discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #28a745;">
                    <span>Discount ${quotation.discountType === 'percentage' ? `(${quotation.discount}%)` : ''}:</span>
                    <span>-${quotation.discountAmount?.toLocaleString()} AED</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                    <span>Tax (${quotation.taxRate}%):</span>
                    <span>${quotation.taxAmount?.toLocaleString()} AED</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 20px 0; padding-top: 20px; border-top: 2px solid #ddd; font-weight: bold; font-size: 18px;">
                    <span>TOTAL AMOUNT:</span>
                    <span>${quotation.total?.toLocaleString()} AED</span>
                </div>
            </div>
            
            ${quotation.notes ? `
            <div class="highlight">
                <h4 style="margin-top: 0; color: #856404;">Notes:</h4>
                <p>${quotation.notes}</p>
            </div>
            ` : ''}
            
            ${quotation.terms ? `
            <div style="margin-top: 30px;">
                <h4 style="color: #000;">Terms & Conditions:</h4>
                <p>${quotation.terms}</p>
            </div>
            ` : ''}
            
            <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              
                Please review this quotation and let us know if you have any questions.<br>
                You can reply directly to this email or contact us at your convenience.
            </p>
            
            <p style="margin-top: 30px;">
                Best regards,<br>
                <strong style="font-size: 16px;">Your Company Team</strong><br>
                <span style="color: #666; font-size: 14px;">Sales Department</span>
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-size: 11px; color: #888;">
               
                If you have any questions, please contact us at info@yourcompany.com or call +971 4 123 4567
            </p>
            <p style="margin: 10px 0 0 0; font-size: 10px; color: #aaa;">
                © ${new Date().getFullYear()} Your Company. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

  const text = `
QUOTATION ${quotation.quoteNumber}

Dear ${quotation.client},

Please find attached our detailed quotation for your review.

CLIENT INFORMATION:
- Client: ${quotation.client}
- Company: ${quotation.company}
- Email: ${quotation.email}
- Phone: ${quotation.phone || 'N/A'}
- Location: ${quotation.location || 'Dubai, UAE'}
- Date: ${formatDate(quotation.date)}
- Valid Until: ${formatDate(quotation.validUntil)}

ITEMS SUMMARY:
${items.map(item => `• ${item.name || 'Item'}: ${item.quantity || 1} × ${(item.unitPrice || 0).toLocaleString()} AED = ${(item.total || 0).toLocaleString()} AED`).join('\n')}

FINANCIAL SUMMARY:
Subtotal: ${quotation.subtotal?.toLocaleString()} AED
${quotation.discountAmount > 0 ? `Discount ${quotation.discountType === 'percentage' ? `(${quotation.discount}%)` : ''}: -${quotation.discountAmount?.toLocaleString()} AED\n` : ''}
Tax (${quotation.taxRate}%): ${quotation.taxAmount?.toLocaleString()} AED
TOTAL AMOUNT: ${quotation.total?.toLocaleString()} AED

${quotation.notes ? `NOTES:\n${quotation.notes}\n` : ''}
${quotation.terms ? `TERMS & CONDITIONS:\n${quotation.terms}\n` : ''}



Please review this quotation and let us know if you have any questions.

Best regards,
Your Company Team
Sales Department


© ${new Date().getFullYear()} Your Company. All rights reserved.
`;

  return { html, text };
};

// Send email with Gmail API (Using Gmail Web Interface)
export const sendEmailWithAttachment = async (
  quotation: QuotationData,
  pdfBlob: Blob,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    // Convert PDF to base64
    const pdfBase64 = await blobToBase64(pdfBlob);
    
    // Generate email content
    const emailContent = generateEmailTemplate(quotation);
    
    // Create email subject
    const subject = `Quotation ${quotation.quoteNumber} - ${quotation.company}`;
    
    // Create mailto link with Gmail compose URL
    const gmailComposeUrl = createGmailComposeUrl({
      to: quotation.email,
      subject: subject,
      body: emailContent.text,
      attachment: {
        filename: `Quotation_${quotation.quoteNumber.replace('#', '')}.pdf`,
        base64: pdfBase64
      }
    });
    
    // Open Gmail compose window
    window.open(gmailComposeUrl, '_blank');
    
    // Show success message
    if (onSuccess) onSuccess();
    
  } catch (error) {
    console.error('Error preparing email:', error);
    if (onError) onError('Failed to prepare email');
  }
};

// Create Gmail compose URL
const createGmailComposeUrl = (options: {
  to: string;
  subject: string;
  body: string;
  attachment?: {
    filename: string;
    base64: string;
  };
}): string => {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: options.to,
    su: options.subject,
    body: options.body
  });
  
  // Note: Gmail doesn't support attachments via URL parameters
  // The attachment will need to be added manually by the user
  return `https://mail.google.com/mail/?${params.toString()}`;
};

// Alternative: Use EmailJS service for automated sending
export const sendEmailWithEmailJS = async (
  quotation: QuotationData,
  pdfBlob: Blob
): Promise<boolean> => {
  try {
    // First, set up EmailJS (https://www.emailjs.com)
    // You'll need to:
    // 1. Sign up at emailjs.com
    // 2. Create an email template
    // 3. Get your Service ID, Template ID, and Public Key
    
    const SERVICE_ID = 'YOUR_SERVICE_ID';
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
    
    // Convert PDF to base64
    const pdfBase64 = await blobToBase64(pdfBlob);
    
    // Prepare template parameters
    const templateParams = {
      to_email: quotation.email,
      to_name: quotation.client,
      from_name: 'Your Company',
      subject: `Quotation ${quotation.quoteNumber} - ${quotation.company}`,
      client_name: quotation.client,
      company_name: quotation.company,
      quote_number: quotation.quoteNumber,
      quote_date: formatDate(quotation.date),
      valid_until: formatDate(quotation.validUntil),
      total_amount: `${quotation.total?.toLocaleString()} ${quotation.currency}`,
      attachment: pdfBase64,
      attachment_name: `Quotation_${quotation.quoteNumber.replace('#', '')}.pdf`
    };
    
    // Send email using EmailJS
    // await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    
    return true;
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
};

// Helper functions
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};