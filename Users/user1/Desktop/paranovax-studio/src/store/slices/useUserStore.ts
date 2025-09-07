
"use client";

import { create } from 'zustand';
import { doc, onSnapshot, collection, query, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminUser } from '@/services/users';

interface UserStore {
  adminUser: AdminUser | null;
  users: AdminUser[];
  usersMap: Map<string, string>;
  loading: boolean;
  setAdminUser: (user: AdminUser | null) => void;
  fetchUsers: () => () => void;
}

const toSerializableUser = (docSnap: any): AdminUser => {
    const data = docSnap.data();
    const normalizeDate = (value: any): string => {
        if (!value) return new Date().toISOString();
        if (value instanceof Timestamp) return value.toDate().toISOString();
        if (value && typeof value.seconds === 'number') {
            return new Timestamp(value.seconds, value.nanoseconds).toDate().toISOString();
        }
        if(typeof value === 'string') return value;
        return new Date().toISOString();
    };

    return {
        id: docSnap.id,
        ...data,
        createdAt: normalizeDate(data.createdAt),
        updatedAt: normalizeDate(data.updatedAt),
    } as AdminUser;
};

export const useUserStore = create<UserStore>((set) => ({
  adminUser: null,
  users: [],
  usersMap: new Map(),
  loading: true,
  setAdminUser: (user) => set({ adminUser: user }),
  fetchUsers: () => {
    const q = query(collection(db, "admins"), orderBy("firstName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(toSerializableUser);
      const newUsersMap = new Map(usersData.map(u => [u.id!, `${u.firstName} ${u.lastName}`]));
      set({ users: usersData, usersMap: newUsersMap });
    }, (error) => {
        console.error("Failed to fetch all users:", error);
    });
    return unsubscribe;
  }
}));
