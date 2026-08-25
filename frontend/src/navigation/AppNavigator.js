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
import SessionRoomScreen from '../screens/student/SessionRoomScreen';
import CompletionScreen from '../screens/student/CompletionScreen';

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
      <Stack.Navigator>
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
              options={{ title: 'My Bounties' }}
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
              component={SessionRoomScreen}
              options={{ title: 'Session Room' }}
            />
            <Stack.Screen 
              name="Completion" 
              component={CompletionScreen}
              options={{ title: 'Complete Bounty' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="MentorFeed" 
              component={MentorFeedScreen}
              options={{ title: 'Available Bounties' }}
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
              options={{ title: 'My Bids' }}
            />
            <Stack.Screen 
              name="SessionRoom" 
              component={SessionRoomScreen}
              options={{ title: 'Session Room' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
