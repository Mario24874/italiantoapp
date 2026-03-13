// Web: importa TutorScreen directamente (sin React.lazy ni code splitting)
// En web no necesitamos lazy loading porque @vapi-ai/web se carga desde CDN
// en runtime (no al iniciar la app). El code-splitting de Metro en web causa
// "Requiring unknown module XXXX" por referencias cross-chunk rotas.
import React from 'react';
import TutorScreen from '../screens/TutorScreen';

export default function TutorTab() {
  return <TutorScreen />;
}
