import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import * as bountyService from '../services/bounty';
import { showAlert } from '../utils/alert';
import { Avatar, Badge, Button, Card, LoadingState } from '../components';
import { colors, typography, layout } from '../theme';

const SessionDetailsScreen = ({ route, navigation }) => {
  const { bountyId } = route.params;
  const { user } = useAuth();
  const { messages, sendMessage } = useWebSocket();
  const [bounty, setBounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    loadBounty();
  }, []);

  // The student's "Mark as Complete" closes the bounty server-side and
  // broadcasts to both parties — this is what makes the session resolve
  // on the mentor's screen too, live, instead of only after a reload.
  useEffect(() => {
    const completion = [...messages]
      .reverse()
      .find((m) => m.type === 'bounty_completed' && String(m.payload?.bounty_id) === String(bountyId));
    if (completion && bounty && bounty.status !== 'CLOSED') {
      setBounty(completion.payload.bounty);
      if (user?.role === 'Mentor') {
        showAlert('Session complete', 'The student marked this session as complete and rated it.');
      }
    }
  }, [messages, bountyId, bounty, user]);

  // A mentor has no way to close the bounty themselves (payment release +
  // rating are the student's call) — but they can nudge the student that
  // they're done, which is the closest thing to "ending" it from their side.
  useEffect(() => {
    if (user?.role !== 'Student') return;
    const nudge = [...messages]
      .reverse()
      .find((m) => m.type === 'session_wrap_up' && String(m.payload?.bounty_id) === String(bountyId));
    if (nudge && bounty && bounty.status === 'IN_PROGRESS') {
      showAlert('Your mentor is finished', 'They marked this session as wrapped up — rate it and mark it complete when you\'re ready.');
    }
  }, [messages, bountyId, bounty, user]);

  const notifyStudentDone = () => {
    if (!bounty?.student_id) return;
    sendMessage({
      type: 'session_wrap_up',
      target_id: bounty.student_id,
      payload: { bounty_id: bounty.id, bounty_title: bounty.title },
    });
    setNotified(true);
    showAlert('Student notified', "We've let the student know you're finished.");
  };

  const loadBounty = async () => {
    setLoading(true);
    try {
      const data = await bountyService.getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      showAlert('Error', 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!bounty) return <LoadingState label="Session not found" />;

  const acceptedBid = (bounty.bids || []).find((b) => b.is_accepted);
  const isStudent = user?.role === 'Student';
  const partnerId = isStudent ? acceptedBid?.mentor_id : bounty.student_id;
  const partnerName = isStudent ? acceptedBid?.mentor?.name : bounty.student?.name;
  const partnerLabel = isStudent ? 'Mentor' : 'Student';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Badge status={bounty.status} />
        <Text style={styles.title}>{bounty.title}</Text>
        <Text style={styles.description}>{bounty.description}</Text>
        {bounty.subject_tag ? <Text style={styles.tag}>#{bounty.subject_tag}</Text> : null}

        <View style={styles.divider} />

        <View style={styles.partnerRow}>
          <Avatar name={partnerName} size={44} />
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerLabel}>{partnerLabel}</Text>
            <Text style={styles.partnerName}>{partnerName || 'Unknown'}</Text>
          </View>
          {acceptedBid ? <Text style={styles.price}>${acceptedBid.price_offer}</Text> : null}
        </View>

        {acceptedBid?.note ? (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Note from mentor</Text>
            <Text style={styles.note}>{acceptedBid.note}</Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoCardText}>
          Use the chat below to coordinate your session, then come back here
          {isStudent
            ? ' to mark it complete and rate your mentor.'
            : " — once you're done, let the student know so they can mark it complete and release payment."}
        </Text>
      </Card>

      {partnerId ? (
        <Button
          title="💬 Open Chat"
          variant="secondary"
          onPress={() =>
            navigation.navigate('SessionChat', {
              partnerId,
              partnerName: partnerName || partnerLabel,
              bountyTitle: bounty.title,
            })
          }
          style={styles.actionButton}
        />
      ) : null}

      {isStudent && bounty.status === 'IN_PROGRESS' && (
        <Button
          title="Mark as Complete"
          onPress={() => navigation.navigate('Completion', { bountyId })}
          style={styles.actionButton}
        />
      )}

      {!isStudent && bounty.status === 'IN_PROGRESS' && (
        <Button
          title={notified ? '✓ Student notified' : "I'm finished — notify student"}
          variant="secondary"
          disabled={notified}
          onPress={notifyStudentDone}
          style={styles.actionButton}
        />
      )}

      {bounty.status === 'CLOSED' && <Text style={styles.closedText}>✓ This session has been completed</Text>}

      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    marginTop: 12,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerLabel: {
    ...typography.caption,
  },
  partnerName: {
    ...typography.bodyStrong,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  noteSection: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  noteLabel: {
    ...typography.caption,
    marginBottom: 4,
  },
  note: {
    ...typography.body,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surfaceMuted,
    marginBottom: 20,
  },
  infoCardText: {
    ...typography.bodySecondary,
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  closedText: {
    textAlign: 'center',
    color: colors.success,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 16,
  },
});

export default SessionDetailsScreen;
