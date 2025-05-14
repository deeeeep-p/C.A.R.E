import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface SettingsProps {
  setSystemStatus: (status: string) => void;
}

const Settings = ({ setSystemStatus }: SettingsProps) => {
  const [status, setStatus] = useState('online');
  const [language, setLanguage] = useState('english');
  const [notificationEmail, setNotificationEmail] = useState('admin@care-system.com');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [darkModeDefault, setDarkModeDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSystemStatus(status);
      setIsSaving(false);
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.classList.remove('translate-y-20', 'opacity-0');
        notification.classList.add('translate-y-0', 'opacity-100');
        
        setTimeout(() => {
          notification.classList.remove('translate-y-0', 'opacity-100');
          notification.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* System Status */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Operational Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="online">Online (Fully Operational)</option>
                <option value="maintenance">Maintenance Mode</option>
                <option value="offline">Offline (Emergency Only)</option>
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {status === 'online' 
                  ? 'System is fully operational and responding to all emergency calls.' 
                  : status === 'maintenance' 
                  ? 'System is undergoing maintenance. Only critical functions are available.' 
                  : 'System is offline. Only direct emergency phone lines are operational.'}
              </p>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Language & Region</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Language
              </label>
              <select
                id="language"
                name="language"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="chinese">Chinese</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="secondaryLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secondary Language
                </label>
                <select
                  id="secondaryLanguage"
                  name="secondaryLanguage"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">None</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="chinese">Chinese</option>
                  <option value="arabic">Arabic</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Pacific/Honolulu">(GMT-10:00) Hawaii</option>
                  <option value="America/Anchorage">(GMT-09:00) Alaska</option>
                  <option value="America/Los_Angeles">(GMT-08:00) Pacific Time</option>
                  <option value="America/Denver">(GMT-07:00) Mountain Time</option>
                  <option value="America/Chicago">(GMT-06:00) Central Time</option>
                  <option value="America/New_York">(GMT-05:00) Eastern Time</option>
                  <option value="America/Halifax">(GMT-04:00) Atlantic Time</option>
                  <option value="Europe/London">(GMT+00:00) London</option>
                  <option value="Europe/Paris">(GMT+01:00) Paris</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alert Email Address
              </label>
              <input
                type="email"
                id="notificationEmail"
                name="notificationEmail"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailCritical"
                    name="emailCritical"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailCritical" className="font-medium text-gray-700 dark:text-gray-300">
                    Critical alerts
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">Send email for all critical incidents.</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailSummary"
                    name="emailSummary"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    defaultChecked
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailSummary" className="font-medium text-gray-700 dark:text-gray-300">
                    Daily summary
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">Send daily summary of all incidents and response times.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Display Settings</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="autoRefresh"
                  name="autoRefresh"
                  type="checkbox"
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="autoRefresh" className="font-medium text-gray-700 dark:text-gray-300">
                  Auto-refresh data
                </label>
                <p className="text-gray-500 dark:text-gray-400">Automatically refresh incident data.</p>
              </div>
            </div>

            {autoRefresh && (
              <div className="ml-7 mt-2">
                <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refresh interval (seconds)
                </label>
                <input
                  type="number"
                  id="refreshInterval"
                  name="refreshInterval"
                  min="5"
                  max="300"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                />
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="darkModeDefault"
                    name="darkModeDefault"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    checked={darkModeDefault}
                    onChange={(e) => setDarkModeDefault(e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="darkModeDefault" className="font-medium text-gray-700 dark:text-gray-300">
                    Dark mode as default
                  </label>
                  <p className="text-gray-500 dark:text-gray-400">Use dark theme as the default appearance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSaving
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success notification */}
      <div
        id="notification"
        className="fixed bottom-0 right-0 m-6 p-4 bg-green-100 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-200 rounded shadow-md transform translate-y-20 opacity-0 transition-all duration-500 ease-in-out"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Settings saved successfully!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;