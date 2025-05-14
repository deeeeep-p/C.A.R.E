import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Phone, 
  Settings, 
  AlertTriangle, 
  X
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Live Map', href: '/map', icon: Map },
    { name: 'Call Logs', href: '/calls', icon: Phone },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800 dark:bg-gray-800">
            <div className="absolute top-0 right-0 pt-2 -mr-12">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-8 w-8 mr-2" />
                  <span className="text-2xl font-bold">C.A.R.E.</span>
                </div>
              </div>
              <nav className="mt-8 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-3 text-base font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-blue-900 dark:bg-gray-900 text-white'
                        : 'text-blue-100 dark:text-gray-300 hover:bg-blue-700 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="mr-4 h-6 w-6 text-blue-200 dark:text-gray-400" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-900 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin Portal</p>
                  <p className="text-xs text-blue-200 dark:text-gray-400">v1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-blue-800 dark:bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center text-white">
                  <AlertTriangle className="h-8 w-8 mr-2" />
                  <span className="text-2xl font-bold">C.A.R.E.</span>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                      location.pathname === item.href
                        ? 'bg-blue-900 dark:bg-gray-900 text-white'
                        : 'text-blue-100 dark:text-gray-300 hover:bg-blue-700 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 text-blue-200 dark:text-gray-400" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-900 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-white">Admin Portal</p>
                  <p className="text-xs text-blue-200 dark:text-gray-400">v1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;