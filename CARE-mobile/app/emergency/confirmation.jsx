import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';

export default function ConfirmationScreen() {
  const router = useRouter();
  
  // Simulated emergency details
  const emergencyDetails = {
    type: "Medical",
    location: "MG Road, Delhi",
    eta: "4"
  };

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center px-6">
      {/* Success Icon Animation */}
      <Animatable.View 
        animation="bounceIn"
        duration={1500}
        className="mb-8"
      >
        <Ionicons 
          name="checkmark-circle" 
          size={120} 
          color="#22c55e"
        />
      </Animatable.View>

      {/* Success Message */}
      <Text className="text-2xl font-bold text-gray-100 mb-8 text-center">
        Emergency Alert Sent Successfully
      </Text>

      {/* Emergency Details */}
      <View className="w-full bg-gray-800 rounded-xl p-6 mb-8">
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-300">Emergency Type:</Text>
          <Text className="font-semibold text-white">{emergencyDetails.type}</Text>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-300">Location Sent:</Text>
          <Text className="font-semibold text-white">{emergencyDetails.location}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-gray-300">ETA:</Text>
          <Text className="font-semibold text-white">
            Help arriving in ~{emergencyDetails.eta} mins
          </Text>
        </View>
      </View>

      {/* Return Home Button */}
      <TouchableOpacity
        onPress={() => {
          router.push('/');
        }}
        className="w-full bg-gray-700 active:bg-green-500 py-4 rounded-full"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Return to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}
