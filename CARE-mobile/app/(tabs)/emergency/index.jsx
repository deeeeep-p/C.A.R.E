import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Camera } from 'lucide-react-native';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { Platform } from 'react-native';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Default location (fallback)
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194
};

export default function EmergencyRecordingApp() {
  // State declarations remain the same
  const router = useRouter();
  const [emergencyType, setEmergencyType] = useState(null)
  const buttonScale = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState(['Welcome to Emergency Recording App']);
  const [clientId, setClientId] = useState('Not connected');
  const [wsStatus, setWsStatus] = useState('Connecting...');
  const [services, setServices] = useState({});
  const [pendingRequests, setPendingRequests] = useState(new Map());
  
  const webSocketRef = useRef(null);
 

  // Start recording function
  async function startRecording() {
    try {
      // Check if there's an existing recording and stop it
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
      }
  
      setStatus('requesting permissions');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      setStatus('starting recording');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setStatus('recording');
    //   addMessage('Recording started...', 'info');
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatus('idle');
    //   addMessage('Failed to start recording: ' + err.message, 'error');
    }
  }

  // Stop recording and get transcript
  async function stopRecording() {
    setStatus('stopping recording');
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);
    
    // Now we need to send the recording to Groq for transcription
    transcribeAudio(uri);
  }
  
  // Transcribe audio using Groq SDK
  async function transcribeAudio(audioUri) {
    try {
        setStatus('transcribing');
        // addMessage('Transcribing audio...', 'info');
        
        // Create form data with the correct file structure
        const formData = new FormData();
        // Ensure proper file path handling for Android/iOS
        const fileUri = Platform.OS === 'android' ? audioUri : audioUri.replace('file://', '');
        
        formData.append('file', {
          uri: fileUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        });
        
        const url = process.env.FLASK_URL || 'http://192.168.0.137:5000/transcribe';
        console.log('Sending request to:', url);
        
        // Send to server-side endpoint
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        if (!result.text) {
          throw new Error('Invalid response format');
        }
        
        setTranscript(result.text);
        setStatus('transcribed');
        // addMessage('Transcription completed!', 'success');
        
      } catch (error) {
        console.error('Transcription error:', error);
        setStatus('error');
        addMessage(`Transcription failed: ${error.message}`, 'error');
      }
    }
    // Process emergency with current transcript and location
    async function processEmergency() {
      if (!transcript || !location || !clientId || wsStatus !== 'Connected') {
        console.log('Cannot process: Ensure transcription is complete and WebSocket is connected.', 'warning');
        return;
      }
      
      setStatus('processing');
      
      const requestPayload = {
        transcript: transcript,
        lat: location.latitude,
        lng: location.longitude,
        clientId: clientId,
      };
      
      try {
        const response = await fetch('http://192.168.0.137:3000/emergency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          const requestId = responseData.requestId;
          console.log(`Request queued successfully! Request ID: ${requestId}`, 'success');
          
          // Call handleProcessingResult with initial state
          handleProcessingResult({
            requestId: requestId,
            status: 'queued',
            timestamp: new Date().toISOString()
          });
          
          // Add to pending requests
          setPendingRequests((prev) => {
            const newMap = new Map(prev);
            newMap.set(requestId, { timestamp: new Date().toISOString() });
            return newMap;
          });
          handleProcessingResult({
            requestId: requestId,
            status: 'processing',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`Error queuing request: ${responseData.error || response.statusText}`, 'error');
        }
      } catch (error) {
        console.error('Error sending emergency request:', error);
        console.log(`Failed to send emergency request: ${error.message}`, 'error');
      } finally {
        setStatus('idle');
      }
    }
    
    // Helper function to add messages to the list
    function addMessage(text, type = 'info') {
      setMessages(prev => [...prev, { text, type, timestamp: new Date().toISOString() }]);
    }
    
    
    // All async functions (getLocationAsync, connectWebSocket, handleProcessingResult, 
    // startRecording, stopRecording, transcribeAudio, processEmergency, addMessage)
    // remain exactly the same as they handle logic, not UI

    // Get status color based on connection status
    function getStatusColor(status) {
      switch (status) {
        case 'Connected': return '#22c55e';
        case 'Disconnected': return '#eab308';
        case 'Error': return '#ef4444';
        default: return '#6b7280';
      }
    }

      // Get location permission and current position
      const getLocationAsync = async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              addMessage('Location permission denied. Using default location.', 'warning');
              setLocation(DEFAULT_LOCATION);
              return;
            }
            
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setLocation({ latitude, longitude });
            console.log(`Location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success');
          } catch (error) {
            console.error('Error getting location:', error);
            addMessage('Error getting location. Using default location.', 'error');
            setLocation(DEFAULT_LOCATION);
          }
        };

      // Connect to WebSocket
      // Add this function before the useEffect
const connectWebSocket = () => {
      const wsUrl = 'ws://192.168.0.137:3000';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsStatus('Connected');
        console.log('WebSocket connection established.', 'info');
      };
    
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'clientId') {
            setClientId(message.clientId);
            console.log(`Received Client ID: ${message.clientId}`, 'info');
          } else if (message.type === 'processingResult') {
            handleProcessingResult(message.payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          addMessage('Error processing WebSocket message.', 'error');
        }
      };
    
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('Error');
        addMessage('WebSocket error occurred.', 'error');
      };
    
      ws.onclose = () => {
        setWsStatus('Disconnected');
        console.log('WebSocket connection closed. Attempting to reconnect...', 'warning');
        setTimeout(connectWebSocket, 5000);
      };
    
      webSocketRef.current = ws;
    };
    
    // Modify the useEffect to use the connectWebSocket function
    useEffect(() => {
      getLocationAsync();
      connectWebSocket();
    
      return () => {
        if (webSocketRef.current) {
          webSocketRef.current.close();
        }
      };
    }, []);
    
    // Handle processing result from WebSocket
    const handleProcessingResult = (result) => {
      const requestId = result.requestId;
      console.log('Received result:', result); // Debug log
      
      // Update services for UI display
      if (result.transcript_analysis) {
        const analysis = result.transcript_analysis;
        setServices({
          person_name: analysis.person_name || "Unknown",
          summary: analysis.summary || "N/A",
          location: analysis.location_mentioned || "N/A",
          timestamp: analysis.timestamp_mentioned || "N/A",
          suggestion: analysis.suggestion || "N/A",
          depts: analysis.depts || [],
          key_issues: analysis.key_issues || [],
          type: analysis.type || "N/A"
        });
      
        // Update UI display section
        addMessage(`Analysis complete for request: ${requestId}`, 'success');
        if (analysis.summary) addMessage(`Summary: ${analysis.summary}`, 'info');
        if (analysis.location_mentioned) addMessage(`Location: ${analysis.location_mentioned}`, 'info');
        if (analysis.depts) addMessage(`Departments: ${analysis.depts.join(', ')}`, 'info');
        if (analysis.key_issues) addMessage(`Key Issues: ${analysis.key_issues.join(', ')}`, 'info');
      }
      
      // Remove from pending requests
      setPendingRequests((prev) => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
    };


    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }

    const simulateRecording = () => {
        setIsRecording(true)
        startPulseAnimation()
        // Simulate AI classification after 2 seconds
        setTimeout(() => {
            const types = ['Fire', 'Medical', 'Crime']
            setEmergencyType(types[Math.floor(Math.random() * types.length)])
            setIsRecording(false)
        }, 2000)
    }

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()
    }
return (
  <ScrollView 
    className="flex-1 bg-slate-900"
    contentContainerStyle={{ 
      flexGrow: 1,
      paddingBottom: 40
    }}
    showsVerticalScrollIndicator={false}
  >
    <View className="px-6 pt-8 space-y-8 mt-10">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="w-full mb-4"
      >
        <View className="space-y-2">
          <Text className="text-white text-3xl font-bold text-center">
            We're Here to Help
          </Text>
          <Text className="text-gray-500 text-base text-center">
  Stay calm. Speak your emergency—we’ll handle the rest.
</Text>

        </View>
      </Animated.View>

      {/* Main Call Button */}
      <Animated.View 
        style={{ 
          transform: [{ scale: isRecording ? pulseAnim : 1 }],
          alignSelf: 'center',
        }}
        entering={FadeIn.delay(400).duration(800)}
      >
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          disabled={false}
          className={`mt-10 w-60 h-60 rounded-full items-center justify-center ${
            isRecording ? 'bg-red-700' : 'bg-red-500'
          } shadow-2xl`}
          style={{
            elevation: 20,
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
          }}
          activeOpacity={0.8}
        >
          <Animated.View 
            entering={FadeIn.duration(400)}
            className="items-center"
          >
            {isRecording ? (
              <View className="items-center space-y-4">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white text-2xl font-bold">Recording...</Text>
                <Text className="text-white/90 text-base">Tap to finish</Text>
              </View>
            ) : (
              <View className="items-center space-y-3">
                <Text className="text-white text-3xl font-bold">Start</Text>
                <Text className="text-white text-xl font-semibold">Emergency Call</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
      {/* Show transcript after recording */}
      {transcript && !isRecording && (
        <Animated.View 
          entering={FadeInUp.duration(600).delay(200)}
          className="w-full space-y-6"
        >
          {/* What you said */}
          <View className="mt-12 bg-slate-800/90 rounded-3xl p-6 shadow-xl border border-zinc-800">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white text-2xl font-bold">What You Said</Text>
            </View>
            
            <Text className="text-white text-lg font-medium mb-4 leading-relaxed">
              {transcript}
            </Text>

            <TouchableOpacity
              onPress={processEmergency}
              disabled={status === 'processing'}
              className="bg-red-600 rounded-2xl py-3 px-6 shadow-lg active:opacity-80"
            >
             
  <Text className="text-white text-lg font-bold text-center">
    Send emergency alert
  </Text>


            </TouchableOpacity>
          </View>

          {/* Show analysis results after processing */}
          {services?.summary && (
            <>
              {/* Analysis Summary */}
              <View className="mt-10 bg-slate-800/90 rounded-3xl p-6 shadow-xl border border-gray-800">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-white text-2xl font-bold">Emergency Status</Text>
                  <View className="bg-red-500 px-4 py-2 rounded-full animate-pulse">
                    <Text className="text-white font-bold text-lg">URGENT</Text>
                  </View>
                </View>
                <View className="space-y-6 mt-4">
                  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                    <Text className="text-blue-400 text-base font-medium mb-2">Summary</Text>
                    <Text className="text-white text-xl">{services.summary}</Text>
                  </View>
                
                  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                    <Text className="text-blue-400 text-base font-medium mb-2">Patient Details</Text>
                    <Text className="text-white text-xl">{services.person_name}</Text>
                  </View>
                
                  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                    <Text className="text-blue-400 text-base font-medium mb-2">Medical Instructions</Text>
                    <Text className="text-white text-xl">{services.suggestion}</Text>
                  </View>
                
                  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                    <Text className="text-blue-400 text-base font-medium mb-2">Key Points</Text>
                    <Text className="text-white text-xl">{Array.isArray(services.key_issues) ? services.key_issues.join(' • ') : services.key_issues}</Text>
                  </View>
                
                  {Array.isArray(services.depts) && services.depts.length > 0 ? (
  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
    {/* <Text className="text-blue-400 text-base font-medium mb-2">Res</Text> */}
    <Text className="text-white text-xl">{services.depts.join(' • ')}</Text>
  </View>
) : (
  <View className="mb-4 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
    {/* <Text className="text-blue-400 text-base font-medium mb-2">Response Units</Text> */}
    <Text className="text-gray-400 text-base italic">
      No nearby services identified based on analysis.
    </Text>
  </View>
)}

                </View>
              
                <View className="w-full">
  <View className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
    <Text className="text-gray-400 text-sm mb-1" numberOfLines={1} ellipsizeMode="tail">
      ID: {clientId}
    </Text>
    <Text className="text-gray-400 text-sm" numberOfLines={1}>
      {new Date().toLocaleTimeString()}
    </Text>
  </View>
</View>

              </View>
              {/* Location Details */}
              {location && (
                <Animated.View 
                  entering={FadeInUp.duration(400).delay(300)}
                  className="mt-10 bg-slate-800/90 rounded-3xl p-6 shadow-xl border border-zinc-800"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="space-y-2 flex-1 mr-4">
                      <Text className="text-white text-xl font-bold">📍 Current Location</Text>
                      <Text className="text-gray-400 text-sm">
                        Your emergency services will be directed to:
                      </Text>
                      <View className="bg-slate-800/50 px-3 py-2 rounded-lg space-y-1">
                        <Text className="text-gray-300 font-medium">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          Andheri, Mumbai, India
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      className="bg-green-700 px-4 py-2 rounded-2xl active:bg-green-800"
                      onPress={() => router.push({
                        pathname: "/tracking",
                        params: {
                          lat: location.latitude,
                          lng: location.longitude,
                          // Convert array to string before passing
                          responseUnits: JSON.stringify([{
                            id: '1',
                            name: 'Emergency Response Unit',
                            type: services.type || 'Medical',
                            staff: '4 personnel',
                            equipment: services.key_issues || [],
                            status: 'En Route',
                            lat: location.latitude + 0.001, // Slightly offset for display
                            lng: location.longitude + 0.001,
                            distance: '2km'
                          }]),
                          'analysis.summary': services.summary,
                          'analysis.personName': services.person_name,
                          'analysis.suggestion': services.suggestion,
                          'analysis.keyIssues': services.key_issues?.join(', '),
                          'analysis.type': services.type
                        }
                      })}
                    >
                      <View className="items-center">
                        <Text className="text-white font-bold text-sm">Track</Text>
                        <Text className="text-blue-200 text-xs">Updates</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
              {/* Action Buttons */}
              {/* <Animated.View 
                entering={FadeInUp.duration(400).delay(400)}
                className="flex-row space-x-4 mt-4"
              >
                <TouchableOpacity
                  onPress={processEmergency}
                  disabled={status === 'processing'}
                  className="flex-1"
                >
                  <LinearGradient
                    colors={['#dc2626', '#991b1b']}
                    className="p-4 rounded-2xl"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text className="text-white text-base font-bold text-center">
                      Dispatch Emergency
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity className="bg-zinc-800 p-4 rounded-2xl flex-1">
                  <Text className="text-white text-base font-bold text-center">
                    Share Details
                  </Text>
                </TouchableOpacity>
              </Animated.View> */}
            </>
          )}
        </Animated.View>
      )}
      {/* Status Updates */}
      <ScrollView
        className="w-full mt-4"
        style={{ maxHeight: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {messages
          .filter(msg => msg.type === 'error' || msg.type === 'success')
          .slice(-3)
          .map((msg, index) => (
            <Animated.View 
              key={index}
              entering={FadeInDown.duration(300).delay(index * 100)}
              className={`mb-3 px-5 py-3 rounded-2xl ${
                msg.type === 'error' ? 'bg-red-900/60' : 'bg-emerald-900/60'
              }`}
            >
              <Text className="text-white font-semibold text-base">
                {msg.text}
              </Text>
            </Animated.View>
          ))}
      </ScrollView>
    </View>
  </ScrollView>
)
}
