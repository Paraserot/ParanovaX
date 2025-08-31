
"use client";

import { create } from 'zustand';
import { doc, onSnapshot, collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminUser } from '@/services/users';

interface UserStore {
  adminUser: AdminUser | null;
  users: AdminUser[];
  usersMap: Map<string, string>;
  loading: boolean;
  setAdminUser: (user: AdminUser | null) => void;
  fetchUser: (uid: string) => () => void;
  fetchUsers: () => () => void;
}

const toSerializableUser = (docSnap: any): AdminUser => {
    const data = docSnap.data();
    const createdAt = data.createdAt;
    const updatedAt = data.updatedAt;

    return {
        id: docSnap.id,
        ...data,
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate().toISOString() : new Date().toISOString(),
    } as AdminUser;
};

export const useUserStore = create<UserStore>((set) => ({
  adminUser: null,
  users: [],
  usersMap: new Map(),
  loading: true,
  setAdminUser: (user) => set({ adminUser: user }),
  fetchUser: (uid: string) => {
    set({ loading: true });
    const unsub = onSnapshot(doc(db, "admins", uid), (doc) => {
      if (doc.exists()) {
        set({ adminUser: toSerializableUser(doc), loading: false });
      } else {
        set({ adminUser: null, loading: false });
      }
    }, (error) => {
      console.error("Failed to fetch user:", error);
      set({ loading: false });
    });
    return unsub;
  },
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

    
