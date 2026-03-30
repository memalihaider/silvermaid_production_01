"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export interface ContactInfo {
  phone: string;
  email: string;
  company: string;
  address: string;
  whatsapp: string;
}

const defaultContact: ContactInfo = {
  phone: '+96105 888 44 151',
  email: 'Info@silvermaidsdubai.com',
  company: 'silvermaid',
  address: "Same Oman Trading building, Apt G - 01 Al Badaa' St - near Bus station - Al Satwa - Dubai",
  whatsapp: '+96105 888 44 151'
};

interface ContactContextType {
  contact: ContactInfo;
  isLoading: boolean;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Set up real-time listener for profile changes
      const unsubscribe = onSnapshot(
        doc(db, 'profile-setting', 'admin-settings'),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) {
              setContact({
                phone: data.profile.phone || defaultContact.phone,
                email: data.profile.email || defaultContact.email,
                company: data.profile.company || defaultContact.company,
                address: data.profile.address || defaultContact.address,
                whatsapp: data.profile.whatsapp || defaultContact.whatsapp
              });
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error listening to contact info:', error);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up contact listener:', error);
      setIsLoading(false);
    }
  }, []);

  return (
    <ContactContext.Provider value={{ contact, isLoading }}>
      {children}
    </ContactContext.Provider>
  );
}

export function useContactInfo() {
  const context = useContext(ContactContext);
  if (context === undefined) {
    console.warn('useContactInfo must be used within ContactProvider');
    return { contact: defaultContact, isLoading: false };
  }
  return context;
}
