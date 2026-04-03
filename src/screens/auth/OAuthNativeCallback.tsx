import { useEffect } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

// Must be at module scope: closes the Chrome Custom Tab / Edge Custom Tab
// and resolves the pending startSSOFlow() promise in SignInScreen/SignUpScreen.
WebBrowser.maybeCompleteAuthSession();

export default function OAuthNativeCallback() {
  const { session } = useClerk();
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Safety net: if the session was established (either via startSSOFlow resolving
    // normally or via the deep link callback on a fresh app instance), navigate home.
    if (session) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [session]);

  return null;
}
