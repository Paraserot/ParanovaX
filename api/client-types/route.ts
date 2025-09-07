
import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      console.error("API Error in /api/client-types: Firebase Admin SDK is not initialized. Check server logs for details on initialization failure.");
      throw new Error('Firebase Admin SDK not initialized.');
    }
    
    const db = getFirestore(adminDb);
    const snapshot = await db.collection('clientTypes').orderBy('label', 'asc').get();

    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const types = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(types);
  } catch (error: any) {
    console.error("ERROR in /api/client-types route:", error.message);
    return NextResponse.json(
      { error: `Server-side error fetching client types: ${error.message}` },
      { status: 500 }
    );
  }
}
