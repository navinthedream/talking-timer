import React, { useState } from 'react';
import {
  View, Text, Switch, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useAppStore } from '../store';
import { Settings, TtsLanguage } from '../types';
import { COLORS } from '../components/theme';

// ─── Reusable pieces ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, sublabel, value, onChange }: {
  label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.divider, true: COLORS.timerText + '88' }}
        thumbColor={value ? COLORS.timerText : COLORS.labelText}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES: { key: TtsLanguage; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'fr', label: 'French',  flag: '🇫🇷' },
  { key: 'it', label: 'Italian', flag: '🇮🇹' },
  { key: 'de', label: 'German',  flag: '🇩🇪' },
  { key: 'es', label: 'Spanish', flag: '🇪🇸' },
  { key: 'ru', label: 'Russian', flag: '🇷🇺' },
];

const SIZE_OPTIONS = [
  { value: 1.0, label: 'S' },
  { value: 1.2, label: 'M' },
  { value: 1.4, label: 'L' },
  { value: 1.6, label: 'XL' },
];

const CLOCK_DURATIONS = [15, 20, 30, 45, 60];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const settings       = useAppStore(s => s.settings);
  const players        = useAppStore(s => s.players);
  const updateSettings = useAppStore(s => s.updateSettings);
  const updatePlayers  = useAppStore(s => s.updatePlayers);

  const upd = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    updateSettings({ [key]: value } as Partial<Settings>);

  // Local text state for chip count inputs to avoid lag
  const [buyinChipsText,  setBuyinChipsText]  = useState(String(players.buyinChips));
  const [rebuyChipsText,  setRebuyChipsText]  = useState(String(players.rebuyChips));
  const [addonChipsText,  setAddonChipsText]  = useState(String(players.addonChips));

  const showTTSLanguage = settings.sayBlinds || settings.oneMinuteVoiceOn;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Display */}
        <Section title="DISPLAY">
          <ToggleRow
            label="Show Stack Details"
            sublabel="Players, rebuys, avg stack on timer screen"
            value={settings.showStackDetails}
            onChange={v => upd('showStackDetails', v)}
          />
          <Divider />
          <ToggleRow
            label="Show Next Blind"
            value={settings.showNextBlind}
            onChange={v => upd('showNextBlind', v)}
          />
          <Divider />
          <ToggleRow
            label="Show Time to Break"
            value={settings.showTimeToBreak}
            onChange={v => upd('showTimeToBreak', v)}
          />
        </Section>

        {/* Clock size */}
        <Section title="CLOCK SIZE">
          <View style={styles.segmentGroup}>
            {SIZE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[styles.segBtn, settings.clockSizeMultiplier === opt.value && styles.segBtnActive]}
                onPress={() => upd('clockSizeMultiplier', opt.value)}
              >
                <Text style={[
                  styles.segBtnText,
                  settings.clockSizeMultiplier === opt.value && { color: COLORS.timerText },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Blinds size */}
        <Section title="BLINDS SIZE">
          <View style={styles.segmentGroup}>
            {SIZE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.label}
                style={[styles.segBtn, settings.blindsSizeMultiplier === opt.value && styles.segBtnActive]}
                onPress={() => upd('blindsSizeMultiplier', opt.value)}
              >
                <Text style={[
                  styles.segBtnText,
                  settings.blindsSizeMultiplier === opt.value && { color: COLORS.timerText },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Audio Alerts */}
        <Section title="AUDIO ALERTS">
          <ToggleRow
            label="Round End Alert"
            sublabel="Plays when a round finishes"
            value={settings.roundAlertOn}
            onChange={v => upd('roundAlertOn', v)}
          />
          <Divider />
          <ToggleRow
            label="1-Minute Warning Sound"
            sublabel="Alert at 60 seconds remaining"
            value={settings.oneMinuteAlertOn}
            onChange={v => upd('oneMinuteAlertOn', v)}
          />
          <Divider />
          <ToggleRow
            label="Vibrate on Round End"
            value={settings.vibrateOn}
            onChange={v => upd('vibrateOn', v)}
          />
        </Section>

        {/* Text-to-Speech */}
        <Section title="TEXT TO SPEECH">
          <ToggleRow
            label="Announce Blinds"
            sublabel="Speaks blind values at each round"
            value={settings.sayBlinds}
            onChange={v => upd('sayBlinds', v)}
          />
          <Divider />
          <ToggleRow
            label="1-Minute Voice Warning"
            sublabel="Speaks 'one minute remaining'"
            value={settings.oneMinuteVoiceOn}
            onChange={v => upd('oneMinuteVoiceOn', v)}
          />

          {showTTSLanguage && (
            <>
              <Divider />
              <Text style={[styles.rowSublabel, { letterSpacing: 1.5, marginBottom: 8 }]}>LANGUAGE</Text>
              <View style={styles.langGrid}>
                {LANGUAGES.map(({ key, label, flag }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.langBtn, settings.ttsLanguage === key && styles.langBtnActive]}
                    onPress={() => upd('ttsLanguage', key)}
                  >
                    <Text style={styles.langFlag}>{flag}</Text>
                    <Text style={[styles.langLabel, settings.ttsLanguage === key && { color: COLORS.timerText }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Section>

        {/* Call the Clock */}
        <Section title="CALL THE CLOCK">
          <Text style={styles.rowLabel}>Timer Duration</Text>
          <View style={[styles.segmentGroup, { marginTop: 10 }]}>
            {CLOCK_DURATIONS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.segBtn, settings.callTheClockSeconds === s && styles.segBtnActive]}
                onPress={() => upd('callTheClockSeconds', s)}
              >
                <Text style={[styles.segBtnText, settings.callTheClockSeconds === s && { color: COLORS.timerText }]}>
                  {s}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Chip counts (used for avg stack display) */}
        <Section title="CHIP COUNTS (avg stack calculation)">
          {[
            { label: 'Buy-in chips',  text: buyinChipsText,  setText: setBuyinChipsText,  key: 'buyinChips'  as const },
            { label: 'Rebuy chips',   text: rebuyChipsText,  setText: setRebuyChipsText,  key: 'rebuyChips'  as const },
            { label: 'Add-on chips',  text: addonChipsText,  setText: setAddonChipsText,  key: 'addonChips'  as const },
          ].map(({ label, text, setText, key }, idx, arr) => (
            <React.Fragment key={key}>
              <View style={styles.toggleRow}>
                <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
                <TextInput
                  style={styles.chipInput}
                  value={text}
                  onChangeText={v => {
                    setText(v);
                    const n = parseInt(v);
                    if (!isNaN(n) && n > 0) updatePlayers({ [key]: n });
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
              {idx < arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: COLORS.background },
  header:       { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  headerTitle:  { color: COLORS.primaryText, fontSize: 13, letterSpacing: 2 },
  content:      { paddingHorizontal: 16, paddingTop: 14 },

  section:      { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { color: COLORS.labelText, fontSize: 10, letterSpacing: 2, marginBottom: 10 },

  divider:      { height: 1, backgroundColor: COLORS.divider, marginVertical: 2 },

  toggleRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  rowLabel:     { color: COLORS.primaryText, fontSize: 14 },
  rowSublabel:  { color: COLORS.dimText, fontSize: 11, marginTop: 2 },

  segmentGroup: { flexDirection: 'row', gap: 8 },
  segBtn:       { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.divider, alignItems: 'center' },
  segBtnActive: { borderColor: COLORS.timerText, backgroundColor: COLORS.timerText + '1A' },
  segBtnText:   { color: COLORS.dimText, fontSize: 13, letterSpacing: 0.5 },

  langGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 4 },
  langBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.divider, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minWidth: '45%' },
  langBtnActive:{ borderColor: COLORS.timerText, backgroundColor: COLORS.timerText + '1A' },
  langFlag:     { fontSize: 18 },
  langLabel:    { color: COLORS.dimText, fontSize: 13 },

  chipInput:    { backgroundColor: COLORS.surfaceAlt, color: COLORS.primaryText, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, width: 100, textAlign: 'right', fontSize: 15 },
});
