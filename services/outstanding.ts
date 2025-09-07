
"use client";

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Outstanding = {
  id?: string;
  customerName: string;
  clientName: string; // The client who has the outstanding with the customer
  clientId: string;
  clientType: string;
  amount: number;
  partPayment?: number;
  balance?: number;
  dueDate: string;
  entryDate: string;
  status: 'Pending' | 'Overdue' | 'Paid';
};
