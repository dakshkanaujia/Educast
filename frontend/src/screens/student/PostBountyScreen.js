import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as bountyService from '../../services/bounty';
import { showAlert } from '../../utils/alert';
import { Button, Card, Input, TextArea, SuccessOverlay } from '../../components';
import { colors, typography, layout } from '../../theme';

const PostBountyScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectTag, setSubjectTag] = useState('');
  const [budget, setBudget] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = 'Give your request a title';
    if (!description.trim()) next.description = 'Describe what you need help with';
    if (!budget) next.budget = 'Set a budget';
    else if (isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) next.budget = 'Enter a valid amount';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await bountyService.createBounty(title, description, subjectTag, budget);
      setSuccess(true);
    } catch (error) {
      showAlert('Error', error.response?.data?.error || 'Failed to create bounty');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.headline}>Post a request</Text>
        <Text style={styles.subtext}>Describe what you need help with — mentors will start bidding in real time.</Text>

        <Input
          label="Title"
          placeholder="e.g. Help with Calculus Problem"
          value={title}
          onChangeText={(t) => { setTitle(t); clearError('title'); }}
          error={errors.title}
        />

        <TextArea
          label="Description"
          placeholder="Describe your problem in detail..."
          value={description}
          onChangeText={(t) => { setDescription(t); clearError('description'); }}
          error={errors.description}
          minHeight={120}
        />

        <Input
          label="Subject (optional)"
          placeholder="e.g. Mathematics, Physics, Chemistry"
          value={subjectTag}
          onChangeText={setSubjectTag}
        />

        <Text style={styles.sectionLabel}>Your budget</Text>
        <Card hoverable={false} style={[styles.amountCard, errors.budget && styles.amountCardError]}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={budget}
            onChangeText={(t) => { setBudget(t); clearError('budget'); }}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </Card>
        {errors.budget ? <Text style={styles.errorText}>{errors.budget}</Text> : null}
        <Text style={styles.amountHint}>Mentors can bid at, above, or below this amount</Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <Button title="Post Bounty" onPress={handleSubmit} loading={loading} />
        </View>
      </View>

      <SuccessOverlay
        visible={success}
        title="Bounty posted"
        subtitle="Mentors can see it now and will start bidding. You'll be notified as offers come in."
        ctaLabel="Back to My Bounties"
        onCta={() => {
          setSuccess(false);
          navigation.goBack();
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
  headline: {
    ...typography.h1,
    marginBottom: 6,
  },
  subtext: {
    ...typography.bodySecondary,
    lineHeight: 20,
    marginBottom: 24,
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

export default PostBountyScreen;
