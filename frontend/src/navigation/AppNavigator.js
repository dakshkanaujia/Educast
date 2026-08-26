import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Student screens
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import PostBountyScreen from '../screens/student/PostBountyScreen';
import BountyDetailScreen from '../screens/student/BountyDetailScreen';
import CompletionScreen from '../screens/student/CompletionScreen';

// Shared screens
import SessionDetailsScreen from '../screens/SessionDetailsScreen';
import SessionChatScreen from '../screens/SessionChatScreen';
import MentorProfileScreen from '../screens/MentorProfileScreen';
import MentorDirectoryScreen from '../screens/MentorDirectoryScreen';
import MessagesScreen from '../screens/MessagesScreen';

// Mentor screens
import MentorFeedScreen from '../screens/mentor/MentorFeedScreen';
import MentorBountyDetailScreen from '../screens/mentor/MentorBountyDetailScreen';
import PlaceBidScreen from '../screens/mentor/PlaceBidScreen';
import MyBidsScreen from '../screens/mentor/MyBidsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerMode: 'float' }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'EduCast - Login' }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{ title: 'EduCast - Sign Up' }}
            />
          </>
        ) : user?.role === 'Student' ? (
          <>
            <Stack.Screen
              name="StudentHome"
              component={StudentHomeScreen}
              options={{ title: 'My Bounties', headerShown: false }}
            />
            <Stack.Screen 
              name="PostBounty" 
              component={PostBountyScreen}
              options={{ title: 'Post New Bounty' }}
            />
            <Stack.Screen 
              name="BountyDetail" 
              component={BountyDetailScreen}
              options={{ title: 'Bounty Details' }}
            />
            <Stack.Screen
              name="SessionRoom"
              component={SessionDetailsScreen}
              options={{ title: 'Session Details' }}
            />
            <Stack.Screen
              name="SessionChat"
              component={SessionChatScreen}
              options={{ title: 'Chat' }}
            />
            <Stack.Screen
              name="Completion"
              component={CompletionScreen}
              options={{ title: 'Complete Bounty' }}
            />
            <Stack.Screen
              name="MentorProfile"
              component={MentorProfileScreen}
              options={{ title: 'Mentor Profile' }}
            />
            <Stack.Screen
              name="MentorDirectory"
              component={MentorDirectoryScreen}
              options={{ title: 'Browse Mentors', headerShown: false }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ title: 'Messages', headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MentorFeed"
              component={MentorFeedScreen}
              options={{ title: 'Available Bounties', headerShown: false }}
            />
            <Stack.Screen
              name="MentorBountyDetail"
              component={MentorBountyDetailScreen}
              options={{ title: 'Bounty Details' }}
            />
            <Stack.Screen
              name="PlaceBid"
              component={PlaceBidScreen}
              options={{ title: 'Place Bid' }}
            />
            <Stack.Screen
              name="MyBids"
              component={MyBidsScreen}
              options={{ title: 'My Bids', headerShown: false }}
            />
            <Stack.Screen
              name="MentorProfile"
              component={MentorProfileScreen}
              options={{ title: 'Mentor Profile' }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ title: 'Messages', headerShown: false }}
            />
            <Stack.Screen
              name="SessionRoom"
              component={SessionDetailsScreen}
              options={{ title: 'Session Details' }}
            />
            <Stack.Screen
              name="SessionChat"
              component={SessionChatScreen}
              options={{ title: 'Chat' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
