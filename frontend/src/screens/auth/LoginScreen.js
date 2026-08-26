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
import { colors, typography, layout } from '../../theme';
import { showAlert } from '../../utils/alert';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      await signIn(data);
    } catch (error) {
      showAlert('Login failed', error.response?.data?.error || 'Check your email and password and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <BrandMark size={52} />

          <Text style={styles.headline}>Welcome back</Text>
          <Text style={styles.subtext}>
            Log in to keep learning with mentors who bid to help you.
          </Text>

          <View style={styles.form}>
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

            <Button title="Continue" onPress={handleLogin} loading={loading} style={styles.cta} />

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkStrong}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to EduCast's Terms of Service and Privacy Policy.
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
    marginBottom: 32,
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

export default LoginScreen;
