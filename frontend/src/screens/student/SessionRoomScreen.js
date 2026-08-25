import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { showAlert } from '../../utils/alert';

const SessionRoomScreen = ({ route, navigation }) => {
  const { roomId, bountyId, targetUserId } = route.params;
  const { user } = useAuth();
  const { messages, sendMessage } = useWebSocket();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('Connecting...');

  // Media controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
  };

  const pc = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const processedMessageIndex = useRef(0);

  const isInitiator = user?.role === 'Student'; // Student calls Mentor

  useEffect(() => {
    startCall();
    return () => {
      endCall();
    };
  }, []);

  // Process incoming WebRTC signaling messages
  useEffect(() => {
    if (!pc.current) {
      console.log('Skipping messages, pc not ready yet');
      return;
    }

    for (let i = processedMessageIndex.current; i < messages.length; i++) {
      const msg = messages[i];
      console.log(`Rcv: ${msg?.type} from ${msg?.sender_id}`);

      // Ensure sender_id and target_id match exactly
      if (Number(msg.sender_id) === Number(targetUserId)) {
        console.log(`Processing msg of type: ${msg.type}`);
        handleSignalingMessage(msg);
      }
    }
    processedMessageIndex.current = messages.length;
  }, [messages, targetUserId, callStatus]); // Added callStatus as a trigger when PC is ready

  const handleSignalingMessage = async (msg) => {
    try {
      if (msg.type === 'webrtc_offer') {
        console.log('Received Offer');
        await pc.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);
        console.log(`Sending Answer to ${targetUserId}`);
        sendMessage({
          type: 'webrtc_answer',
          target_id: Number(targetUserId),
          payload: answer
        });
        setCallStatus('Connected');
      } else if (msg.type === 'webrtc_answer') {
        console.log('Received Answer');
        await pc.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
        setCallStatus('Connected');
      } else if (msg.type === 'webrtc_candidate') {
        console.log('Received Candidate');
        await pc.current.addIceCandidate(new RTCIceCandidate(msg.payload));
      }
    } catch (err) {
      console.error("Signaling error:", err);
    }
  };

  const startCall = async () => {
    if (Platform.OS !== 'web') {
      showAlert('Platform Not Supported', 'WebRTC video calls are currently only supported on web in this prototype.');
      return;
    }

    try {
      // Request HD video instead of default 480p/VGA
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true
      });
      setLocalStream(stream);

      // Map local stream to video right away (will trigger ref check in render)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const peerConnection = new RTCPeerConnection(configuration);
      pc.current = peerConnection;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Listen for remote tracks
      peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // ICE candidate handler
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          addLog(`Sending Candidate to ${targetUserId}`);
          sendMessage({
            type: 'webrtc_candidate',
            target_id: Number(targetUserId),
            payload: event.candidate
          });
        }
      };

      if (isInitiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        addLog(`Sending Offer to ${targetUserId}`);
        sendMessage({
          type: 'webrtc_offer',
          target_id: Number(targetUserId),
          payload: offer
        });
        setCallStatus('Calling...');
      } else {
        setCallStatus('Waiting for call...');
      }

    } catch (err) {
      console.error("Start call error:", err);
      setCallStatus('Failed to access camera/microphone');
    }
  };

  // Setup refs when stream is ready
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStream.getAudioTracks()[0]?.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(localStream.getVideoTracks()[0]?.enabled);
    }
  };

  const handleLeaveRoom = () => {
    showAlert(
      'Leave Session',
      'Are you sure you want to leave the session room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          onPress: () => {
            endCall();
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Remote Video */}
      <View style={styles.remoteVideoContainer}>
        {Platform.OS === 'web' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={styles.remoteVideo}
          />
        ) : (
          <Text style={{ color: 'white' }}>Remote Video (Not supported)</Text>
        )}

        {/* Connection Overlay */}
        {!remoteStream && (
          <View style={styles.overlayContainer}>
            <View style={styles.pulseCircle} />
            <Text style={styles.overlayText}>
              {callStatus === 'Connected'
                ? 'Waiting for video...'
                : `Waiting for ${user?.role === 'Student' ? 'Mentor' : 'Student'}...`}
            </Text>
            <Text style={styles.statusSubtext}>{callStatus}</Text>
          </View>
        )}
      </View>

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <View style={[styles.statusDot, { backgroundColor: callStatus === 'Connected' ? '#34C759' : '#FF9500' }]} />
          <Text style={styles.headerText}>Session Room</Text>
        </View>
      </View>

      {/* Floating Local Video */}
      <View style={styles.localVideoContainer}>
        {Platform.OS === 'web' ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={styles.localVideo}
          />
        ) : (
          <Text style={{ color: 'white', fontSize: 10 }}>Local</Text>
        )}
      </View>

      {/* Glassmorphic Controls Bar */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonDisabled]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎤'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleLeaveRoom}
        >
          <Text style={styles.endCallIcon}>☎️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !isVideoOn && styles.controlButtonDisabled]}
          onPress={toggleVideo}
        >
          <Text style={styles.controlIcon}>{isVideoOn ? '🎥' : '🚫'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Deep black background
    position: 'relative',
    height: '100vh', // Ensure it takes exact window height on web
    overflow: 'hidden',
  },

  // Remote Video (Background)
  remoteVideoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Fills the screen beautifully
  },

  // Overlays
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 2,
    borderColor: '#34C759',
    marginBottom: 20,
  },
  overlayText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusSubtext: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 8,
  },

  // Top Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)', // Web glassmorphism
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Floating Local Video
  localVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 140,
    height: 190,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: [{ scaleX: -1 }], // Mirror local video
  },

  // Controls Bottom Bar
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 40,
    zIndex: 10,
    backdropFilter: 'blur(15px)', // Web glassmorphism
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)', // Slightly more visible
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255,59,48,0.8)', // Red tint when disabled
  },
  controlIcon: {
    fontSize: 20,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  endCallIcon: {
    fontSize: 24,
  },
});

export default SessionRoomScreen;
