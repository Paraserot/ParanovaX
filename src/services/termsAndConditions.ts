
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TermsAndCondition = {
  id?: string;
  title: string;
  language: string;
  points: string;
  customerType: string;
  createdAt?: string;
};

const termsCollection = collection(db, 'termsAndConditions');

// Create
export async function addTermsAndCondition(data: Omit<TermsAndCondition, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(termsCollection, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding T&C: ", error);
    throw new Error("Failed to add T&C.");
  }
}

// Read (get all)
export async function getTermsAndConditions(): Promise<TermsAndCondition[]> {
  try {
    const q = query(termsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as TermsAndCondition;
    });
  } catch (error) {
    console.error("Error getting T&Cs: ", error);
    throw new Error("Failed to get T&Cs.");
  }
}

// Update
export async function updateTermsAndCondition(id: string, updates: Partial<TermsAndCondition>): Promise<void> {
  const termDoc = doc(db, 'termsAndConditions', id);
  await updateDoc(termDoc, updates);
}

// Delete
export async function deleteTermsAndCondition(id: string): Promise<void> {
  const termDoc = doc(db, 'termsAndConditions', id);
  await deleteDoc(termDoc);
}
