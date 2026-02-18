import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";
import { StarWarsPerson } from "../data/StarWarsPerson";

type Props = {
  item: StarWarsPerson;
  onPress: (person: StarWarsPerson) => void;
};

function formatGender(g: string): string {
  if (g === "n/a") return g;
  return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
}

export const PersonListItem = React.memo(function PersonListItem({
  item,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatGender(item.gender)} · {item.birth_year}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: 0.25,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "400",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
    color: colors.textMuted,
    marginLeft: 8,
  },
});
