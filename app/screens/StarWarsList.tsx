import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { PersonListItem } from "../components/PersonListItem";
import { colors } from "../constants/colors";
import { StarWarsPerson } from "../data/StarWarsPerson";
import { useStarWarsPeople } from "../hooks/useStarWarsPeople";
import { AddPersonModal } from "../models/AddPersonModal";
import { addPerson } from "../redux/addedPeopleSlice";
import { RootState } from "../redux/store";
import { dummySavePersonApi } from "../services/dummy-save-api";

const FAB_BOTTOM_OFFSET = 24;
const ITEM_HEIGHT = 80;
const INITIAL_NUM_TO_RENDER = 12;
const MAX_TO_RENDER_PER_BATCH = 10;
const WINDOW_SIZE = 11;

function genderChipLabel(value: string): string {
  if (!value) return "All";
  if (value === "n/a") return "N/A";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function StarWarsListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  // API: load directly (not stored in Redux), with pagination
  const {
    data: apiPeople,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useStarWarsPeople();
  // Redux: people saved via the modal (persisted)
  const addedPeopleFromRedux = useSelector(
    (state: RootState) => state.addedPeople.list,
  );
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);

  const fabBottom = insets.bottom + FAB_BOTTOM_OFFSET;

  // Combine both: Redux (modal-saved) at top, then API data
  const people: StarWarsPerson[] = useMemo(
    () => [...addedPeopleFromRedux, ...(apiPeople ?? [])],
    [addedPeopleFromRedux, apiPeople],
  );

  // Unique genders from data for chips (All + sorted unique values)
  const genderOptions = useMemo(() => {
    const set = new Set(people.map((p) => p.gender.toLowerCase()));
    const rest = Array.from(set).filter(Boolean).sort();
    return ["", ...rest];
  }, [people]);

  const filtered = useMemo(() => {
    let list = people;
    if (search.trim()) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (genderFilter) {
      list = list.filter(
        (item) => item.gender.toLowerCase() === genderFilter.toLowerCase(),
      );
    }
    return list;
  }, [search, genderFilter, people]);

  const handlePersonPress = useCallback(
    (person: StarWarsPerson) => {
      navigation.navigate("StarWarsDetail", { person });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<StarWarsPerson> = useCallback(
    ({ item }) => (
      <PersonListItem item={item} onPress={handlePersonPress} />
    ),
    [handlePersonPress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback(
    (item: StarWarsPerson, index: number) => item.url || `person-${index}`,
    [],
  );
  const ItemSeparator = useMemo(
    () => () => <View style={styles.separator} />,
    [],
  );
  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No results found.</Text>
      </View>
    ),
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (error && people.length > 0) {
      return (
        <View style={styles.footerError}>
          <Text style={styles.footerErrorText}>
            {error?.message || "Couldn’t load more."}
          </Text>
          <TouchableOpacity
            style={styles.footerRetryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.footerRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!hasNextPage && filtered.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerLoadedAll}>Loaded all</Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, filtered.length, error, people.length, refetch]);

  const safeAreaStyle = {
    paddingTop: insets.top,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  // Initial loading: full-screen indicator (respect safe area)
  if (isLoading) {
    return (
      <View style={[styles.center, styles.screen, safeAreaStyle]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading characters…</Text>
      </View>
    );
  }

  // Full-screen error only when initial load failed (no data yet)
  const initialLoadFailed = error && people.length === 0;
  if (initialLoadFailed) {
    return (
      <View style={[styles.center, styles.screen, safeAreaStyle]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn’t load characters</Text>
          <Text style={styles.errorMessage}>
            {error?.message || "Something went wrong. Please try again."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, safeAreaStyle]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Characters</Text>
        <Text style={styles.headerSubtitle}>
          {filtered.length} {filtered.length === 1 ? "character" : "characters"}
        </Text>
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search by name…"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.searchClear}
            onPress={() => setSearch("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsWrap}
        style={styles.chipsScroll}
      >
        {genderOptions.map((value) => {
          const selected = genderFilter === value;
          return (
            <TouchableOpacity
              key={value || "all"}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setGenderFilter(value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
                numberOfLines={1}
              >
                {genderChipLabel(value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom, right: 20 + insets.right }]}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabLabel}>+</Text>
      </TouchableOpacity>
      <AddPersonModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={async (person: StarWarsPerson) => {
          try {
            await dummySavePersonApi();
          } catch (err: unknown) {
            const status = (err as { status?: number })?.status;
            const message = (err as { message?: string })?.message;
            // Only this dummy POST: 4XX = success. Other APIs (GET etc.) show error.
            if (status != null && status >= 400 && status < 500) {
              dispatch(addPerson(person));
              Alert.alert("Success", "Character saved successfully.");
              return;
            }
            return {
              success: false as const,
              error:
                message ||
                "Failed to save. Please check your connection and try again.",
            };
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    position: "relative",
  },
  search: {
    paddingLeft: 18,
    paddingRight: 40,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchClear: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  searchClearText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chipsScroll: {
    flexGrow: 0,
    marginTop: 8,
    marginBottom: 16,
    overflow: "visible",
  },
  chipsWrap: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textChip,
    letterSpacing: 0.15,
    lineHeight: 18,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
  separator: {
    height: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerLoadedAll: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  footerError: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerErrorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
  footerRetryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  footerRetryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 28,
    marginHorizontal: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabLabel: {
    fontSize: 28,
    fontWeight: "300",
    color: colors.onPrimary,
    lineHeight: 32,
  },
});
