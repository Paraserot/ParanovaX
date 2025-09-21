
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Client } from './clients';

export interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  total: number;
}

export type Invoice = {
  id?: string;
  invoiceNumber: string;
  client: Pick<Client, 'id' | 'firmName' | 'firstName' | 'lastName'>;
  employeeId?: string; // The staff who made the sale
  items: InvoiceItem[];
  subTotal: number;
  tax: number; // This is now the tax rate
  total: number;
  invoiceDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt?: string;
  paidAmount?: number;
};

const invoicesCollection = collection(db, 'invoices');
const countersCollection = doc(db, 'counters', 'invoices');

async function getNextInvoiceNumber(): Promise<string> {
    const newNumber = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(countersCollection);
        let currentNumber = 0;
        if (counterSnap.exists()) {
            currentNumber = counterSnap.data().current_number || 0;
        }
        const newNumber = currentNumber + 1;
        transaction.set(countersCollection, { current_number: newNumber }, { merge: true });
        return newNumber;
    });

    const year = new Date().getFullYear();
    return `INV-${year}-${newNumber.toString().padStart(4, '0')}`;
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>): Promise<string> {
  try {
    const invoiceNumber = await getNextInvoiceNumber();
    const docRef = await addDoc(invoicesCollection, {
      ...invoiceData,
      invoiceNumber,
      invoiceDate: new Date(invoiceData.invoiceDate),
      dueDate: new Date(invoiceData.dueDate),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding invoice: ", error);
    throw new Error("Failed to add invoice.");
  }
}

export async function updateInvoice(id: string, updates: Partial<Invoice>) {
  const invoiceDoc = doc(db, 'invoices', id);
  const dataToUpdate: any = { ...updates };

  if (updates.invoiceDate) dataToUpdate.invoiceDate = new Date(updates.invoiceDate);
  if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate);
  // Ensure the client object only contains the ID, not the full object if it was passed accidentally
  if(updates.client) dataToUpdate.client = { id: updates.client.id, firmName: updates.client.firmName, firstName: updates.client.firstName, lastName: updates.client.lastName };

  delete dataToUpdate.id; // Don't try to update the ID
  
  await updateDoc(invoiceDoc, dataToUpdate);
}

export async function deleteInvoice(id: string) {
  const invoiceDoc = doc(db, 'invoices', id);
  await deleteDoc(invoiceDoc);
}
