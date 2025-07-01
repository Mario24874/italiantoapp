// Conjugador.tsx
import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

const ConjugadorComponent: React.FC = () => {
  const [tiempoVerbal, setTiempoVerbal] = useState<string>('presente');
  const [verbo, setVerbo] = useState<string>('');
  const [resultado, setResultado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConjugar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lógica de conjugación aquí
      // Por ahora, solo vamos a repetir el verbo y el tiempo verbal
      setResultado(`${verbo} en ${tiempoVerbal}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Se produjo un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  }, [verbo, tiempoVerbal]);

  return (
    <View>
      <Picker selectedValue={tiempoVerbal} onValueChange={(value) => setTiempoVerbal(value)}>
        <Picker.Item label="Presente" value="presente" />
        <Picker.Item label="Passato" value="pasado" />
        <Picker.Item label="Futuro" value="futuro" />
      </Picker>
      <TextInput value={verbo} onChangeText={setVerbo} />
      <TouchableOpacity style={styles.button} onPress={handleConjugar}>
        <Text style={styles.buttonText}>Coniugato</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator /> : <Text>{resultado}</Text>}
      {error && <Text>Error: {error}</Text>}
    </View>
  );
};

export default React.memo(ConjugadorComponent);
