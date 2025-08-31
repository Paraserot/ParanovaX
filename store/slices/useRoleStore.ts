
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Role } from '@/services/roles';

interface RoleStore {
  roles: Role[];
  userRole: Role | null;
  rolesMap: Map<string, string>;
  loading: boolean;
  setUserRole: (role: Role | null) => void;
  fetchRoles: () => () => void;
  fetchRole: (roleId: string) => () => void;
  getRoleById: (id: string) => Role | null;
}

const toSerializableRole = (docSnap: any): Role => {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name,
        level: data.level || 0,
        permissions: data.permissions || {},
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
    } as Role;
};

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: [],
  userRole: null,
  rolesMap: new Map(),
  loading: true,
  setUserRole: (role) => set({ userRole: role }),
  fetchRoles: () => {
    const q = query(collection(db, "roles"), orderBy("level"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(toSerializableRole);
      const newRolesMap = new Map(data.map(r => [r.id, r.name]));
      set({ roles: data, rolesMap: newRolesMap });
    }, (error) => {
      console.error("Failed to fetch roles:", error);
    });
    return unsubscribe;
  },
  fetchRole: (roleId: string) => {
    set({ loading: true });
    const unsub = onSnapshot(doc(db, "roles", roleId), (doc) => {
        if(doc.exists()) {
            set({ userRole: toSerializableRole(doc), loading: false });
        } else {
            set({ userRole: null, loading: false });
        }
    }, (error) => {
      console.error("Failed to fetch user role:", error);
      set({ userRole: null, loading: false });
    });
    return unsub;
  },
  getRoleById: (id: string) => {
    return get().roles.find(role => role.id === id) || null;
  }
}));

    
