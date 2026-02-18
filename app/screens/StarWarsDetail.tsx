import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { StarWarsPerson } from "../data/StarWarsPerson";
import { useFilms } from "../hooks/useFilms";

export type StarWarsDetailParams = {
  person: StarWarsPerson;
};

type Props = NativeStackScreenProps<{ StarWarsDetail: StarWarsDetailParams }, "StarWarsDetail">;

function formatLabel(s: string): string {
  if (!s || s === "n/a") return "N/A";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err != null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Something went wrong.";
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  if (value == null || value === "") return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function StarWarsDetailScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const person = route.params?.person;
  const filmUrls = person?.films ?? [];
  const {
    films,
    isLoading: filmsLoading,
    error: filmsError,
    refetchAll: refetchFilms,
  } = useFilms(filmUrls);

  const safeArea = {
    paddingTop: insets.top + 8,
    paddingBottom: 32 + insets.bottom,
    paddingLeft: 20 + insets.left,
    paddingRight: 20 + insets.right,
  };

  if (!person) {
    return (
      <View style={[styles.center, styles.screen, safeArea]}>
        <Text style={styles.empty}>No character data.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, safeArea]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.name}>{person.name}</Text>
        {(person.gender || person.birth_year) && (
          <Text style={styles.heroMeta}>
            {[person.gender && formatLabel(person.gender), person.birth_year]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Gender" value={person.gender} />
        <DetailRow label="Birth year" value={person.birth_year} />
        <DetailRow label="Height" value={person.height} />
        <DetailRow label="Mass" value={person.mass} />
        <DetailRow label="Hair color" value={person.hair_color} />
        <DetailRow label="Skin color" value={person.skin_color} />
        <DetailRow label="Eye color" value={person.eye_color} />
        <DetailRow label="Homeworld" value={person.homeworld} />
      </View>

      {person.films?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Films</Text>
          {filmsLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.filmsLoader} />
          ) : filmsError ? (
            <View style={styles.filmsErrorWrap}>
              <Text style={styles.errorText}>{getErrorMessage(filmsError)}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetchFilms()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            films.map((film) => (
              <View key={film.url} style={styles.filmRow}>
                <Text style={styles.filmTitle}>{film.title}</Text>
                <Text style={styles.filmRelease}>{film.release_date}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {person.species?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Species</Text>
          <Text style={styles.metaText}>{person.species.length} species</Text>
        </View>
      )}
      {person.vehicles?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicles</Text>
          <Text style={styles.metaText}>{person.vehicles.length} vehicle(s)</Text>
        </View>
      )}
      {person.starships?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Starships</Text>
          <Text style={styles.metaText}>{person.starships.length} starship(s)</Text>
        </View>
      )}
    </ScrollView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {
    elevation: 2,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  hero: {
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroMeta: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    ...cardShadow,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  filmsLoader: {
    marginVertical: 12,
  },
  filmRow: {
    paddingVertical: 10,
    marginBottom: 4,
  },
  filmTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  filmRelease: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  filmsErrorWrap: {
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "500",
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  empty: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
