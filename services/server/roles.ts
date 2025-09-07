
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Role } from '@/services/roles';

// Server-side function to get all roles
export async function getRoles(): Promise<Role[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getRoles.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'roles'), orderBy('level'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            level: data.level || 0,
            permissions: data.permissions || {},
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        } as Role;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch roles:', error);
    return [];
  }
}

    
