import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Users, Phone, CheckSquare, AlertTriangle, ShieldAlert, Flame, Heart as Heartbeat } from 'lucide-react';
import { areaEmergencyStats, responseTimeStats, systemStats } from '../data/mockIncidents';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
          <Clock className="w-5 h-5 mr-2" />
          <span>{currentTime.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Calls Today" 
          value={systemStats.totalCallsToday.toString()} 
          icon={<Phone className="h-8 w-8 text-blue-600" />} 
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Pending Calls" 
          value={systemStats.pendingCalls.toString()} 
          icon={<AlertTriangle className="h-8 w-8 text-amber-500" />} 
          trend="down"
          trendValue="5%"
        />
        <StatCard 
          title="Active Dispatches" 
          value={systemStats.activeDispatches.toString()} 
          icon={<Users className="h-8 w-8 text-indigo-600" />} 
          trend="up"
          trendValue="8%"
        />
        <StatCard 
          title="Resolved Today" 
          value={systemStats.resolvedToday.toString()} 
          icon={<CheckSquare className="h-8 w-8 text-green-600" />} 
          trend="up"
          trendValue="15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Area Emergency Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={areaEmergencyStats}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Legend />
                <Bar dataKey="police" name="Police" stackId="a" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fire" name="Fire" stackId="a" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ambulance" name="Medical" stackId="a" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Active Responders</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 mr-4">
                <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Police Units</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                  {systemStats.activeResponders.police}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-800 mr-4">
                <Flame className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Fire Units</p>
                <p className="text-xl font-semibold text-red-600 dark:text-red-300">
                  {systemStats.activeResponders.fire}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-800 mr-4">
                <Heartbeat className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Medical Units</p>
                <p className="text-xl font-semibold text-green-600 dark:text-green-300">
                  {systemStats.activeResponders.ambulance}
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">System Uptime</div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {systemStats.systemUptime}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${systemStats.systemUptime}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Response Time Trends (Past Week)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={responseTimeStats}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="police" 
                name="Police" 
                stroke="#1E40AF" 
                fill="#1E40AF" 
                fillOpacity={0.2} 
              />
              <Area 
                type="monotone" 
                dataKey="fire" 
                name="Fire" 
                stroke="#DC2626" 
                fill="#DC2626" 
                fillOpacity={0.2} 
              />
              <Area 
                type="monotone" 
                dataKey="ambulance" 
                name="Medical" 
                stroke="#059669" 
                fill="#059669" 
                fillOpacity={0.2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;