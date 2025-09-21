
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { AdminUser } from './users';

export type TicketCategory = {
  id?: string;
  name: string; // e.g., 'login-issue'
  label: string; // e.g., 'Login Issue'
  assignedTo?: {
    id: string;
    name: string;
    mobile?: string;
  } | null;
  createdAt?: string;
};

const categoriesCollection = collection(db, 'ticketCategories');

// Create
export async function addTicketCategory(data: Omit<TicketCategory, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(categoriesCollection, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ticket category: ", error);
    throw new Error("Failed to add category.");
  }
}

// Read (get all)
export async function getTicketCategories(): Promise<TicketCategory[]> {
  try {
    const q = query(categoriesCollection, orderBy('label', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      }
    }) as TicketCategory[];
  } catch (error) {
    console.error("Error getting ticket categories: ", error);
    throw new Error("Failed to get categories.");
  }
}

// Update
export async function updateTicketCategory(id: string, updates: Partial<TicketCategory>) {
  try {
    const categoryDoc = doc(db, 'ticketCategories', id);
    await updateDoc(categoryDoc, updates);
  } catch (error) {
    console.error("Error updating ticket category: ", error);
    throw new Error("Failed to update category.");
  }
}

// Delete
export async function deleteTicketCategory(id: string) {
    // Note: We might want to add validation to check if a category is in use before deleting.
  try {
    const categoryDoc = doc(db, 'ticketCategories', id);
    await deleteDoc(categoryDoc);
  } catch (error: any) {
    console.error("Error deleting ticket category: ", error);
    throw new Error(error.message || "Failed to delete category.");
  }
}
