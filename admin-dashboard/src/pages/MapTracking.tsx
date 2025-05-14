import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Filter, Shield, Flame, Heart as Heartbeat } from 'lucide-react';
import { mockIncidents, mockResponders, Incident, Responder } from '../data/mockIncidents';

// Leaflet CSS import
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const policeIcon = createCustomIcon('#1E40AF'); // blue
const fireIcon = createCustomIcon('#DC2626'); // red
const ambulanceIcon = createCustomIcon('#059669'); // green
const responderIcon = createCustomIcon('#FCD34D'); // yellow for responders

// Map center updater component
const MapViewUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapTracking = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [responders, setResponders] = useState<Responder[]>(mockResponders);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([34.0522, -118.2437]); // Los Angeles
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update responder positions with slight movements
      setResponders(prevResponders => 
        prevResponders.map(responder => ({
          ...responder,
          coordinates: [
            responder.coordinates[0] + (Math.random() - 0.5) * 0.001,
            responder.coordinates[1] + (Math.random() - 0.5) * 0.001
          ]
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter incidents based on search and type filter
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchTerm === '' || 
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = filterType === 'all' || incident.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle incident selection
  const handleIncidentClick = (incident: Incident) => {
    setActiveIncident(incident);
    setMapCenter(incident.coordinates);
  };

  // Get icon based on incident type
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'police': return policeIcon;
      case 'fire': return fireIcon;
      case 'ambulance': return ambulanceIcon;
      default: return DefaultIcon;
    }
  };

  // Get color based on incident type for UI elements
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'police': return 'bg-blue-600 text-white';
      case 'fire': return 'bg-red-600 text-white';
      case 'ambulance': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Get icon component based on incident type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'police': return <Shield className="h-5 w-5" />;
      case 'fire': return <Flame className="h-5 w-5" />;
      case 'ambulance': return <Heartbeat className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-9rem)]">
        {/* Sidebar with incident list */}
        <div className="w-full lg:w-96 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden lg:mr-4 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Incidents</h2>
            
            {/* Search and filters */}
            <div className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center mt-3">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterType === 'all' 
                        ? 'bg-gray-200 dark:bg-gray-700' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterType === 'police' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => setFilterType('police')}
                  >
                    Police
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterType === 'fire' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => setFilterType('fire')}
                  >
                    Fire
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      filterType === 'ambulance' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    onClick={() => setFilterType('ambulance')}
                  >
                    Medical
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredIncidents.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No incidents found matching your criteria.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredIncidents.map((incident) => (
                  <li 
                    key={incident.id}
                    className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      activeIncident?.id === incident.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(incident.type)}`}>
                          {getTypeIcon(incident.type)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{incident.id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{incident.location}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          incident.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          incident.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {incident.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">{incident.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          incident.status === 'dispatched' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          incident.status === 'inProgress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {incident.status === 'inProgress' ? 'In Progress' : incident.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(incident.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Map container */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-md lg:h-full h-[60vh] mb-4 lg:mb-0">
          <MapContainer 
            center={mapCenter} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapViewUpdater center={mapCenter} />
            
            {/* Render incident markers */}
            {filteredIncidents.map((incident) => (
              <Marker 
                key={incident.id} 
                position={incident.coordinates}
                icon={getIncidentIcon(incident.type)}
                eventHandlers={{
                  click: () => {
                    setActiveIncident(incident);
                  },
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">{incident.id}</h3>
                    <p className="font-semibold text-xs mt-1">{incident.type.toUpperCase()}</p>
                    <p className="mt-1">{incident.location}</p>
                    <p className="mt-1">{incident.description}</p>
                    <p className="mt-1">
                      <span className="font-semibold">Status:</span> {incident.status}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Priority:</span> {incident.priority}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Render responder markers */}
            {responders.map((responder) => (
              <Marker 
                key={responder.id} 
                position={responder.coordinates}
                icon={responderIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">{responder.callsign}</h3>
                    <p className="font-semibold text-xs mt-1">{responder.type.toUpperCase()} Unit</p>
                    <p className="mt-1">
                      <span className="font-semibold">Status:</span> {responder.status}
                    </p>
                    {responder.assignedIncident && (
                      <p className="mt-1">
                        <span className="font-semibold">Assigned to:</span> {responder.assignedIncident}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapTracking;