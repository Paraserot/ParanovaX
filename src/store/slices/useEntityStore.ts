
"use client";

import { create } from 'zustand';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Entity } from '@/services/entities';

interface EntityStore {
  entities: Entity[];
  loading: boolean;
  fetched: boolean;
  fetchEntities: (force?: boolean) => Promise<void>;
}

const toSerializableEntity = (docSnap: any): Entity => {
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Entity;
};

export const useEntityStore = create<EntityStore>((set, get) => ({
  entities: [],
  loading: false,
  fetched: false,
  fetchEntities: async (force = false) => {
    if (!force && get().fetched) return;
    
    set({ loading: true });
    try {
      const q = query(collection(db, "entities"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(toSerializableEntity);
      set({ entities: data, fetched: true });
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

    
