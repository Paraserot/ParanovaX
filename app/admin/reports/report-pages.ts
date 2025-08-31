
import { BarChart3, Users, Briefcase, IndianRupee, Activity, Bell, FileText, Banknote, Shield, Ticket, DollarSign, LogIn, GanttChartSquare, Milestone, Building2, Map, Equal, UserCog, MessageSquare } from "lucide-react";

export const masterReports = [
    { title: 'Client Master', description: 'Complete list of all your active, inactive, and pending clients.', icon: Briefcase, href: '/admin/reports/client-master' },
    { title: 'Customer Master', description: 'Database of all end-customers associated with your clients.', icon: Users, href: '/admin/reports/customer-master' },
    { title: 'Employee Master', description: 'Database of all employees associated with your clients.', icon: UserCog, href: '/admin/reports/employee-master' },
    { title: 'User Management', description: 'Overview of all admin users, their roles, and statuses.', icon: Shield, href: '/admin/reports/user-management' },
];

export const financialReports = [
    { title: 'Invoice Management', description: 'Detailed report of all generated invoices, their statuses, and amounts.', icon: FileText, href: '/admin/reports/invoice-management' },
    { title: 'Payment Records', description: 'A complete log of all successful, pending, and failed payments.', icon: Banknote, href: '/admin/reports/payment-records' },
    { title: 'Outstanding Payments', description: 'Track all outstanding amounts, including partial payments and credit days.', icon: IndianRupee, href: '/admin/reports/outstanding-payments' },
    { title: 'Admin Expenses', description: 'Detailed breakdown of your internal operational expenses.', icon: DollarSign, href: '/admin/reports/admin-expenses' },
];

export const activityReports = [
    { title: 'Lead Management', description: 'Track the entire lifecycle of leads, from creation to conversion.', icon: Milestone, href: '/admin/reports/lead-management' },
    { title: 'Login Activity', description: 'Monitor login trends for both clients and internal users.', icon: LogIn, href: '/admin/reports/login-activity' },
];

export const communicationReports = [
     { title: 'Support Tickets', description: 'Comprehensive report on support tickets, resolution times, and categories.', icon: Ticket, href: '/admin/reports/support-tickets' },
     { title: 'Notification History', description: 'Review all push notifications that have been sent or scheduled.', icon: Bell, href: '/admin/reports/notification-history' },
];

export const allReportPages = [...masterReports, ...financialReports, ...activityReports, ...communicationReports];
