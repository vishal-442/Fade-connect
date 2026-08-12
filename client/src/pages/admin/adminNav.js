import { LayoutDashboard, Users, Store, MessageSquareWarning, CreditCard, Settings } from 'lucide-react';

export const adminNavLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/salons', label: 'Salons', icon: Store },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareWarning },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];
