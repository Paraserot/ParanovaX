
export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'execute';
export type Module = 'dashboard' | 'clients' | 'users' | 'roles' | 'tasks' | 'communication' | 'support' | 'payments' | 'outstanding' | 'expenses' | 'notifications' | 'leads' | 'services' | 'invoices' | 'reports' | 'devops';

export type Permissions = {
    [key in Module]?: Permission[];
};

export const modules: { id: Module; label: string; permissions: { id: Permission; label: string }[] }[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
    {
        id: 'devops',
        label: 'Dev-Ops',
        permissions: [
            { id: 'execute', label: 'Execute Commands' },
        ]
    },
    {
        id: 'leads',
        label: 'Leads',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'clients',
        label: 'Clients',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'services',
        label: 'Services',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'invoices',
        label: 'Invoices',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
     {
        id: 'reports',
        label: 'Reports',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
    {
        id: 'payments',
        label: 'Payments',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
    {
        id: 'expenses',
        label: 'Expenses',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'outstanding',
        label: 'Outstanding',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
    {
        id: 'users',
        label: 'Users',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
     {
        id: 'roles',
        label: 'Roles',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'tasks',
        label: 'Tasks',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
            { id: 'edit', label: 'Edit' },
            { id: 'delete', label: 'Delete' },
        ]
    },
    {
        id: 'communication',
        label: 'Communication',
        permissions: [
            { id: 'view', label: 'View' },
            { id: 'create', label: 'Create' },
        ]
    },
    {
        id: 'support',
        label: 'Support',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
    {
        id: 'notifications',
        label: 'Notifications',
        permissions: [
            { id: 'view', label: 'View' },
        ]
    },
];

export const allPermissions: Permission[] = ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'execute'];

export const defaultPermissions: Permissions = {
    dashboard: ['view'],
    devops: ['execute'],
    leads: ['view', 'create', 'edit', 'delete'],
    clients: ['view', 'create', 'edit', 'delete'],
    services: ['view', 'create', 'edit', 'delete'],
    invoices: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
    payments: ['view'],
    expenses: ['view', 'create', 'edit', 'delete'],
    outstanding: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    roles: ['view', 'create', 'edit', 'delete'],
    tasks: ['view', 'create', 'edit', 'delete'],
    communication: ['view', 'create'],
    support: ['view'],
    notifications: ['view']
};
