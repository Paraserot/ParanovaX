
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Lead = {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  assignedTo: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const leadsCollection = collection(db, 'leads');

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(leadsCollection, {
      ...leadData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding lead: ", error);
    throw new Error("Failed to add lead.");
  }
}

export async function updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>) {
  try {
    const leadDoc = doc(db, 'leads', id);
    await updateDoc(leadDoc, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating lead: ", error);
    throw new Error("Failed to update lead.");
  }
}

export async function deleteLead(id: string) {
  try {
    const leadDoc = doc(db, 'leads', id);
    await deleteDoc(leadDoc);
  } catch (error) {
    console.error("Error deleting lead: ", error);
    throw new Error("Failed to delete lead.");
  }
}
