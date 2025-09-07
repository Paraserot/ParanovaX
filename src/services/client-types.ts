
'use client';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ClientType = {
  id?: string;
  name: string; // e.g., 'hotel-owner'
  label: string; // e.g., 'Hotel Owner'
  createdAt?: string;
};

const clientTypesCollection = collection(db, 'clientTypes');
const clientsCollection = collection(db, 'clients');

// Create
export async function addClientType(clientTypeData: Omit<ClientType, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(clientTypesCollection, {
      ...clientTypeData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding client type: ", error);
    throw new Error("Failed to add client type.");
  }
}

// Update
export async function updateClientType(id: string, updates: Partial<ClientType>) {
  try {
    const clientTypeDoc = doc(db, 'clientTypes', id);
    await updateDoc(clientTypeDoc, updates);
  } catch (error) {
    console.error("Error updating client type: ", error);
    throw new Error("Failed to update client type.");
  }
}

// Delete
export async function deleteClientType(id: string, name: string) {
  try {
    // Validation: Check if the client type is in use
    const usageQuery = query(clientsCollection, where('clientType', '==', name));
    const snapshot = await getCountFromServer(usageQuery);
    
    if (snapshot.data().count > 0) {
      throw new Error(`This client type is currently assigned to ${snapshot.data().count} client(s) and cannot be deleted.`);
    }

    const clientTypeDoc = doc(db, 'clientTypes', id);
    await deleteDoc(clientTypeDoc);
  } catch (error: any) {
    console.error("Error deleting client type: ", error);
    throw new Error(error.message || "Failed to delete client type.");
  }
}
