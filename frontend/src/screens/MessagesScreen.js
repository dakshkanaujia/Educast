import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppHeader, ScreenHeader, EmptyState } from '../components';
import { colors } from '../theme';

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isMentor = user?.role === 'Mentor';

  return (
    <View style={[styles.container, { backgroundColor: isMentor ? colors.mentorBackground : colors.studentBackground }]}>
      <AppHeader navigation={navigation} current="messages" />
      <ScreenHeader title="Messages" subtitle="Nothing yet" />
      <View style={styles.body}>
        <EmptyState
          title="No messages yet"
          hint="Chats you have during an active session will show up here — they're not kept after the session ends"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});

export default MessagesScreen;
