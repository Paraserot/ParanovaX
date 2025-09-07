
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Invoice } from '@/services/invoices';


// Server-side function to get all invoices
export async function getInvoices(): Promise<Invoice[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getInvoices.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'invoices'), orderBy('invoiceDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            invoiceDate: (data.invoiceDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Invoice;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch invoices:', error);
    return [];
  }
}

    
