import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, SectionList, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import { useBountyPresenceMap } from '../../hooks/useBountyPresence';
import { usePlatformActivity } from '../../hooks/usePlatformActivity';
import * as bountyService from '../../services/bounty';
import * as mentorService from '../../services/mentor';
import { showAlert } from '../../utils/alert';
import { AppHeader, Avatar, Badge, Button, Card, Chip, EmptyState, PresenceBadge, QuoteBanner, RatingStars, ScreenHeader } from '../../components';
import { colors, typography, layout } from '../../theme';

const NEW_WINDOW_MS = 10 * 60 * 1000;
const isNew = (item) => item.created_at && Date.now() - new Date(item.created_at).getTime() < NEW_WINDOW_MS;

const StudentHomeScreen = ({ navigation }) => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const { messages } = useWebSocket();
  const presenceMap = useBountyPresenceMap();
  const activity = usePlatformActivity();

  useEffect(() => {
    loadBounties();
    mentorService.getMentors('').then((data) => setMentors(data || [])).catch(() => setMentors([]));
  }, []);

  useEffect(() => {
    const bidMessages = messages.filter((m) => m.type === 'bid_created');
    if (bidMessages.length > 0) {
      loadBounties();
    }
  }, [messages]);

  const loadBounties = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBounties();
      setBounties(data || []);
    } catch (error) {
      showAlert('Error', 'Failed to load bounties');
    } finally {
      setLoading(false);
    }
  };

  // Groups grow more useful as more bounties pile up — the busiest one
  // (things waiting on you) always leads, instead of one long flat list.
  const sections = useMemo(() => {
    const needsAttention = [];
    const inProgress = [];
    const waiting = [];
    const completed = [];

    for (const bounty of bounties) {
      if (bounty.status === 'OPEN') {
        if ((bounty.bids || []).length > 0) needsAttention.push(bounty);
        else waiting.push(bounty);
      } else if (bounty.status === 'IN_PROGRESS') {
        inProgress.push(bounty);
      } else {
        completed.push(bounty);
      }
    }

    const result = [];
    if (needsAttention.length) result.push({ title: 'Needs your attention', data: needsAttention });
    if (inProgress.length) result.push({ title: 'In progress', data: inProgress });
    if (waiting.length) result.push({ title: 'Waiting for bids', data: waiting });
    if (completed.length) result.push({ title: 'Completed', data: completed });
    return result;
  }, [bounties]);

  const activeCount = useMemo(() => bounties.filter((b) => b.status === 'OPEN').length, [bounties]);
  const awaitingCount = useMemo(
    () => bounties.filter((b) => b.status === 'OPEN' && !(b.bids || []).length).length,
    [bounties]
  );
  const inProgressCount = useMemo(() => bounties.filter((b) => b.status === 'IN_PROGRESS').length, [bounties]);

  const liveLine = activity ? `${activity.mentors_online} mentor${activity.mentors_online === 1 ? '' : 's'} online` : null;
  const statsLine = bounties.length
    ? `${activeCount} active · ${awaitingCount} awaiting bids · ${inProgressCount} in progress`
    : 'Post your first bounty to get matched with a mentor';
  const subtitle = liveLine ? `${liveLine} · ${statsLine}` : statsLine;

  const renderBounty = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('BountyDetail', { bountyId: item.id })}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {isNew(item) ? <Badge variant="accent" style={styles.newBadge} /> : null}
      </View>
      <Text style={styles.meta}>{item.subject_tag || 'General'} · #{item.id}</Text>
      <View style={styles.footer}>
        <Text style={styles.budget}>${item.budget}</Text>
        <Badge status={item.status} />
      </View>
      {item.status === 'OPEN' ? (
        <PresenceBadge count={presenceMap[item.id]} style={styles.presence} />
      ) : null}
    </Card>
  );

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} current="bounties" />
      <QuoteBanner role="Student" />

      <ScreenHeader
        title="My Bounties"
        subtitle={subtitle}
        live={!!activity}
        actions={<Button title="+ Post bounty" size="sm" fullWidth={false} onPress={() => navigation.navigate('PostBounty')} />}
      />

      <View style={styles.columns}>
        <View style={styles.column}>
          <View style={styles.columnHeaderRow}>
            <Text style={styles.columnHeader}>Mentors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MentorDirectory')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.list}
            data={mentors}
            renderItem={({ item }) => <MentorRow item={item} navigation={navigation} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.tipCard}>
                <Text style={styles.tipEmoji}>💡</Text>
                <View style={styles.tipTextWrap}>
                  <Text style={styles.tipTitle}>Find the right mentor</Text>
                  <Text style={styles.tipBody}>Match with someone who's already been where you're stuck.</Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                icon="🔍"
                title="No mentors yet"
                hint="Mentors will appear here as they join — check back soon"
              />
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <View style={styles.columnHeaderRow}>
            <Text style={styles.columnHeader}>Bounties</Text>
          </View>
          <SectionList
            style={styles.list}
            sections={sections}
            renderItem={renderBounty}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            refreshing={loading}
            onRefresh={loadBounties}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
              <EmptyState
                icon="🎓"
                title="No bounties yet"
                hint="Post what you're stuck on and let mentors come to you"
                action={<Button title="+ Post a bounty" size="sm" fullWidth={false} onPress={() => navigation.navigate('PostBounty')} />}
              />
            }
          />
        </View>
      </View>
    </View>
  );
};

const MentorRow = ({ item, navigation }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Card
      style={styles.mentorCard}
      onPress={() => navigation.navigate('MentorProfile', { mentorId: item.id, mentorName: item.name })}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View style={styles.mentorRow}>
        <Avatar name={item.name} size={42} />
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName} numberOfLines={1}>{item.name}</Text>
          <RatingStars rating={item.rating_avg} size={13} />
        </View>
      </View>
      <View style={styles.mentorFooter}>
        {item.expertise && item.expertise[0] ? <Chip label={item.expertise[0]} style={styles.mentorChip} /> : <View />}
        {hovered ? <Text style={styles.viewProfile}>View profile →</Text> : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.studentBackground,
  },
  columns: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
    minHeight: 0,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 24,
  },
  list: {
    flex: 1,
  },
  columnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  columnHeader: {
    ...typography.label,
    textTransform: 'uppercase',
    paddingVertical: 10,
  },
  seeAllText: {
    ...typography.caption,
    fontWeight: '650',
    color: colors.accent,
  },
  listContent: {
    paddingBottom: 24,
    paddingRight: 4,
  },
  sectionHeader: {
    ...typography.label,
    textTransform: 'uppercase',
    backgroundColor: colors.studentBackground,
    paddingTop: 18,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 12,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newBadge: {
    marginLeft: 8,
    paddingVertical: 3,
  },
  title: {
    ...typography.title,
    marginBottom: 6,
    flexShrink: 1,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.accentBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  tipEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    ...typography.bodyStrong,
    marginBottom: 2,
  },
  tipBody: {
    ...typography.caption,
  },
  meta: {
    ...typography.caption,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budget: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presence: {
    marginTop: 12,
  },
  mentorCard: {
    marginBottom: 12,
    padding: 18,
    paddingVertical: 20,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  mentorName: {
    ...typography.bodyStrong,
    marginBottom: 2,
  },
  mentorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  mentorChip: {
    marginRight: 0,
    marginBottom: 0,
  },
  viewProfile: {
    fontSize: 13,
    fontWeight: '650',
    color: colors.accent,
  },
});

export default StudentHomeScreen;
