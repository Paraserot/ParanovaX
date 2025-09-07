
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export type Service = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  createdAt?: string;
};

const servicesCollection = collection(db, 'services');

export async function addService(serviceData: Omit<Service, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(servicesCollection, {
      ...serviceData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding service: ", error);
    throw new Error("Failed to add service.");
  }
}

export async function updateService(id: string, updates: Partial<Omit<Service, 'id' | 'createdAt'>>) {
  const serviceDoc = doc(db, 'services', id);
  await updateDoc(serviceDoc, updates);
}

export async function deleteService(id: string) {
  const serviceDoc = doc(db, 'services', id);
  await deleteDoc(serviceDoc);
}
