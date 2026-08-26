import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as mentorService from '../services/mentor';
import { showAlert } from '../utils/alert';
import { Avatar, Card, Chip, EmptyState, LoadingState, RatingStars, SectionHeader } from '../components';
import { colors, typography, layout } from '../theme';

const MentorProfileScreen = ({ route }) => {
  const { mentorId, mentorName } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await mentorService.getMentorProfile(mentorId);
      setProfile(data);
    } catch (error) {
      showAlert('Error', 'Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!profile) return <LoadingState label="Profile not found" />;

  return (
    <ScrollView style={styles.outer} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={profile.name || mentorName} size={88} />
        <Text style={styles.name}>{profile.name || mentorName}</Text>
        <Text style={styles.role}>Mentor</Text>

        <View style={styles.statsRow}>
          <RatingStars rating={profile.rating_avg || 0} size={15} />
          <Text style={styles.statsDot}>•</Text>
          <Text style={styles.statsText}>
            {profile.completed_sessions} session{profile.completed_sessions === 1 ? '' : 's'} completed
          </Text>
        </View>
        <Text style={styles.memberSince}>Mentor since {profile.member_since}</Text>
      </View>

      <SectionHeader title="Expertise" style={styles.sectionHeader} />
      {profile.expertise && profile.expertise.length > 0 ? (
        <View style={styles.chipRow}>
          {profile.expertise.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>No completed sessions yet to show expertise areas</Text>
        </Card>
      )}

      <SectionHeader
        title="Reviews"
        subtitle={profile.reviews?.length ? `${profile.reviews.length} review${profile.reviews.length === 1 ? '' : 's'}` : undefined}
        style={styles.sectionHeader}
      />
      {profile.reviews && profile.reviews.length > 0 ? (
        profile.reviews.map((r, idx) => (
          <Card key={idx} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Avatar name={r.student_name} size={36} />
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewerName}>{r.student_name}</Text>
                <Text style={styles.reviewDate}>{r.created_at}</Text>
              </View>
              <RatingStars rating={r.rating} showValue={false} size={13} />
            </View>
            {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No reviews yet" hint="Reviews appear here after this mentor completes sessions" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  name: {
    ...typography.h1,
    marginTop: 16,
    marginBottom: 2,
  },
  role: {
    ...typography.bodySecondary,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsDot: {
    marginHorizontal: 8,
    color: colors.textTertiary,
  },
  statsText: {
    ...typography.bodySecondary,
    fontWeight: '600',
  },
  memberSince: {
    ...typography.caption,
  },
  sectionHeader: {
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  emptyCard: {
    marginBottom: 24,
  },
  emptyCardText: {
    ...typography.bodySecondary,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  reviewerName: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  reviewDate: {
    ...typography.caption,
  },
  reviewComment: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});

export default MentorProfileScreen;
