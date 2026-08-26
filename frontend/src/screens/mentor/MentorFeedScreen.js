import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useBountyPresenceMap } from '../../hooks/useBountyPresence';
import { usePlatformActivity } from '../../hooks/usePlatformActivity';
import * as bountyService from '../../services/bounty';
import * as mentorService from '../../services/mentor';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';
import { AppHeader, Badge, Button, Card, Chip, EmptyState, PresenceBadge, QuoteBanner, ScreenHeader } from '../../components';
import { colors, typography, layout } from '../../theme';

const NEW_WINDOW_MS = 10 * 60 * 1000;
const isNew = (item) => item.created_at && Date.now() - new Date(item.created_at).getTime() < NEW_WINDOW_MS;

const bidStatusLabel = (bid) => {
  if (bid.is_accepted) return 'Accepted';
  if (bid.bounty?.status === 'CLOSED') return 'Not selected';
  if (bid.counter_price != null) return 'Countered';
  return 'Pending';
};

const bidStatusVariant = (bid) => {
  if (bid.is_accepted) return 'success';
  if (bid.bounty?.status === 'CLOSED') return 'neutral';
  return 'warning';
};

const MentorFeedScreen = ({ navigation }) => {
  const [bounties, setBounties] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myExpertise, setMyExpertise] = useState([]);
  const { user } = useAuth();
  const { messages } = useWebSocket();
  const presenceMap = useBountyPresenceMap();
  const activity = usePlatformActivity();

  useEffect(() => {
    loadBounties();
    loadMyBids();
    loadMyExpertise();
  }, []);

  useEffect(() => {
    const newBounties = messages.filter((m) => m.type === 'bounty_created');
    if (newBounties.length > 0) {
      loadBounties();
    }

    const negotiationEvents = messages.filter((m) => ['bid_countered', 'bid_counter_resolved'].includes(m.type));
    if (negotiationEvents.length > 0) {
      loadMyBids();
    }

    const acceptedBids = messages.filter((m) => m.type === 'bid_accepted');
    if (acceptedBids.length > 0) {
      const latestAccepted = acceptedBids[acceptedBids.length - 1];
      showAlert('Bid Accepted!', 'Your bid has been accepted! Joining session room...');
      setTimeout(() => {
        navigation.navigate('SessionRoom', {
          roomId: latestAccepted.payload.room_id,
          bountyId: latestAccepted.payload.bounty_id,
          targetUserId: latestAccepted.payload.student_id,
        });
      }, 1500);
    }

    const completions = messages.filter((m) => m.type === 'bounty_completed');
    if (completions.length > 0) {
      loadMyBids();
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

  const loadMyBids = async () => {
    try {
      const data = await bidService.getMyBids();
      setMyBids(data || []);
    } catch (error) {
      // Quiet failure — the Students column still works without it.
    }
  };

  const loadMyExpertise = async () => {
    if (!user?.id) return;
    try {
      const profile = await mentorService.getMentorProfile(user.id);
      setMyExpertise((profile.expertise || []).map((t) => t.toLowerCase()));
    } catch (error) {
      // No history yet — not an error worth surfacing, just means no ranking boost
      setMyExpertise([]);
    }
  };

  const handleRefresh = () => {
    loadBounties();
    loadMyBids();
  };

  const isMatch = (item) => item.subject_tag && myExpertise.includes(item.subject_tag.toLowerCase());

  // As the feed grows, requests matching what you're actually good at
  // should lead — everything else is still there, just not first.
  const rankedBounties = useMemo(() => {
    if (!myExpertise.length) return bounties;
    return [...bounties].sort((a, b) => (isMatch(b) ? 1 : 0) - (isMatch(a) ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounties, myExpertise]);

  const matchCount = useMemo(() => bounties.filter(isMatch).length, [bounties, myExpertise]);
  const activeBidCount = useMemo(
    () => myBids.filter((b) => !b.is_accepted && b.bounty?.status !== 'CLOSED').length,
    [myBids]
  );
  const acceptedBidCount = useMemo(() => myBids.filter((b) => b.is_accepted).length, [myBids]);

  const liveLine = activity
    ? `${activity.students_online} student${activity.students_online === 1 ? '' : 's'} looking for help`
    : null;
  const statsLine = `${matchCount} matching opportunit${matchCount === 1 ? 'y' : 'ies'} · ${activeBidCount} active bid${activeBidCount === 1 ? '' : 's'} · ${acceptedBidCount} accepted`;
  const subtitle = liveLine ? `${liveLine} · ${statsLine}` : statsLine;

  const renderBounty = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('MentorBountyDetail', { bountyId: item.id })}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {isNew(item) ? <Badge variant="accent" style={styles.newBadge} /> : null}
      </View>
      <Text style={styles.meta}>{item.subject_tag || 'General'} · #{item.id}</Text>
      <View style={styles.footer}>
        <Text style={styles.budget}>${item.budget}</Text>
        {isMatch(item) ? <Chip label="Matches you" selected style={styles.matchChip} /> : null}
      </View>
      <PresenceBadge count={presenceMap[item.id]} style={styles.presence} />
    </Card>
  );

  const renderBid = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('MentorBountyDetail', { bountyId: item.bounty?.id || item.bounty_id })}
    >
      <Text style={styles.title} numberOfLines={1}>{item.bounty?.title || 'Bounty'}</Text>
      <Text style={styles.meta}>{item.bounty?.subject_tag || 'General'} · #{item.bounty?.id || item.bounty_id}</Text>
      <View style={styles.footer}>
        <Text style={styles.budget}>${item.counter_price ?? item.price_offer}</Text>
        <Badge variant={bidStatusVariant(item)} label={bidStatusLabel(item)} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} current="bounties" />
      <QuoteBanner role="Mentor" />

      <ScreenHeader
        title="Live Feed"
        subtitle={subtitle}
        live={!!activity}
        actions={<Button title="Browse opportunities" size="sm" fullWidth={false} onPress={handleRefresh} />}
      />

      <View style={styles.columns}>
        <View style={styles.column}>
          <View style={styles.columnHeaderRow}>
            <Text style={styles.columnHeader}>Opportunities</Text>
          </View>
          <FlatList
            style={styles.list}
            data={rankedBounties}
            renderItem={renderBounty}
            keyExtractor={(item) => item.id.toString()}
            refreshing={loading}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              matchCount > 0 ? (
                <View style={styles.tipCard}>
                  <Text style={styles.tipEmoji}>⚡</Text>
                  <View style={styles.tipTextWrap}>
                    <Text style={styles.tipTitle}>New opportunity</Text>
                    <Text style={styles.tipBody}>
                      {matchCount} {matchCount === 1 ? 'bounty matches' : 'bounties match'} your expertise.
                    </Text>
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="⚡"
                title="No open opportunities right now"
                hint="New bounties appear here in real time as students post them — check back soon"
              />
            }
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.column}>
          <View style={styles.columnHeaderRow}>
            <Text style={styles.columnHeader}>My Bids</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyBids')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.list}
            data={myBids}
            renderItem={renderBid}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon="🤝"
                title="No bids yet"
                hint="Bid on an opportunity to start building your track record"
                action={<Button title="Browse opportunities" size="sm" fullWidth={false} onPress={handleRefresh} />}
              />
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.mentorBackground,
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
  matchChip: {
    marginRight: 0,
    marginBottom: 0,
  },
  presence: {
    marginTop: 12,
  },
});

export default MentorFeedScreen;
