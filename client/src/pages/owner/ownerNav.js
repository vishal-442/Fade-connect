import { LayoutDashboard, Store, Users, Scissors, CalendarClock, ClipboardList } from 'lucide-react';

export const ownerNavLinks = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/owner/salon', label: 'Salon Profile', icon: Store },
  { to: '/owner/barbers', label: 'Barbers', icon: Users },
  { to: '/owner/services', label: 'Services', icon: Scissors },
  { to: '/owner/slots', label: 'Slots & Hours', icon: CalendarClock },
  { to: '/owner/bookings', label: 'Bookings', icon: ClipboardList },
];
