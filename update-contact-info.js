#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const servicesDir = 'app/(public)/services';
const files = globSync(`${servicesDir}/**/page.tsx`, { ignore: [`${servicesDir}/[slug]/**`, `${servicesDir}/page.tsx`] });

console.log(`Found ${files.length} service pages to update...`);

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import if not already present
  if (!content.includes('ContactDisplay')) {
    const importAdd = "import { ContactPhone, ContactEmail } from '@/components/ContactDisplay'";
    
    // Find the lucide-react import line and add after it
    if (content.includes("from 'lucide-react'")) {
      content = content.replace(
        /from 'lucide-react'/,
        `from 'lucide-react'\nimport { ContactPhone, ContactEmail } from '@/components/ContactDisplay'`
      );
    }
  }
  
  // Replace hardcoded phone links 
  content = content.replace(
    /href={`tel:80046639675`}/g,
    'href={`tel:${contact.phone}`}'
  );
  
  // Replace Contact Us button phone
  content = content.replace(
    /href="tel:80046639675"/g,
    'href="tel:${contact.phone}"'
  );
  
  // Replace hardcoded email links
  content = content.replace(
    /href={`mailto:info@silvermaid\.ae`}/g,
    'href={`mailto:${contact.email}`}'
  );
  
  content = content.replace(
    /href="mailto:info@silvermaid\.ae"/g,
    'href="mailto:${contact.email}"'
  );
  
  // Replace displayed phone text
  content = content.replace(
    />\s*800 4663 9675\s*</g,
    '><ContactPhone /><'
  );
  
  content = content.replace(
    /'800 4663 9675'/g,
    '{contact.phone}'
  );
  
  // Replace displayed email text
  content = content.replace(
    />\s*Email Us\s*</g,
    '><ContactEmail /><'
  );
  
  fs.writeFileSync(file, content);
  console.log(`✅ Updated: ${file}`);
});

console.log('✨ All service pages updated successfully!');
