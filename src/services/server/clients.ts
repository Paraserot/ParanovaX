
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Client } from '@/services/clients';


// Server-side function to get all clients
export async function getClients(): Promise<Client[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getClients.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'clients'), orderBy('firmName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            lastVisit: data.lastVisit instanceof Timestamp ? data.lastVisit.toDate().toISOString() : data.lastVisit,
        } as Client
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch clients:', error);
    return [];
  }
}

    
