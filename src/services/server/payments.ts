
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Payment } from '@/services/payments';

// Server-side function to get all payments
export async function getPayments(): Promise<Payment[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getPayments.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          paymentDate: (data.paymentDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Payment;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch payments:', error);
    return [];
  }
}

    
