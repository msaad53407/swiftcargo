import { Bell, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { currentUser } = useAuth()
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="w-72">
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search anything"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#40B093] focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        {/* 
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MessageSquare size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Bell size={20} className="text-gray-600" />
        </button> */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <Avatar>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop"
              alt="User"
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">{currentUser?.name}</p>
            <p className="text-gray-500 text-xs">{currentUser?.userType}</p>
          </div>
        </div>
      </div>
    </header>
  );
}