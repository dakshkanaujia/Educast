import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { colors, typography, layout, radii, shadow } from '../theme';

const STUDENT_NAV = [
  { key: 'bounties', label: 'Bounties', route: 'StudentHome' },
  { key: 'mentors', label: 'Mentors', route: 'MentorDirectory' },
  { key: 'messages', label: 'Messages', route: 'Messages' },
];

const MENTOR_NAV = [
  { key: 'bounties', label: 'Bounties', route: 'MentorFeed' },
  { key: 'bids', label: 'My Bids', route: 'MyBids' },
  { key: 'messages', label: 'Messages', route: 'Messages' },
];

// The one persistent piece of chrome across every hub screen — brand,
// primary nav, and the account menu. Page-specific title/CTA live below
// it in ScreenHeader, inside each screen's own scroll content.
const AppHeader = ({ navigation, current }) => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMentor = user?.role === 'Mentor';
  const nav = isMentor ? MENTOR_NAV : STUDENT_NAV;
  const homeRoute = isMentor ? 'MentorFeed' : 'StudentHome';
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : null;

  return (
    <View style={styles.bar}>
      <View style={styles.accentStripe} />
      <View style={styles.inner}>
        <TouchableOpacity style={styles.brand} onPress={() => navigation.navigate(homeRoute)} activeOpacity={0.75}>
          <Text style={styles.brandText}>
            Edu<Text style={styles.brandTextAccent}>Cast</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.navRow}>
          {nav.map((item) => {
            const active = current === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.navItem}
                onPress={() => navigation.navigate(item.route)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.navLink, active && styles.navLinkActive]}>{item.label}</Text>
                <View style={[styles.navIndicator, active && styles.navIndicatorActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {firstName ? (
          <Text style={styles.greeting} numberOfLines={1}>
            Hi, <Text style={styles.greetingName}>{firstName}</Text>
          </Text>
        ) : null}

        <View style={[styles.roleTag, isMentor ? styles.roleTagMentor : styles.roleTagStudent]}>
          <Text style={[styles.roleTagText, isMentor ? styles.roleTagTextMentor : styles.roleTagTextStudent]}>
            {isMentor ? 'Mentor' : 'Student'}
          </Text>
        </View>

        <TouchableOpacity style={styles.profileTrigger} onPress={() => setMenuOpen(true)} activeOpacity={0.75}>
          <Avatar name={user?.name} size={38} />
          <Text style={styles.profileLabel}>Profile</Text>
          <Text style={styles.chevron}>▾</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuName} numberOfLines={1}>{user?.name || 'Account'}</Text>
            <Text style={styles.menuEmail} numberOfLines={1}>{user?.email}</Text>
            <View style={styles.menuDivider} />
            {isMentor ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('MentorProfile', { mentorId: user.id, mentorName: user.name });
                }}
              >
                <Text style={styles.menuItemText}>View my profile</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <Text style={[styles.menuItemText, styles.logoutText]}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.card,
  },
  accentStripe: {
    height: 3,
    backgroundColor: colors.accent,
  },
  inner: {
    width: '100%',
    maxWidth: layout.wideMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 76,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 44,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  brandTextAccent: {
    color: colors.accent,
  },
  navRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navItem: {
    alignItems: 'center',
  },
  navLink: {
    fontSize: 15.5,
    fontWeight: '550',
    color: colors.textSecondary,
  },
  navLinkActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  navIndicator: {
    height: 2.5,
    width: '100%',
    borderRadius: 1.5,
    marginTop: 9,
    backgroundColor: 'transparent',
  },
  navIndicatorActive: {
    backgroundColor: colors.accent,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: 18,
  },
  greetingName: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginRight: 18,
  },
  roleTagStudent: {
    backgroundColor: colors.accentBg,
  },
  roleTagMentor: {
    backgroundColor: colors.warningBg,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  roleTagTextStudent: {
    color: colors.accent,
  },
  roleTagTextMentor: {
    color: colors.warning,
  },
  profileTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 10,
  },
  chevron: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  backdrop: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingRight: 20,
  },
  menu: {
    width: 230,
    marginRight: 20,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
    ...shadow.raised,
  },
  menuName: {
    ...typography.bodyStrong,
    marginTop: 4,
  },
  menuEmail: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  menuItem: {
    paddingVertical: 11,
  },
  menuItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutText: {
    color: colors.error,
  },
});

export default AppHeader;
