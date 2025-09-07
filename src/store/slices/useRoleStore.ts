
"use client";

import { create } from 'zustand';
import { collection, onSnapshot, query, orderBy, doc, Timestamp, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Role } from '@/services/roles';

interface RoleStore {
  roles: Role[];
  userRole: Role | null;
  rolesMap: Map<string, string>;
  loading: boolean;
  setUserRole: (role: Role | null) => void;
  fetchRoles: () => Promise<void>;
  fetchRole: (roleId: string) => Promise<void>;
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
  fetchRoles: async () => {
    set({loading: true});
    try {
        const q = query(collection(db, "roles"), orderBy("level"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(toSerializableRole);
        const newRolesMap = new Map(data.map(r => [r.id, r.name]));
        set({ roles: data, rolesMap: newRolesMap, loading: false });
    } catch(error) {
        console.error("Failed to fetch roles:", error);
        set({loading: false});
    }
  },
  fetchRole: async (roleId: string) => {
    set({ loading: true });
    try {
        const roleDoc = await getDoc(doc(db, "roles", roleId));
        if(roleDoc.exists()) {
            set({ userRole: toSerializableRole(roleDoc), loading: false });
        } else {
            set({ userRole: null, loading: false });
        }
    } catch(e) {
         console.error("Failed to fetch user role:", e);
         set({ userRole: null, loading: false });
    }
  },
  getRoleById: (id: string) => {
    return get().roles.find(role => role.id === id) || null;
  }
}));
