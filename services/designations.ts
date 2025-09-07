
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Designation = {
  id?: string;
  name: string;
  level: number;
  createdAt?: Date;
};

const designationsCollection = collection(db, 'designations');

// Create
export async function addDesignation(data: Omit<Designation, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(designationsCollection, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding designation: ", error);
    throw new Error("Failed to add designation.");
  }
}

// Read (get all)
export async function getDesignations(): Promise<Designation[]> {
  try {
    const q = query(designationsCollection, orderBy('level', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data
      } as Designation;
    });
  } catch (error) {
    console.error("Error getting designations: ", error);
    throw new Error("Failed to get designations.");
  }
}

// Update
export async function updateDesignation(id: string, updates: Partial<Omit<Designation, 'id' | 'createdAt'>>): Promise<void> {
  const itemDoc = doc(db, 'designations', id);
  await updateDoc(itemDoc, updates);
}

// Delete
export async function deleteDesignation(id: string): Promise<void> {
  const itemDoc = doc(db, 'designations', id);
  await deleteDoc(itemDoc);
}
