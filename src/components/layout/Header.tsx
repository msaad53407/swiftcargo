import React from 'react';
import { Bell, MessageSquare, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { currentUser } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-4 lg:px-6 flex items-center justify-between">
      {/* Mobile: Toggle and Logo */}
      <div className="flex items-center lg:hidden">

        <h1 className="ml-3 text-2xl font-bold">
          Ummah<span className="text-[#40B093]"> Cargo</span>
        </h1>
      </div>

      {/* Desktop: Avatar and other actions */}
      <div className='lg:hidden'>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
      </div>
      <div className="hidden lg:flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <Avatar>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
              alt="User"
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="text-sm hidden sm:block">
            <p className="font-medium">{currentUser?.name}</p>
            <p className="text-gray-500 text-xs">{currentUser?.userType}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

