
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role, saveRolePermissions } from '@/services/roles';
import { Permissions, modules } from '@/lib/permissions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { CustomLoader } from '@/components/ui/custom-loader';
import { useRoleStore } from '@/store/slices/useRoleStore';

export default function ManageRolePermissionsPage({ params }: { params: { roleId: string } }) {
    const router = useRouter();
    const { roles, loading, fetchRoles } = useRoleStore();
    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        const foundRole = roles.find(r => r.id === params.roleId);
        if (foundRole) {
            setRole(foundRole);
            setPermissions(foundRole.permissions || {});
        }
    }, [roles, params.roleId]);

    const handlePermissionChange = (moduleId: string, permissionId: string, checked: boolean) => {
        setPermissions(prev => {
            const newModulePermissions = prev[moduleId as keyof Permissions] ? [...prev[moduleId as keyof Permissions]!] : [];
            if (checked) {
                if (!newModulePermissions.includes(permissionId as any)) {
                    newModulePermissions.push(permissionId as any);
                }
            } else {
                const index = newModulePermissions.indexOf(permissionId as any);
                if (index > -1) {
                    newModulePermissions.splice(index, 1);
                }
            }
            return { ...prev, [moduleId]: newModulePermissions };
        });
    };

    const handleSelectAll = (moduleId: string, permissionIds: string[]) => {
        setPermissions(prev => ({
            ...prev,
            [moduleId]: permissionIds
        }));
    };
    
    const handleDeselectAll = (moduleId: string) => {
        setPermissions(prev => ({
            ...prev,
            [moduleId]: []
        }));
    };

    const handleSave = async () => {
        if (!role) return;
        setIsSaving(true);
        try {
            await saveRolePermissions(role.id, permissions);
            toast({
                title: 'Permissions Saved',
                description: `Permissions for the "${role.name}" role have been updated.`,
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Oh no! Something went wrong.',
                description: error.message || 'Failed to save permissions.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex h-full items-center justify-center"><CustomLoader /></div>;
    }

    if (!role) {
        return <div className="text-center">Role not found.</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <div>
                             <CardTitle className="text-2xl">Manage Permissions for "{role.name}"</CardTitle>
                            <CardDescription>
                                Select the permissions this role should have for each module.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                    <Card key={module.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{module.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {module.permissions.map(permission => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${module.id}-${permission.id}`}
                                        checked={permissions[module.id as keyof Permissions]?.includes(permission.id as any)}
                                        onCheckedChange={(checked) => handlePermissionChange(module.id, permission.id, !!checked)}
                                    />
                                    <Label htmlFor={`${module.id}-${permission.id}`} className="capitalize font-normal">
                                        {permission.label}
                                    </Label>
                                </div>
                            ))}
                        </CardContent>
                         <CardFooter className="flex gap-2 bg-muted/50 p-3">
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto"
                                onClick={() => handleSelectAll(module.id, module.permissions.map(p => p.id))}
                            >
                                Select All
                            </Button>
                            <span className="text-muted-foreground">/</span>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto"
                                onClick={() => handleDeselectAll(module.id)}
                            >
                                Deselect All
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} variant="border-gradient">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Permissions
                </Button>
            </div>
        </div>
    );
}
