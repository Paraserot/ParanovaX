
"use client";

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/slices/useUserStore';
import { useRoleStore } from '@/store/slices/useRoleStore';
import { Module, Permission } from '@/lib/permissions';
import { useClientStore } from '@/store/slices/useClientStore';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { adminUser } = useUserStore();
    const { clientUser } = useClientStore();
    const { userRole } = useRoleStore();

    const hasPermission = (module: Module, permission: Permission): boolean => {
        // This is now specific to admin users. Clients have a different logic.
        if (!adminUser || !userRole) {
            return false;
        }
        if (userRole.name.toLowerCase().includes('super')) {
            return true;
        }
        const modulePermissions = userRole.permissions[module];
        return modulePermissions ? modulePermissions.includes(permission) : false;
    };

    return { ...context, adminUser, clientUser, hasPermission };
};
