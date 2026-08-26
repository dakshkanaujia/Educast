import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as bidService from '../../services/bid';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';
import { useAnnounceBountyPresence, useBountyPresence } from '../../hooks/useBountyPresence';
import { Avatar, Badge, Button, Card, Chip, Input, TextArea, LoadingState, PresenceBadge, SuccessOverlay } from '../../components';
import { colors, typography, layout } from '../../theme';

const DURATIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr', minutes: 120 },
];

const PlaceBidScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [bounty, setBounty] = useState(null);
  const [loadingBounty, setLoadingBounty] = useState(true);

  const [priceOffer, setPriceOffer] = useState('');
  const [duration, setDuration] = useState(60);
  const [preferredTime, setPreferredTime] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [priceInsight, setPriceInsight] = useState(null);

  useAnnounceBountyPresence(bountyId, bounty?.student_id);
  const totalPresence = useBountyPresence(bountyId);
  const otherMentorsCount = Math.max(0, totalPresence - 1);

  useEffect(() => {
    loadBounty();
  }, []);

  useEffect(() => {
    if (!bounty?.subject_tag) return;
    bidService
      .getPriceInsight(bounty.subject_tag)
      .then((data) => setPriceInsight(data.sample_size > 0 ? data : null))
      .catch(() => setPriceInsight(null));
  }, [bounty?.subject_tag]);

  const loadBounty = async () => {
    setLoadingBounty(true);
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load request details');
    } finally {
      setLoadingBounty(false);
    }
  };

  const validate = () => {
    const next = {};
    if (!priceOffer) next.priceOffer = 'Enter your proposed rate';
    else if (isNaN(parseFloat(priceOffer)) || parseFloat(priceOffer) <= 0) next.priceOffer = 'Enter a valid amount';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await bidService.createBid(bountyId, priceOffer, note, duration, preferredTime);
      setSuccess(true);
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBounty) return <LoadingState />;

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {bounty ? (
          <Card style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Avatar name={bounty.student?.name} size={40} />
              <View style={styles.requestHeaderText}>
                <Text style={styles.requestPoster}>{bounty.student?.name || 'Student'}</Text>
                <Text style={styles.requestBudget}>Budget ${bounty.budget}</Text>
              </View>
              <Badge status={bounty.status} />
            </View>
            <Text style={styles.requestTitle} numberOfLines={2}>{bounty.title}</Text>
            <Text style={styles.requestDescription} numberOfLines={3}>{bounty.description}</Text>
          </Card>
        ) : null}

        <PresenceBadge
          count={otherMentorsCount}
          label={`${otherMentorsCount} other mentor${otherMentorsCount === 1 ? '' : 's'} also preparing a bid`}
          style={styles.presence}
        />

        <Text style={styles.sectionLabel}>Your proposed rate</Text>
        <Card hoverable={false} style={[styles.amountCard, errors.priceOffer && styles.amountCardError]}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={priceOffer}
            onChangeText={(t) => {
              setPriceOffer(t);
              if (errors.priceOffer) setErrors((e) => ({ ...e, priceOffer: null }));
            }}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </Card>
        {errors.priceOffer ? <Text style={styles.errorText}>{errors.priceOffer}</Text> : null}
        <Text style={styles.amountHint}>Your proposed price for this session</Text>
        {priceInsight ? (
          <Text style={styles.insightText}>
            Typical accepted bids for {priceInsight.subject}: ${priceInsight.min_price.toFixed(0)}–${priceInsight.max_price.toFixed(0)} (avg $
            {priceInsight.avg_price.toFixed(0)}) from {priceInsight.sample_size} past session{priceInsight.sample_size === 1 ? '' : 's'}
          </Text>
        ) : null}

        <Text style={styles.sectionLabel}>Duration</Text>
        <View style={styles.chipRow}>
          {DURATIONS.map((d) => (
            <Chip
              key={d.minutes}
              label={d.label}
              selected={duration === d.minutes}
              onPress={() => setDuration(d.minutes)}
            />
          ))}
        </View>

        <Input
          label="Preferred time (optional)"
          placeholder="e.g. Today evening, Tomorrow 5pm"
          value={preferredTime}
          onChangeText={setPreferredTime}
          style={styles.field}
        />

        <TextArea
          label="Message to student (optional)"
          placeholder="Introduce yourself and explain how you can help..."
          value={note}
          onChangeText={setNote}
          maxLength={500}
          style={styles.field}
        />

        <Text style={styles.disclaimer}>
          The student will see your rate, duration, and message, and can accept or move on to another bid.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <Button title="Place Bid" onPress={handleSubmit} loading={submitting} />
        </View>
      </View>

      <SuccessOverlay
        visible={success}
        title="Bid placed"
        subtitle={`Your $${priceOffer} offer has been sent to ${bounty?.student?.name || 'the student'}. You'll be notified if it's accepted.`}
        ctaLabel="Back to Feed"
        onCta={() => {
          setSuccess(false);
          navigation.navigate('MentorFeed');
        }}
        secondaryLabel="View My Bids"
        onSecondary={() => {
          setSuccess(false);
          navigation.navigate('MyBids');
        }}
      />
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
  },
  requestCard: {
    marginBottom: 24,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  requestPoster: {
    ...typography.bodyStrong,
  },
  requestBudget: {
    ...typography.caption,
  },
  requestTitle: {
    ...typography.title,
    marginBottom: 4,
  },
  requestDescription: {
    ...typography.bodySecondary,
    lineHeight: 20,
  },
  presence: {
    marginBottom: 20,
  },
  sectionLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    overflow: 'hidden',
  },
  amountCardError: {
    borderColor: colors.error,
  },
  currency: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: 'center',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  amountHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  insightText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  field: {
    marginTop: 8,
  },
  disclaimer: {
    ...typography.caption,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerInner: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
});

export default PlaceBidScreen;
