// Nativo: carga TutorScreen lazy para evitar que @vapi-ai/react-native
// (WebRTC) inicialice al arrancar la app.
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const TutorScreen = React.lazy(() => import('../screens/TutorScreen'));

class TutorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(e: any) {
    return { hasError: true, error: e?.message ?? 'Error desconocido' };
  }
  componentDidCatch(e: any) {
    console.error('[TutorTab] Error boundary caught:', e);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Tutor AI no disponible
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function TutorTab() {
  return (
    <TutorErrorBoundary>
      <React.Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }>
        <TutorScreen />
      </React.Suspense>
    </TutorErrorBoundary>
  );
}
