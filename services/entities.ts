
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type Entity = {
  id?: string;
  entityType: 'customer' | 'employee';
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  clientName: string; // Admin's client's name
  clientId: string; // The ID of the client this entity belongs to
  clientType: string;
  createdAt?: string;
};

export async function addEntity(entityData: Omit<Entity, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'entities'), {
      ...entityData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding entity: ", error);
    throw new Error("Failed to add entity.");
  }
}

export async function updateEntity(id: string, updates: Partial<Entity>) {
  try {
    const entityDoc = doc(db, 'entities', id);
    await updateDoc(entityDoc, updates);
  } catch (error) {
    console.error("Error updating entity: ", error);
    throw new Error("Failed to update entity.");
  }
}

export async function deleteEntity(id: string) {
  try {
    const entityDoc = doc(db, 'entities', id);
    await deleteDoc(entityDoc);
  } catch (error) {
    console.error("Error deleting entity: ", error);
    throw new Error("Failed to delete entity.");
  }
}
