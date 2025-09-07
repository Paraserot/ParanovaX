
"use client";

import { create } from 'zustand';
import { doc, onSnapshot, collection, query, orderBy, Timestamp, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { AdminUser } from '@/services/users';

interface UserStore {
  adminUser: AdminUser | null;
  users: AdminUser[];
  usersMap: Map<string, string>;
  loading: boolean;
  setAdminUser: (user: AdminUser | null) => void;
  fetchUser: (uid: string) => Promise<AdminUser | null>;
  fetchUsers: () => Promise<void>;
}

const toSerializableUser = (docSnap: any): AdminUser => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as AdminUser;
};

export const useUserStore = create<UserStore>((set, get) => ({
  adminUser: null,
  users: [],
  usersMap: new Map(),
  loading: true,
  setAdminUser: (user) => set({ adminUser: user, loading: false }),
  fetchUser: async (uid: string): Promise<AdminUser | null> => {
    set({ loading: true });
    try {
        const userDocRef = doc(db, "admins", uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = toSerializableUser(docSnap);
            set({ adminUser: userData, loading: false });
            return userData;
        } else {
             set({ adminUser: null, loading: false });
            return null;
        }
    } catch(e) {
        console.error("Failed to fetch user:", e);
        set({ loading: false });
        return null;
    }
  },
  fetchUsers: async () => {
    set({loading: true});
    try {
        const q = query(collection(db, "admins"), orderBy("firstName"));
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map(toSerializableUser);
        const newUsersMap = new Map(usersData.map(u => [u.id!, `${u.firstName} ${u.lastName}`]));
        set({ users: usersData, usersMap: newUsersMap, loading: false });
    } catch(error) {
        console.error("Failed to fetch all users:", error);
        set({loading: false});
    }
  }
}));
