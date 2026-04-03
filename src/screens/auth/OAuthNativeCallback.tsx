import * as WebBrowser from 'expo-web-browser';

// IMPORTANT: Must be called at module level here — this screen is loaded
// when the deep link `italiantoapp://oauth-native-callback` fires on Android,
// which signals expo-web-browser to complete the pending auth session.
WebBrowser.maybeCompleteAuthSession();

export default function OAuthNativeCallback() {
  // This screen is never visible to the user. It only exists to trigger
  // maybeCompleteAuthSession() when the OAuth redirect brings the user back.
  return null;
}
