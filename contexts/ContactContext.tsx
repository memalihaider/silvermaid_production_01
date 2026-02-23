"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export interface ContactInfo {
  phone: string;
  email: string;
  company: string;
  address: string;
}

const defaultContact: ContactInfo = {
  phone: '80046639675',
  email: 'info@silvermaid.ae',
  company: 'silvermaid',
  address: 'Office: 201, 2nd Floor, Al Saaha Offices - B, Downtown Dubai - UAE'
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
                address: data.profile.address || defaultContact.address
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
