import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Switch,
} from "react-native";

type Temp = { c: number; place: string } | null;

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState<Temp>(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const systemScheme = useColorScheme();
  const activeTheme = theme === "system" ? systemScheme : theme;
  const isDark = activeTheme === "dark";

  const getWeather = async () => {
    if (!city.trim()) return;
    try {
      setLoading(true);
      setError("");
      setTemp(null);

      const g = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      ).then((r) => r.json());

      if (!g.results?.length) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = g.results[0];
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
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111" : "#fafafa" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Weather
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: isDark ? "#888" : "#ccc",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        placeholder="Type a city and press enter"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={city}
        onChangeText={setCity}
        onSubmitEditing={getWeather}
        returnKeyType="search"
      />

      {loading && <ActivityIndicator size="large" />}
      {error ? (
        <Text style={[styles.error, { color: "#ff6b6b" }]}>{error}</Text>
      ) : null}
      {temp && (
        <Text style={[styles.result, { color: isDark ? "#fff" : "#000" }]}>
          {temp.place}: {temp.c} °C
        </Text>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
        <Text style={{ color: isDark ? "#fff" : "#000", marginRight: 10 }}>
          Dark Mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={() =>
            setTheme(isDark ? "light" : "dark")
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  result: {
    fontSize: 22,
    marginTop: 16,
  },
  error: {
    marginTop: 8,
  },
});
