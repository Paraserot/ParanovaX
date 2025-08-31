
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice } from '@/services/invoices';

interface InvoiceStore {
  invoices: Invoice[];
  loading: boolean;
  fetched: boolean;
  fetchInvoices: (force?: boolean) => Promise<void>;
}

const toSerializableInvoice = (docSnap: any): Invoice => {
    const data = docSnap.data();
    return { 
        id: docSnap.id,
        ...data,
        invoiceDate: (data.invoiceDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Invoice;
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  loading: false,
  fetched: false,
  fetchInvoices: async (force = false) => {
    if (!force && get().fetched) return;

    set({ loading: true });
    try {
      const q = query(collection(db, "invoices"), orderBy("invoiceDate", "desc"));
      const snapshot = await getDocs(q);
      const newInvoices = snapshot.docs.map(toSerializableInvoice);
      
      set({ invoices: newInvoices, fetched: true, loading: false });
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      set({ loading: false });
    }
  },
}));

    