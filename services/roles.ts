
"use client";

import { collection, getDocs, doc, setDoc, query, orderBy, Timestamp, addDoc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Permission, Module, defaultPermissions } from '@/lib/permissions';

export type Permissions = {
    [key in Module]?: Permission[];
};

export type Role = {
  id: string;
  name: string;
  level: number;
  permissions: Permissions;
  createdAt?: string;
};

const rolesCollection = collection(db, 'roles');

export async function getRoles(): Promise<Role[]> {
    try {
        const q = query(rolesCollection, orderBy('level', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                level: data.level || 0,
                permissions: data.permissions || {},
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            } as Role;
        });
    } catch (error) {
        console.error("Error getting roles: ", error);
        throw new Error("Failed to get roles.");
    }
}


export async function addRole(data: { name: string, level: number }) {
    if (!data.name) throw new Error("Role name cannot be empty.");

    const docRef = await addDoc(rolesCollection, {
        name: data.name,
        level: data.level,
        permissions: {}, // Start with no permissions
        createdAt: Timestamp.now()
    });
    return docRef.id;
}

export async function updateRole(id: string, data: { name: string, level: number }) {
    const docRef = doc(db, 'roles', id);
    await updateDoc(docRef, data);
}

export async function deleteRole(id: string) {
    const docRef = doc(db, 'roles', id);
    await deleteDoc(docRef);
}


export async function saveRolePermissions(roleId: string, permissions: Permissions) {
    try {
        const roleDocRef = doc(db, 'roles', roleId);
        // Use updateDoc to only modify the permissions field, not the whole document.
        await updateDoc(roleDocRef, { permissions });
    } catch (error) {
        console.error("Error saving role permissions: ", error);
        throw new Error("Failed to save role permissions.");
    }
}
