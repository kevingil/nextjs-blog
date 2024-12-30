'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Settings, Shield, PenLine, EllipsisVertical, ImageUp } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Profile' },
    { href: '/dashboard/blog', icon: PenLine, label: 'Articles' },
    { href: '/dashboard/uploads', icon: ImageUp, label: 'Uploads' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
  ];
  

  const NavContent = ({ mobile = false }) => (
    <nav className={mobile ? '' : ' flex flex-col gap-1'}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} passHref>
          {mobile ? (
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </DropdownMenuItem>
          ) : (
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={`w-full justify-start py-8 rounded-xl ${pathname === item.href ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex flex-col min-h-[80dvh] max-w-7xl mx-auto w-full z-[1]">
      {/* Mobile header */}
      <div className="lg:hidden bg-transparent flex justify-between items-center gap-2 bg-card mb-12 rounded-xl p-4">
        <div className="flex items-center">
          <span className="font-medium">Dashboard</span>
        </div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-3">
              <EllipsisVertical className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <NavContent mobile />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 rounded-xl pt-6">
          <div className="h-full overflow-y-auto p-4">
            <NavContent />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      </div>
    </div>
  );
}
