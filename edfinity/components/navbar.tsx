'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { User, LogOut, Settings, LayoutDashboard, ChevronDown, Crown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function Navbar() {
  const { user, signOut, userProfile, isRole } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white/10 w-full relative z-50">
        <div className="flex items-center justify-between h-12 relative">

          {/* Left Section - Logo with rect.svg background */}
          <div className="relative flex items-center">
            <Image
              src="/rect.svg"
              alt=""
              width={318}
              height={39}
              className="h-12 w-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center pl-6">
              <Link href="/" className="flex items-center space-x-3">
                {/* Logo placeholder - you can add your actual logo here */}
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-black font-normal text-4xl title">
                  Edfinity
                </span>
              </Link>
            </div>
          </div>

          {/* Middle Section - Navigation Links */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              href="/courses"
              className="text-black hover:text-zinc-800 transition-colors title font-normal text-lg"
            >
              Courses
            </Link>
            <Link
              href="/resources"
              className="text-black hover:text-zinc-800 transition-colors title font-normal text-lg"
            >
              Resources
            </Link>
            <Link
              href="/about"
              className="text-black hover:text-zinc-800 transition-colors title font-normal text-lg"
            >
              About Us
            </Link>
          </div>

          {/* Right Section - User Area or Auth Buttons */}
          <div className="relative flex items-center">
            <Image
              src="/rect-right.svg"
              alt=""
              width={318}
              height={39}
              className="h-12 w-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center pr-6">
              {user ? (
                <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center space-x-3 text-black hover:text-gray-700 transition-colors focus:outline-none">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-8 h-8 rounded-full border-2 border-black"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                      <span className="font-normal text-sm">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                      sideOffset={5}
                      align="end"
                    >
                      <DropdownMenu.Item asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer outline-none"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenu.Item>

                      {/* Show upgrade option for regular users */}
                      {isRole('user') && (
                        <DropdownMenu.Item asChild>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer outline-none font-medium"
                          >
                            <Crown className="h-4 w-4" />
                            <span>Upgrade to Creator</span>
                          </Link>
                        </DropdownMenu.Item>
                      )}

                      <DropdownMenu.Item asChild>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer outline-none"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

                      <DropdownMenu.Item
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md cursor-pointer outline-none"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth"
                    className="text-black hover:text-gray-700 transition-colors font-normal text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth"
                    className="text-black hover:text-gray-700 transition-colors font-normal text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button - for future implementation */}
          <div className="md:hidden">
            {/* Add mobile menu toggle here if needed */}
          </div>
        </div>
    </nav>
  );
}