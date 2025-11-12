import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

type Temp = { c: number; place: string } | null;

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState<Temp>(null);
  const [error, setError] = useState("");

  const getWeather = async () => {
    if (!city.trim()) return;
    try {
      setLoading(true);
      setError("");
      setTemp(null);

      // 1) Geocode city -> lat/lon
      const g = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      ).then((r) => r.json());

      if (!g.results?.length) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = g.results[0];

      // 2) Fetch current weather
      const w = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      ).then((r) => r.json());

      setTemp({ c: w.current_weather.temperature, place: `${name}, ${country}` });
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather</Text>

      <TextInput
        style={styles.input}
        placeholder="Type a city (e.g., London) and press enter"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={getWeather}
        returnKeyType="search"
      />

      {loading && <ActivityIndicator size="large" />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {temp && <Text style={styles.result}>{temp.place}: {temp.c} °C</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "600" },
  input: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: 10, padding: 12 },
  result: { fontSize: 22, marginTop: 8 },
  error: { color: "red", marginTop: 8 },
});
