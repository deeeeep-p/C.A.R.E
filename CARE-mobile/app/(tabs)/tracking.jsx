import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Dimensions, StyleSheet } from 'react-native'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useCallback } from 'react'
import { useLocalSearchParams } from 'expo-router'
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'

const { width } = Dimensions.get('window')

const Tracking = () => {
  const params = useLocalSearchParams()
  const [refreshing, setRefreshing] = useState(false)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const mapRef = useRef(null)
  const [responders, setResponders] = useState([]) // Add this line

  // Memoize parsed response units
  const initialResponders = useMemo(() => {
    try {
      return params.responseUnits ? JSON.parse(params.responseUnits) : []
    } catch (error) {
      console.error('Error parsing response units:', error)
      return []
    }
  }, [params.responseUnits])

  // Memoize parsed nearby services
  const nearbyServices = useMemo(() => {
    try {
      return params.closest_nearby_services ? 
        JSON.parse(params.closest_nearby_services) : {}
    } catch (error) {
      console.error('Error parsing nearby services:', error)
      return {}
    }
  }, [params.closest_nearby_services])

  // Memoize user location
  const userLocation = useMemo(() => ({
    latitude: parseFloat(params.lat) || 0,
    longitude: parseFloat(params.lng) || 0
  }), [params.lat, params.lng])

  // Set initial responders only once
  useEffect(() => {
    setResponders(initialResponders)
  }, [initialResponders])

  // Update route coordinates when hospital or user location changes
  useEffect(() => {
    if (nearbyServices.hospital) {
      const coordinates = [
        userLocation,
        {
          latitude: nearbyServices.hospital.lat,
          longitude: nearbyServices.hospital.lng
        }
      ]
      setRouteCoordinates(coordinates)

      if (mapRef.current) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        })
      }
    }
  }, [nearbyServices.hospital, userLocation])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderResponder = useCallback((responder) => (
    <TouchableOpacity key={responder.id}>
      <View className="bg-gray-800 p-4 rounded-lg mb-2 shadow-sm border border-red-900/20">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-red-50">{responder.name || 'Unknown'}</Text>
          <Text className="text-gray-400">{responder.distance || 'N/A'} away</Text>
        </View>
        <Text className="text-gray-400 mt-1">{responder.type || 'N/A'}</Text>
        <Text className="text-gray-400">Staff: {responder.staff || 'N/A'}</Text>
        {responder.equipment && (
          <View className="mt-2">
            <Text className="text-gray-300 font-medium">Equipment:</Text>
            <View className="flex-row flex-wrap mt-1">
              {responder.equipment.slice(0, 5).map((item, index) => (
                <Text key={index} className="text-gray-400 text-sm mr-2">• {item}</Text>
              ))}
            </View>
          </View>
        )}
        <View className="mt-2 bg-gray-700/50 px-3 py-1 rounded-full self-start">
          <Text className={`text-sm ${responder.status === 'Available' ? 'text-green-400' : 'text-yellow-400'}`}>
            {responder.status || 'Unknown'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [])

  return (
    <ScrollView 
      className="flex-1 bg-gray-950"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* User Location Marker */}
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="red"
            />
            
            {/* Hospital Marker */}
            {nearbyServices.hospital && (
              <Marker
                coordinate={{
                  latitude: nearbyServices.hospital.lat,
                  longitude: nearbyServices.hospital.lng
                }}
                title={nearbyServices.hospital.name}
                description={`${nearbyServices.hospital.distance_meters.toFixed(2)}m away`}
                pinColor="blue"
              />
            )}

            {/* Route Line */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#FF0000"
                strokeWidth={3}
                lineDashPattern={[1]}
              />
            )}

            {/* Coverage Circle */}
            <Circle
              center={userLocation}
              radius={500}
              fillColor="rgba(255, 0, 0, 0.1)"
              strokeColor="rgba(255, 0, 0, 0.3)"
            />
          </MapView>
        </View>

        {/* Nearby Services */}
        <View className="mb-4">
          <Text className="text-xl font-bold mb-3 text-red-100">Nearby Services</Text>
          {nearbyServices.hospital ? (
            <View className="bg-gray-800 p-4 rounded-lg mb-2 shadow-sm border border-blue-900/20">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-blue-50">{nearbyServices.hospital.name}</Text>
                <Text className="text-gray-400">{nearbyServices.hospital.distance_meters.toFixed(2)}m away</Text>
              </View>
              <Text className="text-gray-400 mt-1">ID: {nearbyServices.hospital.id}</Text>
              <Text className="text-gray-400">
                Location: {nearbyServices.hospital.lat}, {nearbyServices.hospital.lng}
              </Text>
            </View>
          ) : (
            <Text className="text-gray-400">No nearby hospitals found</Text>
          )}
        </View>

        {/* Existing Status Cards and Responders List */}
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
        {responders.slice(0, 10).map(renderResponder)}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 288,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  }
});

export default Tracking
