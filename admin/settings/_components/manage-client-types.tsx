
"use client";

import { useState, useEffect } from 'react';
import { useClientTypeStore } from '@/store/slices/useClientTypeStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ClientType, deleteClientType } from '@/services/client-types';
import { AddEditClientTypeDialog } from './add-edit-client-type-dialog';

export function ManageClientTypes() {
    const { clientTypes, fetchClientTypes } = useClientTypeStore();
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ClientType | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchClientTypes();
    }, [fetchClientTypes]);

    const handleAddNew = () => {
        setSelectedType(null);
        setIsAddEditDialogOpen(true);
    };

    const handleEdit = (type: ClientType) => {
        setSelectedType(type);
        setIsAddEditDialogOpen(true);
    };

    const handleDelete = async (type: ClientType) => {
        try {
            await deleteClientType(type.id!, type.name);
            toast({ title: "Success", description: `Client type "${type.label}" deleted.`});
            fetchClientTypes(true);
        } catch(e: any) {
            toast({ variant: 'destructive', title: "Error", description: e.message || "Failed to delete client type."});
        }
    };

    const handleSuccess = () => {
        fetchClientTypes(true);
        setIsAddEditDialogOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={handleAddNew} variant="border-gradient">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Type
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Name (ID)</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.label}</TableCell>
                                        <TableCell className="text-muted-foreground">{type.name}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(type)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the client type "{type.label}". This action cannot be undone and may fail if the type is currently in use.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(type)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <AddEditClientTypeDialog
                isOpen={isAddEditDialogOpen}
                onOpenChange={setIsAddEditDialogOpen}
                clientType={selectedType}
                onSuccess={handleSuccess}
            />
        </>
    );
}
