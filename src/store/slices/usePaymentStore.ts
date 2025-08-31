
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/services/payments';

interface PaymentStore {
  payments: Payment[];
  loading: boolean;
  fetched: boolean;
  fetchPayments: (force?: boolean) => Promise<void>;
}

const toSerializablePayment = (docSnap: any): Payment => {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      paymentDate: (data.paymentDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Payment;
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  loading: false,
  fetched: false,
  fetchPayments: async (force = false) => {
    if (!force && get().fetched) {
        set({ loading: false });
        return;
    }

    set({ loading: true });
    try {
        const q = query(collection(db, "payments"), orderBy("paymentDate", "desc"));
        const snapshot = await getDocs(q);
        const newPayments = snapshot.docs.map(toSerializablePayment);
        set({ payments: newPayments, loading: false, fetched: true });
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      set({ loading: false });
    }
  },
}));

