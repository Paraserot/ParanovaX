
"use client";

import { useState, useEffect } from 'react';
import { useTicketStore } from '@/store/slices/useTicketStore';
import { useTicketCategoryStore } from '@/store/slices/useTicketCategoryStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, User, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TicketCategory, deleteTicketCategory } from '@/services/ticket-categories';
import { AddEditTicketCategoryDialog } from './add-edit-ticket-category-dialog';
import { useUserStore } from '@/store/slices/useUserStore';

export function ManageTicketCategories() {
    const { tickets, fetchTickets } = useTicketStore();
    const { ticketCategories, fetchTicketCategories } = useTicketCategoryStore();
    const { fetchUsers } = useUserStore();
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchTicketCategories();
        fetchUsers();
        fetchTickets();
    }, [fetchTicketCategories, fetchUsers, fetchTickets]);

    const handleAddNew = () => {
        setSelectedCategory(null);
        setIsAddEditDialogOpen(true);
    };

    const handleEdit = (category: TicketCategory) => {
        setSelectedCategory(category);
        setIsAddEditDialogOpen(true);
    };

    const handleDelete = async (category: TicketCategory) => {
        if (tickets.some(t => t.category === category.name)) {
            toast({ variant: 'destructive', title: "Error", description: `Cannot delete "${category.label}" as it is currently assigned to one or more tickets.` });
            return;
        }
        try {
            await deleteTicketCategory(category.id!);
            toast({ title: "Success", description: `Category "${category.label}" deleted.`});
            fetchTicketCategories();
        } catch(e: any) {
            toast({ variant: 'destructive', title: "Error", description: e.message || "Failed to delete category."});
        }
    };

    const handleSuccess = () => {
        fetchTicketCategories();
        setIsAddEditDialogOpen(false);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={handleAddNew} variant="border-gradient">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Auto-Assigned To</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ticketCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.label}</TableCell>
                                        <TableCell>
                                            {category.assignedTo ? (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User className="h-4 w-4 text-green-500" />
                                                    <span>{category.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <UserX className="h-4 w-4 text-orange-500" />
                                                    <span>Manual Assignment</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(category)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the category "{category.label}". This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(category)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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

            <AddEditTicketCategoryDialog
                isOpen={isAddEditDialogOpen}
                onOpenChange={setIsAddEditDialogOpen}
                category={selectedCategory}
                onSuccess={handleSuccess}
            />
        </>
    );
}
