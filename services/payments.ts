
"use client";

import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type Payment = {
  id?: string;
  clientId?: string;
  invoiceId?: string;
  receivedBy?: string; // staff/user ID
  firmName: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  clientType: string;
  utrNumber: string;
  paymentDate: string;
  amount: number;
  status: 'Completed' | 'Failed' | 'Pending';
  paymentMode?: string; // e.g., 'Cash', 'UPI'
};

const paymentsCollection = collection(db, 'payments');

export async function addPayment(paymentData: Omit<Payment, 'id'>) {
  try {
    const docRef = await addDoc(paymentsCollection, {
      ...paymentData,
      paymentDate: new Date(paymentData.paymentDate),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment: ", error);
    throw new Error("Failed to record payment.");
  }
}
