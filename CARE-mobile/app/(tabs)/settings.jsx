// import { View, Text, Switch, ScrollView } from "react-native";
// import React, { useState } from "react";
// import { Picker } from "@react-native-picker/picker";
// import { MaterialIcons } from "@expo/vector-icons";

// const Settings = () => {
//   const [selectedLanguage, setSelectedLanguage] = useState("english");
//   const [textToSpeech, setTextToSpeech] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);

//   return (
//     <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
//       <View className="p-4">
//         {/* Language Selection */}
//         <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
//           <View className="flex-row items-center mb-2">
//             <MaterialIcons
//               name="language"
//               size={24}
//               color={darkMode ? "#fff" : "#374151"}
//             />
//             <Text className="text-lg font-semibold ml-2 dark:text-white">
//               Language
//             </Text>
//           </View>
//           <Picker
//             selectedValue={selectedLanguage}
//             onValueChange={(value) => setSelectedLanguage(value)}
//             className="bg-gray-100 dark:bg-gray-700 rounded"
//           >
//             <Picker.Item label="English" value="english" />
//             <Picker.Item label="हिंदी (Hindi)" value="hindi" />
//             <Picker.Item label="தமிழ் (Tamil)" value="tamil" />
//           </Picker>
//         </View>

//         {/* Accessibility Settings */}
//         <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center">
//               <MaterialIcons
//                 name="record-voice-over"
//                 size={24}
//                 color={darkMode ? "#fff" : "#374151"}
//               />
//               <Text className="text-lg font-semibold ml-2 dark:text-white">
//                 Text-to-Speech Alerts
//               </Text>
//             </View>
//             <Switch
//               value={textToSpeech}
//               onValueChange={setTextToSpeech}
//               trackColor={{ false: "#767577", true: "#2563eb" }}
//             />
//           </View>
//         </View>

//         {/* Dark Mode Toggle */}
//         <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center">
//               <MaterialIcons
//                 name="dark-mode"
//                 size={24}
//                 color={darkMode ? "#fff" : "#374151"}
//               />
//               <Text className="text-lg font-semibold ml-2 dark:text-white">
//                 Dark Mode
//               </Text>
//             </View>
//             <Switch
//               value={darkMode}
//               onValueChange={setDarkMode}
//               trackColor={{ false: "#767577", true: "#2563eb" }}
//             />
//           </View>
//         </View>

//         {/* About Section */}
//         <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
//           <View className="flex-row items-center mb-2">
//             <MaterialIcons
//               name="info"
//               size={24}
//               color={darkMode ? "#fff" : "#374151"}
//             />
//             <Text className="text-lg font-semibold ml-2 dark:text-white">
//               About
//             </Text>
//           </View>
//           <Text className="text-gray-600 dark:text-gray-300">
//             Powered by CARE – AI Emergency Response engine
//           </Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default Settings;

import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button, StyleSheet, Vibration } from "react-native";
import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";

const CRASH_THRESHOLD = 2.5;

export default function Settings() {
  const [subscription, setSubscription] = useState(null);
  const [crashDetected, setCrashDetected] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const subscribe = () => {
      const sub = Accelerometer.addListener(({ x, y, z }) => {
        const force = Math.sqrt(x * x + y * y + z * z);
        console.log(force);
        if (force > CRASH_THRESHOLD && !crashDetected) {
          handleCrash();
        }
      });
      Accelerometer.setUpdateInterval(300);
      setSubscription(sub);
    };

    const getPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      subscribe();
    };

    getPermission();

    return () => {
      subscription?.remove();
      setSubscription(null);
    };
  }, [crashDetected]);

  const handleCrash = async () => {
    setCrashDetected(true);
    Vibration.vibrate();
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    Alert.alert(
      "Crash Detected!",
      "We detected a sudden impact. Alerting emergency services in 10 seconds...",
      [
        {
          text: "Cancel",
          onPress: () => setCrashDetected(false),
          style: "cancel",
        },
      ],
      { cancelable: false }
    );

    setTimeout(() => {
      if (crashDetected) sendEmergencyAlert(loc.coords);
    }, 10000);
  };

  const sendEmergencyAlert = (coords) => {
    Alert.alert(
      "🚨 Emergency Alert Sent",
      `Location: ${coords.latitude}, ${coords.longitude}`
    );
    // TODO: Integrate HERE Maps or SMS/email APIs
    setCrashDetected(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crash Detection Active</Text>
      <Text style={styles.text}>Monitoring accelerometer data...</Text>
      {location && (
        <Text style={styles.text}>
          Last Location: {location.latitude.toFixed(4)},{" "}
          {location.longitude.toFixed(4)}
        </Text>
      )}
      <Button title="Simulate Crash" onPress={handleCrash} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#040417",
  },
  title: { fontSize: 22, color: "white", marginBottom: 20 },
  text: { fontSize: 16, color: "white", marginVertical: 5 },
});
