
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { AdminUser } from '@/services/users';

// Server-side function to get all admin users
export async function getUsers(): Promise<AdminUser[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getUsers.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'admins'), orderBy('firstName'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;

        return {
            id: doc.id,
            ...data,
            createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate().toISOString() : new Date().toISOString(),
        } as AdminUser;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch users:', error);
    return [];
  }
}

    
