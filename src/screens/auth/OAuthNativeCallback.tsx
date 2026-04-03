import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useClerk } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

export default function OAuthNativeCallback() {
  const { session } = useClerk();
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Must be called on every mount of this screen, NOT at module scope.
    // Module-scope code runs once at app startup (no OAuth pending yet).
    // This screen is navigated to when the deep link italiantoapp://oauth-native-callback
    // fires — calling maybeCompleteAuthSession() HERE resolves the pending
    // openAuthSessionAsync() promise inside startSSOFlow().
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    // Safety net: if the session was established (startSSOFlow resolved normally
    // OR the session was set through the deep link params), navigate to the app.
    if (session) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [session]);

  // Also handle the case where the app was in the background and the deep link
  // URL arrives via the Linking event (Edge full-browser behavior on Android).
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (url.startsWith('italiantoapp://oauth-native-callback')) {
        WebBrowser.maybeCompleteAuthSession();
      }
    };
    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, []);

  return null;
}
