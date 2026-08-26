import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';
import { AppHeader, Badge, Button, Card, EmptyState, ScreenHeader } from '../../components';
import { colors, typography, layout } from '../../theme';

const formatDuration = (minutes) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`;
};

const MyBidsScreen = ({ navigation }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvingBidId, setResolvingBidId] = useState(null);
  const { messages } = useWebSocket();

  useEffect(() => {
    loadMyBids();
  }, []);

  useEffect(() => {
    const acceptedBids = messages.filter((m) => m.type === 'bid_accepted');
    if (acceptedBids.length > 0) {
      loadMyBids();
      const latestAccepted = acceptedBids[acceptedBids.length - 1].payload;
      navigation.navigate('SessionRoom', {
        roomId: latestAccepted.room_id,
        bountyId: latestAccepted.bounty_id,
        targetUserId: latestAccepted.student_id,
      });
    }
  }, [messages, navigation]);

  useEffect(() => {
    const negotiationEvents = messages.filter((m) => ['bid_countered', 'bid_counter_resolved'].includes(m.type));
    if (negotiationEvents.length > 0) {
      loadMyBids();
    }
  }, [messages]);

  useEffect(() => {
    const completions = messages.filter((m) => m.type === 'bounty_completed');
    if (completions.length > 0) {
      loadMyBids();
    }
  }, [messages]);

  const loadMyBids = async () => {
    setLoading(true);
    try {
      const data = await bidService.getMyBids();
      setBids(data || []);
    } catch (error) {
      showAlert('Error', 'Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async (bid) => {
    setResolvingBidId(bid.id);
    try {
      await bidService.acceptCounter(bid.id);
      loadMyBids();
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to accept counter-offer');
    } finally {
      setResolvingBidId(null);
    }
  };

  const handleDeclineCounter = async (bid) => {
    setResolvingBidId(bid.id);
    try {
      await bidService.declineCounter(bid.id);
      loadMyBids();
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to decline counter-offer');
    } finally {
      setResolvingBidId(null);
    }
  };

  const statusVariant = (bid) => {
    if (bid.is_accepted) return 'success';
    if (bid.bounty?.status === 'CLOSED') return 'neutral';
    if (bid.counter_price != null) return 'warning';
    return 'warning';
  };

  const statusLabel = (bid) => {
    if (bid.is_accepted) return 'Accepted';
    if (bid.bounty?.status === 'CLOSED') return 'Not selected';
    if (bid.counter_price != null) return 'Countered';
    return 'Pending';
  };

  const pendingCount = useMemo(() => bids.filter((b) => !b.is_accepted && b.bounty?.status !== 'CLOSED').length, [bids]);
  const acceptedCount = useMemo(() => bids.filter((b) => b.is_accepted).length, [bids]);
  const subtitle = bids.length ? `${pendingCount} pending · ${acceptedCount} accepted` : 'No bids placed yet';

  const renderBid = ({ item }) => {
    const duration = formatDuration(item.duration_minutes);
    const hasPendingCounter = item.counter_price != null;
    const isStudentCounter = hasPendingCounter && item.counter_by === 'Student';
    const isMyCounter = hasPendingCounter && item.counter_by === 'Mentor';
    const resolving = resolvingBidId === item.id;

    // Only accepted bids are navigable — pending/countered ones still have
    // their own Accept/Decline buttons inside, and nesting the card's own
    // onPress around those would swallow taps on them (see Card.js).
    const goToSession = item.is_accepted
      ? () => navigation.navigate('MentorBountyDetail', { bountyId: item.bounty?.id || item.bounty_id })
      : undefined;

    return (
      <Card style={styles.bidCard} onPress={goToSession} hoverable={!!goToSession}>
        <View style={styles.header}>
          <Text style={styles.bountyTitle} numberOfLines={1}>{item.bounty?.title || 'Bounty'}</Text>
          <Badge variant={statusVariant(item)} label={statusLabel(item)} />
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.bounty?.description || ''}</Text>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Your Offer</Text>
            <Text style={styles.price}>${item.price_offer}</Text>
          </View>
          <View>
            <Text style={styles.label}>Budget</Text>
            <Text style={styles.budget}>${item.bounty?.budget || 0}</Text>
          </View>
        </View>

        {(duration || item.preferred_time) && (
          <View style={styles.metaRow}>
            {duration ? <Text style={styles.metaText}>{duration}</Text> : null}
            {duration && item.preferred_time ? <Text style={styles.metaDot}>•</Text> : null}
            {item.preferred_time ? <Text style={styles.metaText}>{item.preferred_time}</Text> : null}
          </View>
        )}

        {item.note ? (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Your note</Text>
            <Text style={styles.note}>{item.note}</Text>
          </View>
        ) : null}

        {isStudentCounter && (
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>Student countered</Text>
            <Text style={styles.counterPrice}>${item.counter_price}</Text>
            {item.counter_note ? <Text style={styles.counterNote}>{item.counter_note}</Text> : null}
            <View style={styles.counterActions}>
              <Button
                title={`Accept $${item.counter_price}`}
                size="sm"
                onPress={() => handleAcceptCounter(item)}
                loading={resolving}
                style={styles.counterActionButton}
              />
              <Button
                title="Decline"
                size="sm"
                variant="secondary"
                onPress={() => handleDeclineCounter(item)}
                disabled={resolving}
                style={styles.counterActionButton}
              />
            </View>
          </View>
        )}

        {isMyCounter && (
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>You offered</Text>
            <Text style={styles.counterPrice}>${item.counter_price}</Text>
            <Text style={styles.counterWaiting}>Waiting for the student to respond</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.timestamp}>Placed {new Date(item.created_at).toLocaleDateString()}</Text>
          {goToSession ? (
            <Text style={styles.goToSession}>{item.bounty?.status === 'CLOSED' ? 'View session →' : 'Go to session →'}</Text>
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} current="bids" />
      <ScreenHeader title="My Bids" subtitle={subtitle} />

      <FlatList
        style={styles.list}
        data={bids}
        renderItem={renderBid}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMyBids} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="You haven't placed any bids yet" hint="Browse bounties and place bids to see them here" />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.mentorBackground,
  },
  list: {
    flex: 1,
  },
  listContent: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    padding: 20,
  },
  bidCard: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bountyTitle: {
    ...typography.title,
    flex: 1,
    marginRight: 10,
  },
  description: {
    ...typography.bodySecondary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  label: {
    ...typography.caption,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  budget: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    ...typography.caption,
    fontWeight: '600',
  },
  metaDot: {
    ...typography.caption,
    marginHorizontal: 6,
  },
  noteSection: {
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  noteLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  note: {
    ...typography.body,
    fontSize: 14,
  },
  counterBox: {
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  counterPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  counterNote: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  counterWaiting: {
    ...typography.caption,
    marginTop: 2,
  },
  counterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  counterActionButton: {
    flex: 1,
  },
  timestamp: {
    ...typography.caption,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  goToSession: {
    fontSize: 13,
    fontWeight: '650',
    color: colors.accent,
  },
});

export default MyBidsScreen;
