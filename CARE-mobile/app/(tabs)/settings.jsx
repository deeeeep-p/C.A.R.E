import { View, Text, Switch, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { MaterialIcons } from '@expo/vector-icons'

const Settings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english')
  const [textToSpeech, setTextToSpeech] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Language Selection */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="language" size={24} color={darkMode ? '#fff' : '#374151'} />
            <Text className="text-lg font-semibold ml-2 dark:text-white">Language</Text>
          </View>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value)}
            className="bg-gray-100 dark:bg-gray-700 rounded"
          >
            <Picker.Item label="English" value="english" />
            <Picker.Item label="हिंदी (Hindi)" value="hindi" />
            <Picker.Item label="தமிழ் (Tamil)" value="tamil" />
          </Picker>
        </View>

        {/* Accessibility Settings */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="record-voice-over" size={24} color={darkMode ? '#fff' : '#374151'} />
              <Text className="text-lg font-semibold ml-2 dark:text-white">Text-to-Speech Alerts</Text>
            </View>
            <Switch
              value={textToSpeech}
              onValueChange={setTextToSpeech}
              trackColor={{ false: '#767577', true: '#2563eb' }}
            />
          </View>
        </View>

        {/* Dark Mode Toggle */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="dark-mode" size={24} color={darkMode ? '#fff' : '#374151'} />
              <Text className="text-lg font-semibold ml-2 dark:text-white">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#2563eb' }}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="info" size={24} color={darkMode ? '#fff' : '#374151'} />
            <Text className="text-lg font-semibold ml-2 dark:text-white">About</Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300">
            Powered by CARE – AI Emergency Response
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default Settings
