import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { StarWarsPerson } from "../data/StarWarsPerson";

const emptyForm: Record<string, string> = {
  name: "",
  height: "",
  mass: "",
  hair_color: "",
  skin_color: "",
  eye_color: "",
  birth_year: "",
  gender: "",
  homeworld: "",
  films: "",
  species: "",
  vehicles: "",
  starships: "",
  url: "",
};

export type SaveResult = void | { success: false; error: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (person: StarWarsPerson) => void | Promise<SaveResult>;
};

const TOTAL_STEPS = 4;

export function AddPersonModal({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setStep(1);
      setForm(emptyForm);
      setErrorMessage(null);
      setErrorField(null);
    }
  }, [visible]);

  const update = (field: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
    if (errorField) setErrorField(null);
  };

  const parseCommaList = (s: string): string[] =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  /** Check that string is a valid http(s) URL (any path). */
  const isValidAnyUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  /** Check URL is http(s) and pathname matches pattern (e.g. /\/films\/\d+\/?$/i). */
  const isValidResourceUrl = (url: string, pathPattern: RegExp): boolean => {
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") return false;
      return pathPattern.test(u.pathname);
    } catch {
      return false;
    }
  };

  const validateUrlList = (
    urls: string[],
    pathPattern: RegExp,
    example: string,
    fieldLabel: string,
  ): string | null => {
    for (let i = 0; i < urls.length; i++) {
      if (!isValidResourceUrl(urls[i], pathPattern)) {
        return `Invalid ${fieldLabel} URL at position ${i + 1}. Use format: ${example}`;
      }
    }
    return null;
  };

  const validateSingleUrl = (
    url: string,
    pathPattern: RegExp,
    example: string,
    fieldLabel: string,
  ): string | null => {
    if (!isValidResourceUrl(url, pathPattern)) {
      return `Invalid ${fieldLabel} URL. Use format: ${example}`;
    }
    return null;
  };

  /** Validate homeworld: any valid http(s) link. */
  const validateHomeworldUrl = (url: string): string | null => {
    if (!isValidAnyUrl(url)) {
      return "Invalid Homeworld URL. Enter a valid link (e.g. https://swapi.dev/api/planets/1/).";
    }
    return null;
  };

  const SWAPI = {
    films: { pattern: /\/films\/\d+\/?$/i, example: "https://swapi.dev/api/films/1/" },
    species: { pattern: /\/species\/\d+\/?$/i, example: "https://swapi.dev/api/species/1/" },
    vehicles: { pattern: /\/vehicles\/\d+\/?$/i, example: "https://swapi.dev/api/vehicles/1/" },
    starships: { pattern: /\/starships\/\d+\/?$/i, example: "https://swapi.dev/api/starships/1/" },
  };

  const requiredStep1 = ["name", "height", "mass", "birth_year", "gender"] as const;
  const requiredStep2 = ["hair_color", "skin_color", "eye_color", "homeworld"] as const;

  const fieldLabels: Record<string, string> = {
    name: "Name",
    height: "Height",
    mass: "Mass",
    birth_year: "Birth year",
    gender: "Gender",
    hair_color: "Hair color",
    skin_color: "Skin color",
    eye_color: "Eye color",
    homeworld: "Homeworld",
  };

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      for (const key of requiredStep1) {
        if (!form[key].trim()) return `${fieldLabels[key]} is required.`;
      }
      if (form.height.trim() && !/^\d+(\.\d+)?$/.test(form.height.trim())) {
        return "Height must be a number (e.g. 172 or 172.5).";
      }
      if (form.mass.trim() && !/^\d+(\.\d+)?$/.test(form.mass.trim())) {
        return "Mass must be a number (e.g. 77 or 77.5).";
      }
    }
    if (s === 2) {
      for (const key of requiredStep2) {
        if (!form[key].trim()) return `${fieldLabels[key]} is required.`;
      }
    }
    return null;
  };

  const handleNext = () => {
    setErrorMessage(null);
    setErrorField(null);
    const err = validateStep(step);
    if (err) {
      setErrorMessage(err);
      if (step === 1) {
        setErrorField(
          err.includes("Height must be a number")
            ? "height"
            : err.includes("Mass must be a number")
              ? "mass"
              : (requiredStep1.find((k) => !form[k].trim()) ?? null),
        );
      }
      if (step === 2) setErrorField(requiredStep2.find((k) => !form[k].trim()) ?? null);
      return;
    }
    if (step === 2 && form.homeworld.trim()) {
      const homeErr = validateHomeworldUrl(form.homeworld.trim());
      if (homeErr) {
        setErrorMessage(homeErr);
        setErrorField("homeworld");
        return;
      }
    }
    if (step === 3) {
      if (form.films.trim()) {
        const e = validateUrlList(parseCommaList(form.films), SWAPI.films.pattern, SWAPI.films.example, "film");
        if (e) {
          setErrorMessage(e);
          setErrorField("films");
          return;
        }
      }
      if (form.species.trim()) {
        const e = validateUrlList(parseCommaList(form.species), SWAPI.species.pattern, SWAPI.species.example, "species");
        if (e) {
          setErrorMessage(e);
          setErrorField("species");
          return;
        }
      }
      if (form.vehicles.trim()) {
        const e = validateUrlList(parseCommaList(form.vehicles), SWAPI.vehicles.pattern, SWAPI.vehicles.example, "vehicle");
        if (e) {
          setErrorMessage(e);
          setErrorField("vehicles");
          return;
        }
      }
      if (form.starships.trim()) {
        const e = validateUrlList(parseCommaList(form.starships), SWAPI.starships.pattern, SWAPI.starships.example, "starship");
        if (e) {
          setErrorMessage(e);
          setErrorField("starships");
          return;
        }
      }
    }
    setStep((s) => s + 1);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setErrorField(null);
    const err1 = validateStep(1);
    const err2 = validateStep(2);
    const err = err1 ?? err2;
    if (err) {
      setErrorMessage(err);
      const key1 =
        err.includes("Height must be a number")
          ? "height"
          : err.includes("Mass must be a number")
            ? "mass"
            : requiredStep1.find((k) => !form[k].trim());
      const key2 = requiredStep2.find((k) => !form[k].trim());
      const key = key1 ?? key2 ?? null;
      setErrorField(key);
      if (key1) setStep(1);
      else if (key2) setStep(2);
      return;
    }
    if (form.homeworld.trim()) {
      const homeErr = validateHomeworldUrl(form.homeworld.trim());
      if (homeErr) {
        setErrorMessage(homeErr);
        setErrorField("homeworld");
        setStep(2);
        return;
      }
    }
    if (form.films.trim()) {
      const e = validateUrlList(parseCommaList(form.films), SWAPI.films.pattern, SWAPI.films.example, "film");
      if (e) {
        setErrorMessage(e);
        setErrorField("films");
        setStep(3);
        return;
      }
    }
    if (form.species.trim()) {
      const e = validateUrlList(parseCommaList(form.species), SWAPI.species.pattern, SWAPI.species.example, "species");
      if (e) {
        setErrorMessage(e);
        setErrorField("species");
        setStep(3);
        return;
      }
    }
    if (form.vehicles.trim()) {
      const e = validateUrlList(parseCommaList(form.vehicles), SWAPI.vehicles.pattern, SWAPI.vehicles.example, "vehicle");
      if (e) {
        setErrorMessage(e);
        setErrorField("vehicles");
        setStep(3);
        return;
      }
    }
    if (form.starships.trim()) {
      const e = validateUrlList(parseCommaList(form.starships), SWAPI.starships.pattern, SWAPI.starships.example, "starship");
      if (e) {
        setErrorMessage(e);
        setErrorField("starships");
        setStep(3);
        return;
      }
    }
    setSaving(true);
    const now = new Date().toISOString();
    const person: StarWarsPerson = {
      name: form.name.trim(),
      height: form.height.trim(),
      mass: form.mass.trim(),
      hair_color: form.hair_color.trim(),
      skin_color: form.skin_color.trim(),
      eye_color: form.eye_color.trim(),
      birth_year: form.birth_year.trim(),
      gender: form.gender.trim(),
      homeworld: form.homeworld.trim(),
      films: parseCommaList(form.films),
      species: parseCommaList(form.species),
      vehicles: parseCommaList(form.vehicles),
      starships: parseCommaList(form.starships),
      created: now,
      edited: now,
      url: form.url.trim() || `local://person-${Date.now()}`,
    };
    try {
      const result = await onSave(person);
      if (result && result.success === false) {
        setErrorMessage(result.error);
      } else {
        onClose();
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Add person — Step {step} of {TOTAL_STEPS}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 32 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Basic info</Text>
              <FormField label="Name *" value={form.name} onChange={update("name")} placeholder="Enter name" error={errorField === "name" ? errorMessage : undefined} />
              <FormField label="Height *" value={form.height} onChange={update("height")} error={errorField === "height" ? errorMessage : undefined} />
              <FormField label="Mass *" value={form.mass} onChange={update("mass")} error={errorField === "mass" ? errorMessage : undefined} />
              <FormField label="Birth year *" value={form.birth_year} onChange={update("birth_year")} placeholder="e.g. 19BBY" error={errorField === "birth_year" ? errorMessage : undefined} />
              <FormField label="Gender *" value={form.gender} onChange={update("gender")} error={errorField === "gender" ? errorMessage : undefined} />
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Appearance & homeworld</Text>
              <FormField label="Hair color *" value={form.hair_color} onChange={update("hair_color")} error={errorField === "hair_color" ? errorMessage : undefined} />
              <FormField label="Skin color *" value={form.skin_color} onChange={update("skin_color")} error={errorField === "skin_color" ? errorMessage : undefined} />
              <FormField label="Eye color *" value={form.eye_color} onChange={update("eye_color")} error={errorField === "eye_color" ? errorMessage : undefined} />
              <FormField label="Homeworld *" value={form.homeworld} onChange={update("homeworld")} placeholder="https://swapi.dev/api/planets/1/" error={errorField === "homeworld" ? errorMessage : undefined} />
            </>
          )}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Films & links (all optional)</Text>
              <FormField
                label="Films (optional, comma-separated swapi.dev URLs)"
                value={form.films}
                onChange={update("films")}
                placeholder="https://swapi.dev/api/films/1/, https://swapi.dev/api/films/2/"
                error={errorField === "films" ? errorMessage : undefined}
              />
              <FormField
                label="Species (optional, comma-separated swapi.dev URLs)"
                value={form.species}
                onChange={update("species")}
                placeholder="https://swapi.dev/api/species/1/, ..."
                error={errorField === "species" ? errorMessage : undefined}
              />
              <FormField
                label="Vehicles (optional, comma-separated swapi.dev URLs)"
                value={form.vehicles}
                onChange={update("vehicles")}
                placeholder="https://swapi.dev/api/vehicles/1/, ..."
                error={errorField === "vehicles" ? errorMessage : undefined}
              />
              <FormField
                label="Starships (optional, comma-separated swapi.dev URLs)"
                value={form.starships}
                onChange={update("starships")}
                placeholder="https://swapi.dev/api/starships/1/, ..."
                error={errorField === "starships" ? errorMessage : undefined}
              />
            </>
          )}
          {step === 4 && (
            <>
              <Text style={styles.stepTitle}>Details & save</Text>
              <FormField
                label="URL"
                value={form.url}
                onChange={update("url")}
                placeholder="Optional, auto-generated if empty"
              />
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </>
          )}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setErrorMessage(null);
                setErrorField(null);
                setStep((s) => s - 1);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
          {step < TOTAL_STEPS ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={styles.nextButtonText}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string | null;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {error ? (
          <Text style={styles.fieldErrorText}>{error}</Text>
        ) : null}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholderAlt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  cancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  fieldErrorText: {
    fontSize: 13,
    color: colors.errorAlt,
    fontWeight: "500",
    marginLeft: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderAlt,
    backgroundColor: colors.surface,
  },
  backButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 14,
    color: colors.errorAlt,
    marginTop: 8,
    marginBottom: 4,
  },
});
