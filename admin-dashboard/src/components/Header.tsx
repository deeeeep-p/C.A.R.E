import { Bell, User, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  systemStatus: string;
}

const Header = ({ sidebarOpen, setSidebarOpen, systemStatus }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <button
        type="button"
        className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-3 ml-4 md:ml-0">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 hidden md:block">
          System Status:
        </span>
        <div className="flex items-center gap-2">
          <span className={`relative flex h-3 w-3 ${
            systemStatus === 'online' ? 'animate-pulse' : ''
          }`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              systemStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
          </span>
          <span className="text-sm font-medium capitalize">
            {systemStatus}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div id="google_translate_element" className="mr-2"></div>
        <button
          type="button"
          className="p-2 text-gray-500 rounded-full hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button
          type="button"
          className="p-2 text-gray-500 rounded-full hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
        >
          <span className="sr-only">View notifications</span>
          <Bell size={20} />
        </button>
        <button
          type="button"
          className="p-1 text-gray-500 bg-gray-100 rounded-full hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="sr-only">View profile</span>
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;