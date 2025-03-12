"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = session?.user?.role === 'admin';
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };
  
  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Time Study App</h1>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {isAdmin ? (
                <>
                  <li>
                    <Link 
                      href="/dashboard/admin" 
                      className={pathname === '/dashboard/admin' ? 'font-bold' : 'hover:text-blue-100'}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/admin/users" 
                      className={pathname.startsWith('/dashboard/admin/users') ? 'font-bold' : 'hover:text-blue-100'}
                    >
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/admin/operations" 
                      className={pathname.startsWith('/dashboard/admin/operations') ? 'font-bold' : 'hover:text-blue-100'}
                    >
                      Operations
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link 
                    href="/dashboard/operator" 
                    className={pathname === '/dashboard/operator' ? 'font-bold' : 'hover:text-blue-100'}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button 
                  onClick={handleLogout}
                  className="hover:text-blue-100 cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="mt-4 md:hidden">
            <ul className="flex flex-col space-y-3">
              {isAdmin ? (
                <>
                  <li>
                    <Link 
                      href="/dashboard/admin" 
                      className={pathname === '/dashboard/admin' ? 'font-bold' : 'hover:text-blue-100'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/admin/users" 
                      className={pathname.startsWith('/dashboard/admin/users') ? 'font-bold' : 'hover:text-blue-100'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard/admin/operations" 
                      className={pathname.startsWith('/dashboard/admin/operations') ? 'font-bold' : 'hover:text-blue-100'}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Operations
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link 
                    href="/dashboard/operator" 
                    className={pathname === '/dashboard/operator' ? 'font-bold' : 'hover:text-blue-100'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button 
                  onClick={handleLogout}
                  className="hover:text-blue-100 cursor-pointer"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
