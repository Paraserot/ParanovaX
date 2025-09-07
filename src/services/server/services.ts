
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Service } from '@/services/services';

// Server-side function to get all services
export async function getServices(): Promise<Service[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getServices.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'services'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Service;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch services:', error);
    return [];
  }
}

    
