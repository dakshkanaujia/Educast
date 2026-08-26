import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';
import { useBountyPresence } from '../../hooks/useBountyPresence';
import { Avatar, Badge, Button, Card, Chip, LoadingState, PresenceBadge } from '../../components';
import { colors, typography, layout } from '../../theme';

const MentorBountyDetailScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const presenceCount = useBountyPresence(bountyId);

  useEffect(() => {
    loadBountyDetails();
  }, []);

  const loadBountyDetails = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!bounty) return <LoadingState label="Request not found" />;

  return (
    <View style={styles.outer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.posterRow}>
          <Avatar name={bounty.student?.name} size={44} />
          <View style={styles.posterInfo}>
            <Text style={styles.posterLabel}>Posted by</Text>
            <Text style={styles.posterName}>{bounty.student?.name || 'Student'}</Text>
          </View>
          <Badge status={bounty.status} />
        </View>

        <PresenceBadge
          count={presenceCount}
          label={`${presenceCount} mentor${presenceCount === 1 ? '' : 's'} already preparing a bid — move fast`}
          style={styles.presence}
        />

        <Card style={styles.card}>
          <Text style={styles.title}>{bounty.title}</Text>
          <Text style={styles.description}>{bounty.description}</Text>

          {bounty.subject_tag ? (
            <View style={styles.chipRow}>
              <Chip label={bounty.subject_tag} />
            </View>
          ) : null}
        </Card>

        <Card hoverable={false} style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>Student's budget</Text>
          <Text style={styles.budgetValue}>${bounty.budget}</Text>
          <Text style={styles.budgetHint}>Your bid can be at, above, or below this amount</Text>
        </Card>
      </ScrollView>

      {bounty.status === 'OPEN' && (
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Button title="Place Bid" onPress={() => navigation.navigate('PlaceBid', { bountyId })} />
          </View>
        </View>
      )}

      {(bounty.status === 'IN_PROGRESS' || bounty.status === 'CLOSED') && (bounty.bids || []).some((b) => b.is_accepted) && (
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Button
              title={bounty.status === 'CLOSED' ? 'View session' : 'Go to session'}
              variant={bounty.status === 'CLOSED' ? 'secondary' : 'primary'}
              onPress={() => navigation.navigate('SessionRoom', { bountyId })}
            />
          </View>
        </View>
      )}
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
    paddingBottom: 12,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  posterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  posterLabel: {
    ...typography.caption,
  },
  posterName: {
    ...typography.bodyStrong,
  },
  presence: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    marginBottom: 10,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  budgetCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  budgetValue: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 6,
  },
  budgetHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
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

export default MentorBountyDetailScreen;
