import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { useCallback } from 'react'

const Tracking = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [responders, setResponders] = useState([
    { 
      id: 1, 
      name: 'Ambulance A', 
      distance: '2km',
      type: 'Advanced Life Support',
      staff: '3 Paramedics',
      status: 'Available',
      equipment: ['Defibrillator', 'Ventilator', 'Emergency Medications']
    },
    { 
      id: 2, 
      name: 'Emergency Unit B', 
      distance: '3.5km',
      type: 'Basic Life Support',
      staff: '2 EMTs',
      status: 'En Route',
      equipment: ['First Aid Kit', 'Oxygen Supply', 'Stretcher']
    },
    { 
      id: 3, 
      name: 'Medical Team C', 
      distance: '4km',
      type: 'Rapid Response',
      staff: '1 Doctor, 2 Nurses',
      status: 'Available',
      equipment: ['Trauma Kit', 'Mobile Lab', 'Critical Care Equipment']
    },
  ])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate new data
    setTimeout(() => {
      setResponders([
        { 
          id: 1, 
          name: 'Ambulance A', 
          distance: Math.floor(Math.random() * 5) + 'km',
          type: 'Advanced Life Support',
          staff: '3 Paramedics',
          status: 'Available',
          equipment: ['Defibrillator', 'Ventilator', 'Emergency Medications']
        },
        { 
          id: 2, 
          name: 'Emergency Unit B', 
          distance: Math.floor(Math.random() * 5) + 'km',
          type: 'Basic Life Support',
          staff: '2 EMTs',
          status: 'En Route',
          equipment: ['First Aid Kit', 'Oxygen Supply', 'Stretcher']
        },
        { 
          id: 3, 
          name: 'Medical Team C', 
          distance: Math.floor(Math.random() * 5) + 'km',
          type: 'Rapid Response',
          staff: '1 Doctor, 2 Nurses',
          status: 'Available',
          equipment: ['Trauma Kit', 'Mobile Lab', 'Critical Care Equipment']
        },
      ])
      setRefreshing(false)
    }, 1000)
  }, [])

  return (
    <ScrollView 
      className="flex-1 bg-gray-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Map Placeholder */}
        <View className="h-48 bg-gray-800 rounded-lg items-center justify-center mb-4">
          <Text className="text-gray-300 text-lg">Live Map Here</Text>
        </View>

        {/* Status Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-rose-600 p-4 rounded-lg flex-1 mr-2">
            <Text className="text-gray-100 font-bold">ETA</Text>
            <Text className="text-gray-100 text-lg">4 mins</Text>
            <Text className="text-gray-200 text-sm mt-1">Next: 7 mins</Text>
          </View>
          <View className="bg-green-600 p-4 rounded-lg flex-1 ml-2">
            <Text className="text-gray-100 font-bold">Status</Text>
            <Text className="text-gray-100 text-lg">En Route</Text>
            <Text className="text-gray-200 text-sm mt-1">3 Units Available</Text>
          </View>
        </View>

        {/* Responders List */}
        <Text className="text-xl font-bold mb-3 text-red-100">Nearby Responders</Text>
        {responders.map((responder) => (
          <TouchableOpacity key={responder.id}>
            <View className="bg-gray-800 p-4 rounded-lg mb-2 shadow-sm border border-red-900/20">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-red-50">{responder.name}</Text>
                <Text className="text-gray-400">{responder.distance} away</Text>
              </View>
              <Text className="text-gray-400 mt-1">{responder.type}</Text>
              <Text className="text-gray-400">Staff: {responder.staff}</Text>
              <View className="mt-2">
                <Text className="text-gray-300 font-medium">Equipment:</Text>
                <View className="flex-row flex-wrap mt-1">
                  {responder.equipment.map((item, index) => (
                    <Text key={index} className="text-gray-400 text-sm mr-2">• {item}</Text>
                  ))}
                </View>
              </View>
              <View className="mt-2 bg-gray-700/50 px-3 py-1 rounded-full self-start">
                <Text className={`text-sm ${responder.status === 'Available' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {responder.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export default Tracking
