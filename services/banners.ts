
"use client";

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Banner = {
  id?: string;
  title: string;
  details: string;
  type: string;
  attachmentUrl: string;
  customerTypes: string[];
  language: string;
  createdAt?: string;
};

const bannersCollection = collection(db, 'banners');

// Create
export async function addBanner(data: Omit<Banner, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(bannersCollection, {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding banner: ", error);
    throw new Error("Failed to add banner.");
  }
}

// Read (get all)
export async function getBanners(): Promise<Banner[]> {
  try {
    const q = query(bannersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Banner;
    });
  } catch (error) {
    console.error("Error getting banners: ", error);
    throw new Error("Failed to get banners.");
  }
}

// Update
export async function updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
  const bannerDoc = doc(db, 'banners', id);
  await updateDoc(bannerDoc, updates);
}

// Delete
export async function deleteBanner(id: string): Promise<void> {
  const bannerDoc = doc(db, 'banners', id);
  await deleteDoc(bannerDoc);
}
