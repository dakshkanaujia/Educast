import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useWebSocket } from '../../context/WebSocketContext';
import { useBountyPresence } from '../../hooks/useBountyPresence';
import * as bountyService from '../../services/bounty';
import * as bidService from '../../services/bid';
import { showAlert } from '../../utils/alert';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  PresenceBadge,
  RatingStars,
  SectionHeader,
  BottomSheetModal,
  SuccessOverlay,
} from '../../components';
import { colors, typography, layout, radii } from '../../theme';

const formatDuration = (minutes) => {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`;
};

const BountyDetailScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [bounty, setBounty] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages } = useWebSocket();
  const presenceCount = useBountyPresence(bountyId);

  const [selectedBid, setSelectedBid] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptedResult, setAcceptedResult] = useState(null);

  const [counterTarget, setCounterTarget] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [counterSubmitting, setCounterSubmitting] = useState(false);
  const [resolvingBidId, setResolvingBidId] = useState(null);

  useEffect(() => {
    loadBountyDetails();
    loadBids();
  }, []);

  useEffect(() => {
    const relevant = messages.filter((m) => ['bid_created', 'bid_countered', 'bid_counter_resolved'].includes(m.type));
    if (relevant.length > 0) {
      loadBids();
    }
  }, [messages]);

  const loadBountyDetails = async () => {
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load request details');
    }
  };

  const loadBids = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBidsForBounty(bountyId);
      setBids(data || []);
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAccept = async () => {
    if (!selectedBid) return;
    setAccepting(true);
    try {
      const result = await bidService.acceptBid(selectedBid.id);
      setAcceptedResult({ ...result, mentorName: selectedBid.mentor?.name, price: selectedBid.price_offer });
      setSelectedBid(null);
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to accept bid');
    } finally {
      setAccepting(false);
    }
  };

  const openCounterSheet = (bid) => {
    setCounterTarget(bid);
    setCounterPrice(String(bid.price_offer));
    setCounterNote('');
  };

  const handleSendCounter = async () => {
    if (!counterTarget) return;
    if (!counterPrice || isNaN(parseFloat(counterPrice)) || parseFloat(counterPrice) <= 0) {
      showAlert('Error', 'Enter a valid amount');
      return;
    }
    setCounterSubmitting(true);
    try {
      await bidService.counterBid(counterTarget.id, counterPrice, counterNote);
      setCounterTarget(null);
      loadBids();
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to send counter-offer');
    } finally {
      setCounterSubmitting(false);
    }
  };

  const handleAcceptCounter = async (bid) => {
    setResolvingBidId(bid.id);
    try {
      await bidService.acceptCounter(bid.id);
      loadBids();
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
      loadBids();
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to decline counter-offer');
    } finally {
      setResolvingBidId(null);
    }
  };

  const renderBid = (item) => {
    const duration = formatDuration(item.duration_minutes);
    const hasPendingCounter = item.counter_price != null;
    const isMentorCounter = hasPendingCounter && item.counter_by === 'Mentor';
    const isMyCounter = hasPendingCounter && item.counter_by === 'Student';
    const resolving = resolvingBidId === item.id;

    return (
      <Card key={item.id} style={styles.bidCard}>
        <TouchableOpacity
          style={styles.bidHeader}
          onPress={() => navigation.navigate('MentorProfile', { mentorId: item.mentor_id, mentorName: item.mentor?.name })}
          activeOpacity={0.7}
        >
          <Avatar name={item.mentor?.name} size={44} />
          <View style={styles.bidHeaderText}>
            <Text style={styles.mentorName}>{item.mentor?.name || 'Mentor'}</Text>
            <RatingStars rating={item.mentor?.rating_avg || 0} size={12} />
          </View>
          <Text style={styles.bidPrice}>${item.price_offer}</Text>
        </TouchableOpacity>

        {(duration || item.preferred_time) && (
          <View style={styles.metaRow}>
            {duration ? <Text style={styles.metaText}>{duration}</Text> : null}
            {duration && item.preferred_time ? <Text style={styles.metaDot}>•</Text> : null}
            {item.preferred_time ? <Text style={styles.metaText}>{item.preferred_time}</Text> : null}
          </View>
        )}

        {item.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.note}>{item.note}</Text>
          </View>
        ) : null}

        {isMentorCounter && (
          <View style={styles.counterBox}>
            <Text style={styles.counterLabel}>Mentor countered</Text>
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
            <Text style={styles.counterWaiting}>Waiting for the mentor to respond</Text>
          </View>
        )}

        {bounty?.status === 'OPEN' && !item.is_accepted && !hasPendingCounter && (
          <View style={styles.actionsRow}>
            <Button title="Accept Bid" size="sm" onPress={() => setSelectedBid(item)} style={styles.actionButton} />
            <Button title="Counter" size="sm" variant="secondary" onPress={() => openCounterSheet(item)} style={styles.actionButton} />
          </View>
        )}
        {item.is_accepted && <Badge variant="success" label="✓ Accepted" style={styles.acceptedBadge} />}
      </Card>
    );
  };

  if (!bounty) return <LoadingState />;

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.bountyCard}>
          <View style={styles.bountyHeader}>
            <Badge status={bounty.status} />
            <Text style={styles.budget}>${bounty.budget}</Text>
          </View>
          <Text style={styles.title}>{bounty.title}</Text>
          <Text style={styles.description}>{bounty.description}</Text>
          {bounty.subject_tag && <Text style={styles.tag}>#{bounty.subject_tag}</Text>}
        </Card>

        {bounty.status === 'OPEN' ? <PresenceBadge count={presenceCount} style={styles.presence} /> : null}

        <SectionHeader title="Bids" subtitle={`${bids.length} mentor${bids.length === 1 ? '' : 's'} responded`} />

        {loading && bids.length === 0 ? (
          <LoadingState style={styles.inlineLoading} />
        ) : bids.length === 0 ? (
          <EmptyState title="No bids yet" hint="Mentors will start bidding on your request soon" />
        ) : (
          bids.map(renderBid)
        )}

        {bounty.status === 'IN_PROGRESS' && (
          <Button
            title="Mark as Complete"
            variant="secondary"
            onPress={() => navigation.navigate('Completion', { bountyId })}
            style={styles.completeButton}
          />
        )}
      </ScrollView>

      <BottomSheetModal visible={!!selectedBid} onClose={() => setSelectedBid(null)} title="Accept this bid?">
        {selectedBid && (
          <>
            <View style={styles.sheetMentorRow}>
              <Avatar name={selectedBid.mentor?.name} size={48} />
              <View style={styles.sheetMentorText}>
                <Text style={styles.mentorName}>{selectedBid.mentor?.name || 'Mentor'}</Text>
                <RatingStars rating={selectedBid.mentor?.rating_avg || 0} size={12} />
              </View>
              <Text style={styles.bidPrice}>${selectedBid.price_offer}</Text>
            </View>
            <Text style={styles.sheetBody}>
              Accepting will start your session with {selectedBid.mentor?.name || 'this mentor'} and close bidding
              on this request. This can't be undone.
            </Text>
            <Button title="Accept Bid" onPress={handleConfirmAccept} loading={accepting} style={styles.sheetCta} />
            <Button title="Cancel" variant="ghost" onPress={() => setSelectedBid(null)} disabled={accepting} />
          </>
        )}
      </BottomSheetModal>

      <BottomSheetModal visible={!!counterTarget} onClose={() => setCounterTarget(null)} title="Propose a different price">
        {counterTarget && (
          <>
            <Text style={styles.sheetBody}>
              {counterTarget.mentor?.name || 'This mentor'} offered ${counterTarget.price_offer}. Suggest a price that works better for you.
            </Text>
            <View style={styles.counterInputRow}>
              <Text style={styles.counterInputPrefix}>$</Text>
              <TextInput
                style={styles.counterInput}
                value={counterPrice}
                onChangeText={setCounterPrice}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <TextInput
              style={styles.counterNoteInput}
              value={counterNote}
              onChangeText={setCounterNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={colors.textTertiary}
              multiline
            />
            <Button title="Send Offer" onPress={handleSendCounter} loading={counterSubmitting} style={styles.sheetCta} />
            <Button title="Cancel" variant="ghost" onPress={() => setCounterTarget(null)} disabled={counterSubmitting} />
          </>
        )}
      </BottomSheetModal>

      <SuccessOverlay
        visible={!!acceptedResult}
        title="Bid accepted"
        subtitle={
          acceptedResult
            ? `You're all set with ${acceptedResult.mentorName || 'your mentor'} for $${acceptedResult.price}.`
            : ''
        }
        ctaLabel="Go to Session"
        onCta={() => {
          const roomId = acceptedResult?.room_id;
          setAcceptedResult(null);
          navigation.navigate('SessionRoom', { bountyId, roomId, targetUserId: acceptedResult?.mentor_id });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    padding: 20,
  },
  bountyCard: {
    marginBottom: 16,
  },
  presence: {
    marginBottom: 20,
  },
  bountyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budget: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  title: {
    ...typography.h1,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  tag: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inlineLoading: {
    flex: undefined,
    paddingVertical: 40,
    backgroundColor: 'transparent',
  },
  bidCard: {
    marginBottom: 14,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  mentorName: {
    ...typography.bodyStrong,
    marginBottom: 3,
  },
  bidPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metaText: {
    ...typography.caption,
    fontWeight: '600',
  },
  metaDot: {
    ...typography.caption,
    marginHorizontal: 6,
  },
  noteBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  note: {
    ...typography.body,
    fontSize: 14,
  },
  counterBox: {
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    marginTop: 0,
  },
  acceptedBadge: {
    marginTop: 14,
  },
  completeButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  sheetMentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetMentorText: {
    flex: 1,
    marginLeft: 12,
  },
  sheetBody: {
    ...typography.bodySecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  sheetCta: {
    marginBottom: 10,
  },
  counterInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  counterInputPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 6,
  },
  counterInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  },
  counterNoteInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 70,
    marginBottom: 20,
    borderWidth: 0,
    outlineStyle: 'none',
  },
});

export default BountyDetailScreen;
