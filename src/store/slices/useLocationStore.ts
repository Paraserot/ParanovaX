
"use client";

import { create } from 'zustand';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

interface LocationStore {
  states: string[];
  districts: { [key: string]: string[] };
  loading: boolean;
  fetchStates: () => Promise<void>;
  fetchDistricts: (state: string) => Promise<void>;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  states: [],
  districts: {},
  loading: false,
  fetchStates: async () => {
    set({ loading: true });
    try {
      const statesCollection = await getDocs(query(collection(db, "states")));
      const statesData = statesCollection.docs.map(doc => doc.id).sort();
      set({ states: statesData, loading: false });
    } catch (error) {
      console.error("Failed to fetch states:", error);
      set({ loading: false });
    }
  },
  fetchDistricts: async (state: string) => {
    set({ loading: true });
    try {
      const districtsCollection = await getDocs(query(collection(db, `states/${state}/districts`)));
      const districtsData = districtsCollection.docs.map(doc => doc.id).sort();
      set(prev => ({
        districts: { ...prev.districts, [state]: districtsData },
        loading: false
      }));
    } catch (error) {
      console.error(`Failed to fetch districts for ${state}:`, error);
      set({ loading: false });
    }
  },
}));
