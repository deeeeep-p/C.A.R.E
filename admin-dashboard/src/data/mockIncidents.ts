// Mock data for emergency incidents
export interface Incident {
  id: string;
  type: 'police' | 'fire' | 'ambulance';
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  timestamp: string;
  status: 'pending' | 'dispatched' | 'inProgress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
}

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    type: 'police',
    location: '123 Main St, Downtown',
    coordinates: [34.0522, -118.2437], // Los Angeles
    timestamp: '2025-04-23T10:30:15Z',
    status: 'dispatched',
    priority: 'high',
    description: 'Suspected break-in at local business',
    reportedBy: 'Store security system'
  },
  {
    id: 'INC-002',
    type: 'fire',
    location: '456 Oak Ave, Westside',
    coordinates: [34.0650, -118.4695], // Santa Monica
    timestamp: '2025-04-23T11:15:00Z',
    status: 'inProgress',
    priority: 'critical',
    description: 'Building fire with possible trapped occupants',
    reportedBy: 'Multiple callers'
  },
  {
    id: 'INC-003',
    type: 'ambulance',
    location: '789 Elm St, Northside',
    coordinates: [34.1478, -118.1445], // Pasadena
    timestamp: '2025-04-23T09:45:30Z',
    status: 'inProgress',
    priority: 'high',
    description: 'Elderly person fallen, possible hip fracture',
    reportedBy: 'Neighbor'
  },
  {
    id: 'INC-004',
    type: 'police',
    location: '234 Pine Rd, Eastside',
    coordinates: [34.0224, -118.2851], // USC area
    timestamp: '2025-04-23T12:10:45Z',
    status: 'pending',
    priority: 'medium',
    description: 'Suspicious activity reported in parking garage',
    reportedBy: 'Anonymous tip'
  },
  {
    id: 'INC-005',
    type: 'ambulance',
    location: '567 Maple Dr, Southside',
    coordinates: [33.9416, -118.4085], // Inglewood
    timestamp: '2025-04-23T08:20:15Z',
    status: 'resolved',
    priority: 'high',
    description: 'Cardiac emergency, patient transported to hospital',
    reportedBy: 'Family member'
  },
  {
    id: 'INC-006',
    type: 'fire',
    location: '890 Cedar Blvd, Westside',
    coordinates: [34.0211, -118.4814], // Culver City
    timestamp: '2025-04-22T23:15:30Z',
    status: 'resolved',
    priority: 'medium',
    description: 'Small kitchen fire, contained by residents',
    reportedBy: 'Resident'
  },
  {
    id: 'INC-007',
    type: 'police',
    location: '123 Birch St, Downtown',
    coordinates: [34.0407, -118.2468], // DTLA
    timestamp: '2025-04-23T02:45:00Z',
    status: 'resolved',
    priority: 'low',
    description: 'Noise complaint at local nightclub',
    reportedBy: 'Multiple neighbors'
  }
];

// Mock data for emergency responders
export interface Responder {
  id: string;
  type: 'police' | 'fire' | 'ambulance';
  callsign: string;
  coordinates: [number, number]; // [latitude, longitude]
  status: 'available' | 'enRoute' | 'onScene' | 'returning';
  assignedIncident: string | null;
}

export const mockResponders: Responder[] = [
  {
    id: 'R-001',
    type: 'police',
    callsign: 'Unit 12',
    coordinates: [34.0536, -118.2400],
    status: 'enRoute',
    assignedIncident: 'INC-001'
  },
  {
    id: 'R-002',
    type: 'fire',
    callsign: 'Engine 5',
    coordinates: [34.0660, -118.4680],
    status: 'onScene',
    assignedIncident: 'INC-002'
  },
  {
    id: 'R-003',
    type: 'ambulance',
    callsign: 'Medic 7',
    coordinates: [34.1470, -118.1430],
    status: 'onScene',
    assignedIncident: 'INC-003'
  },
  {
    id: 'R-004',
    type: 'police',
    callsign: 'Unit 8',
    coordinates: [34.0350, -118.3000],
    status: 'available',
    assignedIncident: null
  },
  {
    id: 'R-005',
    type: 'ambulance',
    callsign: 'Medic 3',
    coordinates: [33.9200, -118.3300],
    status: 'available',
    assignedIncident: null
  }
];

// Area-wise emergency statistics for the past week
export const areaEmergencyStats = [
  { area: 'Downtown', police: 24, fire: 8, ambulance: 16 },
  { area: 'Westside', police: 18, fire: 12, ambulance: 19 },
  { area: 'Eastside', police: 29, fire: 6, ambulance: 14 },
  { area: 'Northside', police: 15, fire: 5, ambulance: 10 },
  { area: 'Southside', police: 32, fire: 11, ambulance: 22 }
];

// Emergency response time statistics (in minutes)
export const responseTimeStats = [
  { date: '04/17', police: 5.2, fire: 4.1, ambulance: 7.3 },
  { date: '04/18', police: 4.8, fire: 4.3, ambulance: 6.9 },
  { date: '04/19', police: 6.1, fire: 3.9, ambulance: 7.5 },
  { date: '04/20', police: 5.5, fire: 4.5, ambulance: 7.1 },
  { date: '04/21', police: 4.9, fire: 4.2, ambulance: 6.7 },
  { date: '04/22', police: 5.3, fire: 3.8, ambulance: 7.0 },
  { date: '04/23', police: 5.0, fire: 4.0, ambulance: 6.5 }
];

// System summary stats
export const systemStats = {
  totalCallsToday: 127,
  pendingCalls: 15,
  activeDispatches: 23,
  resolvedToday: 89,
  averageResponseTime: 5.2,
  systemUptime: 99.98,
  activeResponders: {
    police: 28,
    fire: 15,
    ambulance: 22
  }
};

// Call logs with more detailed information
export interface CallLog {
  id: string;
  type: 'police' | 'fire' | 'ambulance';
  location: string;
  timestamp: string;
  status: 'pending' | 'dispatched' | 'inProgress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  callerName: string;
  callerPhone: string;
  notes: string;
  dispatchTime?: string;
  arrivalTime?: string;
  resolvedTime?: string;
}

export const callLogs: CallLog[] = [
  {
    id: 'CALL-001',
    type: 'police',
    location: '123 Main St, Downtown',
    timestamp: '2025-04-23T10:30:15Z',
    status: 'dispatched',
    priority: 'high',
    description: 'Suspected break-in at local business',
    callerName: 'Security System',
    callerPhone: 'N/A',
    notes: 'Alarm triggered, video shows possible entry through rear door',
    dispatchTime: '2025-04-23T10:32:05Z'
  },
  {
    id: 'CALL-002',
    type: 'fire',
    location: '456 Oak Ave, Westside',
    timestamp: '2025-04-23T11:15:00Z',
    status: 'inProgress',
    priority: 'critical',
    description: 'Building fire with possible trapped occupants',
    callerName: 'Jane Smith',
    callerPhone: '555-123-4567',
    notes: 'Smoke visible from 3rd floor, multiple callers reporting the same incident',
    dispatchTime: '2025-04-23T11:16:22Z',
    arrivalTime: '2025-04-23T11:23:15Z'
  },
  {
    id: 'CALL-003',
    type: 'ambulance',
    location: '789 Elm St, Northside',
    timestamp: '2025-04-23T09:45:30Z',
    status: 'inProgress',
    priority: 'high',
    description: 'Elderly person fallen, possible hip fracture',
    callerName: 'Bob Jones',
    callerPhone: '555-987-6543',
    notes: '83-year-old female, unable to move, experiencing pain',
    dispatchTime: '2025-04-23T09:47:10Z',
    arrivalTime: '2025-04-23T09:59:45Z'
  },
  {
    id: 'CALL-004',
    type: 'police',
    location: '234 Pine Rd, Eastside',
    timestamp: '2025-04-23T12:10:45Z',
    status: 'pending',
    priority: 'medium',
    description: 'Suspicious activity reported in parking garage',
    callerName: 'Anonymous',
    callerPhone: 'Unknown',
    notes: 'Caller reported individuals looking into car windows on level 2'
  },
  {
    id: 'CALL-005',
    type: 'ambulance',
    location: '567 Maple Dr, Southside',
    timestamp: '2025-04-23T08:20:15Z',
    status: 'resolved',
    priority: 'high',
    description: 'Cardiac emergency, patient transported to hospital',
    callerName: 'Sarah Williams',
    callerPhone: '555-555-1212',
    notes: '65-year-old male with chest pain and shortness of breath',
    dispatchTime: '2025-04-23T08:21:30Z',
    arrivalTime: '2025-04-23T08:27:45Z',
    resolvedTime: '2025-04-23T09:15:20Z'
  },
  {
    id: 'CALL-006',
    type: 'fire',
    location: '890 Cedar Blvd, Westside',
    timestamp: '2025-04-22T23:15:30Z',
    status: 'resolved',
    priority: 'medium',
    description: 'Small kitchen fire, contained by residents',
    callerName: 'Michael Brown',
    callerPhone: '555-789-0123',
    notes: 'Grease fire started while cooking, put out with fire extinguisher before units arrived',
    dispatchTime: '2025-04-22T23:17:10Z',
    arrivalTime: '2025-04-22T23:24:35Z',
    resolvedTime: '2025-04-22T23:45:50Z'
  },
  {
    id: 'CALL-007',
    type: 'police',
    location: '123 Birch St, Downtown',
    timestamp: '2025-04-23T02:45:00Z',
    status: 'resolved',
    priority: 'low',
    description: 'Noise complaint at local nightclub',
    callerName: 'Multiple callers',
    callerPhone: 'Various',
    notes: 'Officers spoke with manager, music volume reduced',
    dispatchTime: '2025-04-23T02:50:15Z',
    arrivalTime: '2025-04-23T03:05:30Z',
    resolvedTime: '2025-04-23T03:20:10Z'
  },
  {
    id: 'CALL-008',
    type: 'ambulance',
    location: '456 Walnut Ave, Northside',
    timestamp: '2025-04-23T14:22:10Z',
    status: 'dispatched',
    priority: 'medium',
    description: 'Sports injury at local high school',
    callerName: 'Coach Wilson',
    callerPhone: '555-321-7890',
    notes: '16-year-old student with possible ankle fracture during basketball practice',
    dispatchTime: '2025-04-23T14:24:30Z'
  },
  {
    id: 'CALL-009',
    type: 'police',
    location: '789 Cherry Ln, Southside',
    timestamp: '2025-04-23T13:15:45Z',
    status: 'cancelled',
    priority: 'medium',
    description: 'Reported car accident',
    callerName: 'John Smith',
    callerPhone: '555-111-2222',
    notes: 'Caller called back to report it was just a minor fender bender, parties exchanged information',
    dispatchTime: '2025-04-23T13:17:20Z',
    resolvedTime: '2025-04-23T13:25:10Z'
  },
  {
    id: 'CALL-010',
    type: 'fire',
    location: '321 Spruce St, Eastside',
    timestamp: '2025-04-23T07:30:00Z',
    status: 'resolved',
    priority: 'low',
    description: 'Smoke detector activation, no fire',
    callerName: 'Automated System',
    callerPhone: 'N/A',
    notes: 'False alarm, system malfunction, reset by fire department',
    dispatchTime: '2025-04-23T07:31:45Z',
    arrivalTime: '2025-04-23T07:40:20Z',
    resolvedTime: '2025-04-23T07:55:10Z'
  }
];