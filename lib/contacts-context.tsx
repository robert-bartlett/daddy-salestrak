import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MOCK_CONTACTS,
  type Contact,
  type ContactType,
} from './mock-data';

type CreateContactInput = {
  name: string;
  email?: string;
  phone?: string;
  type: ContactType;
  companyName?: string;
};

type UpdateContactInput = Partial<CreateContactInput>;

type ContactsContextValue = {
  contacts: Contact[];
  getContactById: (id: string) => Contact | undefined;
  addContact: (data: CreateContactInput) => Contact;
  updateContact: (id: string, data: UpdateContactInput) => void;
  deleteContact: (id: string) => void;
};

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(() =>
    MOCK_CONTACTS.map((c) => ({ ...c }))
  );

  const getContactById = useCallback(
    (id: string) => {
      return contacts.find((c) => c.id === id);
    },
    [contacts]
  );

  const addContact = useCallback((data: CreateContactInput): Contact => {
    const now = new Date();
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      companyName: data.companyName,
      createdAt: now,
      updatedAt: now,
    };

    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, data: UpdateContactInput) => {
    const now = new Date();
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? { ...contact, ...data, updatedAt: now }
          : contact
      )
    );
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      contacts,
      getContactById,
      addContact,
      updateContact,
      deleteContact,
    }),
    [contacts, getContactById, addContact, updateContact, deleteContact]
  );

  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
