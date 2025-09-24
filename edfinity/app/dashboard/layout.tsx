'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { signOutUser } from '@/lib/firebase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Video,
  DollarSign,
  Shield,
  Plus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const getSidebarItems = (userRole: string) => {
  const baseItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
      roles: ['user', 'creator', 'admin'],
    },
    {
      icon: BookOpen,
      label: 'Courses',
      href: '/dashboard/courses',
      roles: ['user', 'creator', 'admin'],
    },
  ];

  const creatorItems = [
    {
      icon: Plus,
      label: 'Create Course',
      href: '/dashboard/create-course',
      roles: ['creator', 'admin'],
    },
    {
      icon: Video,
      label: 'My Courses',
      href: '/dashboard/my-courses',
      roles: ['creator', 'admin'],
    },
    {
      icon: BarChart3,
      label: 'Creator Analytics',
      href: '/dashboard/creator-analytics',
      roles: ['creator', 'admin'],
    },
  ];

  const adminItems = [
    {
      icon: Shield,
      label: 'Admin Panel',
      href: '/dashboard/admin',
      roles: ['admin'],
    },
    {
      icon: DollarSign,
      label: 'Revenue & Payouts',
      href: '/dashboard/admin/revenue',
      roles: ['admin'],
    },
    {
      icon: BarChart3,
      label: 'Site Analytics',
      href: '/dashboard/admin/analytics',
      roles: ['admin'],
    },
  ];

  const commonItems = [
    {
      icon: Users,
      label: 'Collaboration',
      href: '/dashboard/collaboration',
      roles: ['user', 'creator', 'admin'],
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      href: '/dashboard/messages',
      roles: ['user', 'creator', 'admin'],
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/dashboard/settings',
      roles: ['user', 'creator', 'admin'],
    },
  ];

  let items = [...baseItems];

  if (userRole === 'creator' || userRole === 'admin') {
    items = [...items, ...creatorItems];
  }

  if (userRole === 'admin') {
    items = [...items, ...adminItems];
  }

  items = [...items, ...commonItems];

  return items.filter(item => item.roles.includes(userRole));
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const sidebarItems = getSidebarItems(userProfile?.role || 'user');

  const handleSignOut = async () => {
    const { error } = await signOutUser();
    if (!error) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">EdFinity</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-4 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="mr-3 h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user.displayName || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 truncate w-32">
                    {user.email}
                  </span>
                  <span className="text-xs text-blue-600 capitalize">
                    {userProfile?.role || 'user'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {sidebarItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Add notification bell, search, etc. here later */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}