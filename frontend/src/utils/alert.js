import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert utility
 * Works on both mobile (React Native Alert) and web (browser confirm/alert)
 */
export const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    // Web implementation using browser dialogs
    if (buttons && buttons.length > 0) {
      // For confirm dialogs
      const confirmMessage = `${title}\n\n${message}`;
      const result = window.confirm(confirmMessage);
      
      if (result && buttons.length > 1) {
        // User clicked OK - execute the confirm button action
        const confirmButton = buttons.find(btn => btn.style !== 'cancel');
        if (confirmButton && confirmButton.onPress) {
          confirmButton.onPress();
        }
      } else if (!result && buttons.length > 0) {
        // User clicked Cancel - execute the cancel button action if exists
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      // Simple alert
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // Mobile implementation using React Native Alert
    if (buttons && buttons.length > 0) {
      Alert.alert(title, message, buttons);
    } else {
      Alert.alert(title, message);
    }
  }
};

/**
 * Simple alert without buttons
 */
export const showSimpleAlert = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Confirm dialog with OK/Cancel
 * Returns a promise that resolves to true if user confirms, false if they cancel
 */
export const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: () => resolve(true)
          }
        ]
      );
    }
  });
};
