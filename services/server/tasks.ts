
import 'server-only';

import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { Task } from '@/services/tasks';

// Server-side function to get all tasks
export async function getTasks(): Promise<Task[]> {
  if (!adminDb) {
    console.error("[SERVER] Firebase Admin not initialized. Skipping getTasks.");
    return [];
  }
  try {
    const db = adminDb.firestore();
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const dueDate = data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate || null;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt;
        const completedAt = data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt || null;

        return {
            id: doc.id,
            ...data,
            dueDate,
            createdAt,
            completedAt,
        } as Task;
    });
  } catch (error) {
    console.error('[SERVER] Failed to fetch tasks:', error);
    return [];
  }
}

    
