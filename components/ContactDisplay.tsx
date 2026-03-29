"use client";

import { useContactInfo } from '@/contexts/ContactContext';
import Link from 'next/link';

interface ContactDisplayProps {
  type?: 'link' | 'text' | 'both';
  displayType?: 'phone' | 'email' | 'both';
  className?: string;
}

const normalizeWhatsAppNumber = (value: string) => value.replace(/[^\d]/g, '');

export function ContactPhone({ className = '' }: { className?: string }) {
  const { contact } = useContactInfo();
  return (
    <a 
      href={`tel:${contact.phone}`}
      className={className}
    >
      {contact.phone}
    </a>
  );
}

export function ContactEmail({ className = '' }: { className?: string }) {
  const { contact } = useContactInfo();
  return (
    <a 
      href={`mailto:${contact.email}`}
      className={className}
    >
      {contact.email}
    </a>
  );
}

export function ContactPhoneLink(props: ContactDisplayProps) {
  const { contact } = useContactInfo();
  const { className = '' } = props;
  
  return (
    <a 
      href={`tel:${contact.phone}`}
      className={className}
    >
      {contact.phone}
    </a>
  );
}

export function ContactEmailLink(props: ContactDisplayProps) {
  const { contact } = useContactInfo();
  const { className = '' } = props;
  
  return (
    <a 
      href={`mailto:${contact.email}`}
      className={className}
    >
      {contact.email}
    </a>
  );
}

export function ContactWhatsAppLink({ className = '' }: { className?: string }) {
  const { contact } = useContactInfo();
  const number = normalizeWhatsAppNumber(contact.whatsapp || contact.phone);
  const href = number ? `https://wa.me/${number}` : '#';

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {contact.whatsapp || contact.phone}
    </a>
  );
}

export function getContactPhone() {
  // This is for use in non-client components or static generation
  return '80046639675';
}

export function getContactEmail() {
  // This is for use in non-client components or static generation
  return 'info@silvermaid.ae';
}
