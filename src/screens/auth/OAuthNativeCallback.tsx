import { useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useClerk, useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

// OAuth redirect target for native Google Sign-In.
//
// Problem: Chrome Custom Tab fires an Android intent when it encounters
// italiantoapp:// and immediately closes. openAuthSessionAsync sees the
// Custom Tab close and returns { type: 'cancel' }, so startSSOFlow returns
// null even though the OAuth completed successfully on Clerk's server.
//
// Fix: call signIn.reload() here. If the OAuth finished server-side,
// Clerk returns status='complete' with a real createdSessionId.
export default function OAuthNativeCallback() {
  const { setActive } = useClerk();
  const { signIn, isLoaded } = useSignIn();
  const navigation = useNavigation<any>();

  const completeOAuth = useCallback(async () => {
    // Still call this for the iOS path where it resolves the pending promise.
    WebBrowser.maybeCompleteAuthSession();

    if (!isLoaded || !signIn) return;

    try {
      const updated = await signIn.reload();
      if (updated.status === 'complete' && updated.createdSessionId) {
        await setActive({ session: updated.createdSessionId });
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    } catch {
      // Sign-in not complete (user cancelled Google) — stay on current screen.
    }
  }, [isLoaded, signIn, setActive, navigation]);

  useEffect(() => {
    completeOAuth();
  }, [completeOAuth]);

  return null;
}
