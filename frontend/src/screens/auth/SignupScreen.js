import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth';
import { Button, Input } from '../../components';
import BrandMark from '../../components/BrandMark';
import { colors, typography, layout, radii } from '../../theme';
import { showAlert } from '../../utils/alert';

const ROLES = [
  { value: 'Student', title: "I'm a Student", hint: 'Post requests, hire mentors' },
  { value: 'Mentor', title: "I'm a Mentor", hint: 'Bid on requests, get paid' },
];

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Enter your full name';
    if (!email.trim()) next.email = 'Enter your email';
    if (!password) next.password = 'Choose a password';
    else if (password.length < 4) next.password = 'Use at least 4 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authService.signup(name.trim(), email.trim(), password, role);
      await signIn(data);
    } catch (error) {
      showAlert('Signup failed', error.response?.data?.error || 'Could not create your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <BrandMark size={52} />

          <Text style={styles.headline}>Create your account</Text>
          <Text style={styles.subtext}>
            Post a request or start bidding as a mentor — takes less than a minute.
          </Text>

          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const selected = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleOption, selected && styles.roleOptionSelected]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{r.title}</Text>
                  <Text style={[styles.roleHint, selected && styles.roleHintSelected]}>{r.hint}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.form}>
            <Input
              label="Full name"
              placeholder="Jane Doe"
              value={name}
              onChangeText={(t) => {
                setName(t);
                clearError('name');
              }}
              error={errors.name}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError('email');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError('password');
              }}
              secureTextEntry
              error={errors.password}
            />

            <Button title="Create account" onPress={handleSignup} loading={loading} style={styles.cta} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkStrong}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By creating an account, you agree to EduCast's Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: layout.authMaxWidth,
    alignSelf: 'center',
  },
  headline: {
    ...typography.display,
    marginTop: 24,
    marginBottom: 8,
  },
  subtext: {
    ...typography.bodySecondary,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 28,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: colors.onPrimary,
  },
  roleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  roleHintSelected: {
    color: 'rgba(255,255,255,0.75)',
  },
  form: {
    marginBottom: 24,
  },
  cta: {
    marginTop: 8,
    marginBottom: 20,
  },
  linkWrap: {
    alignItems: 'center',
  },
  linkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkStrong: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  terms: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SignupScreen;
