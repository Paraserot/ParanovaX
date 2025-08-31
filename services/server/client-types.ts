
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { ClientType } from '@/services/client-types';

// Server-side function to get all client types
export async function getClientTypes(): Promise<ClientType[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getClientTypes.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'clientTypes'), orderBy('label'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as ClientType;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch client types:', error);
    return [];
  }
}

    
