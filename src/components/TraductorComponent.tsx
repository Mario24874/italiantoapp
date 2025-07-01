// Traductor.tsx
import React, { useState, useCallback } from 'react';
import { Button, TextInput, Text, View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

const TranslationApp = () => {
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('url-de-la-api', {
        params: {
          text: input,
          // otros parámetros necesarios para la API
        },
      });
      setTranslation(response.data.translation);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Se produjo un error desconocido.');
      }
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <View>
      <TextInput value={input} onChangeText={setInput} />
      <TouchableOpacity style={styles.button} onPress={translateText}>
        <Text style={styles.buttonText}>Tradurre</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator /> : <Text>{translation}</Text>}
      {error && <Text>Error: {error}</Text>}
    </View>
  );
};

export default React.memo(TranslationApp);
