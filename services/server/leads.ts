
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Lead } from '@/services/leads';


// Server-side function to get all leads
export async function getLeads(): Promise<Lead[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getLeads.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
        } as Lead;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch leads:', error);
    return [];
  }
}

    
