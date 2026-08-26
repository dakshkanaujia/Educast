import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as mentorService from '../services/mentor';
import { showAlert } from '../utils/alert';
import { AppHeader, Avatar, Card, Chip, EmptyState, Input, LoadingState, RatingStars, ScreenHeader } from '../components';
import { colors, typography, layout } from '../theme';

const MentorDirectoryScreen = ({ navigation }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const loadMentors = useCallback(async (searchTerm) => {
    setLoading(true);
    try {
      const data = await mentorService.getMentors(searchTerm);
      setMentors(data || []);
    } catch (error) {
      showAlert('Error', 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentors('');
  }, [loadMentors]);

  useEffect(() => {
    const handle = setTimeout(() => loadMentors(search), 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const renderMentor = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('MentorProfile', { mentorId: item.id, mentorName: item.name })}
      onHoverIn={() => setHoveredId(item.id)}
      onHoverOut={() => setHoveredId(null)}
    >
      <View style={styles.row}>
        <Avatar name={item.name} size={48} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <RatingStars rating={item.rating_avg} size={13} />
        </View>
        {hoveredId === item.id ? <Text style={styles.viewProfile}>View profile →</Text> : null}
      </View>
      <Text style={styles.meta}>
        {item.completed_sessions} session{item.completed_sessions === 1 ? '' : 's'} · since {item.member_since}
      </Text>
      {item.expertise && item.expertise.length > 0 ? (
        <View style={styles.chipRow}>
          {item.expertise.slice(0, 4).map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
      ) : null}
    </Card>
  );

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} current="mentors" />
      <ScreenHeader
        title="Mentors"
        subtitle={loading ? 'Loading…' : `${mentors.length} mentor${mentors.length === 1 ? '' : 's'} available`}
      />

      <View style={styles.searchWrap}>
        <Input placeholder="Search by name..." value={search} onChangeText={setSearch} autoCapitalize="none" style={styles.searchInput} />
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          style={styles.list}
          data={mentors}
          renderItem={renderMentor}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title={search ? 'No mentors match that search' : 'No mentors yet'}
              hint={search ? 'Try a different name' : 'Mentors will appear here as they join'}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.studentBackground,
  },
  list: {
    flex: 1,
  },
  searchWrap: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 4,
  },
  meta: {
    ...typography.caption,
    marginTop: 12,
  },
  viewProfile: {
    fontSize: 12,
    fontWeight: '650',
    color: colors.accent,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
});

export default MentorDirectoryScreen;
