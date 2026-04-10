import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS } from '../components/theme';
import { DEFAULT_PAYOUT_PERCENTAGES } from '../constants';

const ROUND_OFF_OPTIONS = [1, 5, 10, 20, 25, 50, 100, 200, 500];
const MAX_POSITIONS = 10;

function roundOff(amount: number, nearest: number): number {
  if (nearest <= 0) return Math.round(amount);
  return Math.round(amount / nearest) * nearest;
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputWrap}>
        {prefix && <Text style={styles.fieldPrefix}>{prefix}</Text>}
        <TextInput
          style={[styles.fieldInput, prefix ? { paddingLeft: 4 } : null]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          selectTextOnFocus
          placeholderTextColor={COLORS.dimText}
        />
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function PayoutScreen() {
  const playerState = useAppStore(s => s.players);

  // Local state (doesn't need to be global)
  const [numPlayers,   setNumPlayers]   = useState(String(playerState.playersRemaining));
  const [buyinCost,    setBuyinCost]    = useState('50');
  const [buyinChips,   setBuyinChips]   = useState(String(playerState.buyinChips));
  const [rebuyCost,    setRebuyCost]    = useState('50');
  const [rebuyChips,   setRebuyChips]   = useState(String(playerState.rebuyChips));
  const [rebuyCount,   setRebuyCount]   = useState(String(playerState.rebuysCount));
  const [addonCost,    setAddonCost]    = useState('50');
  const [addonChips,   setAddonChips]   = useState(String(playerState.addonChips));
  const [addonCount,   setAddonCount]   = useState(String(playerState.addonsCount));
  const [numPositions, setNumPositions] = useState(3);
  const [roundOffIdx,  setRoundOffIdx]  = useState(2); // default $10
  const [percentages,  setPercentages]  = useState<string[]>(() => {
    const defaults = DEFAULT_PAYOUT_PERCENTAGES[3] ?? [50, 30, 20];
    return Array.from({ length: MAX_POSITIONS }, (_, i) => String(defaults[i] ?? ''));
  });

  const p   = parseInt(numPlayers)  || 0;
  const bc  = parseFloat(buyinCost) || 0;
  const rc  = parseFloat(rebuyCost) || 0;
  const rn  = parseInt(rebuyCount)  || 0;
  const ac  = parseFloat(addonCost) || 0;
  const an  = parseInt(addonCount)  || 0;

  const bchips = parseInt(buyinChips)  || 0;
  const rchips = parseInt(rebuyChips)  || 0;
  const achips = parseInt(addonChips)  || 0;

  const totalPrizePool = (p * bc) + (rn * rc) + (an * ac);
  const totalChips     = (p * bchips) + (rn * rchips) + (an * achips);
  const avgStack       = p > 0 ? Math.round(totalChips / p) : 0;
  const roundOffAmt    = ROUND_OFF_OPTIONS[roundOffIdx];

  const payouts = useMemo(() => {
    return percentages.slice(0, numPositions).map(pct => {
      const raw = (parseFloat(pct) / 100) * totalPrizePool;
      return isNaN(raw) ? 0 : roundOff(raw, roundOffAmt);
    });
  }, [percentages, numPositions, totalPrizePool, roundOffAmt]);

  const updatePct = (i: number, v: string) => {
    setPercentages(prev => { const next = [...prev]; next[i] = v; return next; });
  };

  const loadDefaults = (n: number) => {
    setNumPositions(n);
    const defaults = DEFAULT_PAYOUT_PERCENTAGES[Math.min(n, 10)] ?? [];
    setPercentages(
      Array.from({ length: MAX_POSITIONS }, (_, i) => (defaults[i] != null ? String(defaults[i]) : ''))
    );
  };

  const totalPct = percentages
    .slice(0, numPositions)
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>PAYOUT CALCULATOR</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox label="PRIZE POOL" value={`$${totalPrizePool.toLocaleString()}`} />
          <StatBox label="AVG STACK"  value={avgStack.toLocaleString()} />
        </View>

        {/* Players */}
        <Section title="PLAYERS">
          <Field label="Players" value={numPlayers} onChange={setNumPlayers} />
        </Section>

        {/* Buy-in */}
        <Section title="BUY-IN">
          <Field label="Cost"  value={buyinCost}  onChange={setBuyinCost}  prefix="$" />
          <Field label="Chips" value={buyinChips} onChange={setBuyinChips} />
        </Section>

        {/* Rebuys */}
        <Section title="REBUYS">
          <Field label="Count" value={rebuyCount}  onChange={setRebuyCount}  />
          <Field label="Cost"  value={rebuyCost}   onChange={setRebuyCost}   prefix="$" />
          <Field label="Chips" value={rebuyChips}  onChange={setRebuyChips}  />
        </Section>

        {/* Add-ons */}
        <Section title="ADD-ONS">
          <Field label="Count" value={addonCount}  onChange={setAddonCount}  />
          <Field label="Cost"  value={addonCost}   onChange={setAddonCost}   prefix="$" />
          <Field label="Chips" value={addonChips}  onChange={setAddonChips}  />
        </Section>

        {/* Round-off */}
        <Section title="ROUND OFF TO NEAREST">
          <View style={styles.chipRow}>
            {ROUND_OFF_OPTIONS.map((v, i) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, roundOffIdx === i && styles.chipActive]}
                onPress={() => setRoundOffIdx(i)}
              >
                <Text style={[styles.chipText, roundOffIdx === i && { color: COLORS.timerText }]}>
                  ${v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Positions */}
        <Section title="PAYOUT POSITIONS">
          <View style={styles.posRow}>
            {Array.from({ length: MAX_POSITIONS }, (_, i) => i + 1).map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.posBtn, numPositions === n && styles.posBtnActive]}
                onPress={() => loadDefaults(n)}
              >
                <Text style={[styles.posBtnText, numPositions === n && { color: COLORS.timerText }]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payout table */}
          <View style={styles.payTable}>
            <View style={styles.payHeader}>
              <Text style={[styles.payHead, styles.payColPlace]}>PLACE</Text>
              <Text style={[styles.payHead, styles.payColPct]}>%</Text>
              <Text style={[styles.payHead, styles.payColAmt]}>AMOUNT</Text>
            </View>
            {Array.from({ length: numPositions }, (_, i) => (
              <View key={i} style={[styles.payRow, i % 2 === 1 && styles.payRowOdd]}>
                <Text style={[styles.payPlace, styles.payColPlace]}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}th`}
                </Text>
                <View style={[styles.payPctWrap, styles.payColPct]}>
                  <TextInput
                    style={styles.payPctInput}
                    value={percentages[i]}
                    onChangeText={v => updatePct(i, v)}
                    keyboardType="numeric"
                    selectTextOnFocus
                    placeholderTextColor={COLORS.dimText}
                  />
                  <Text style={styles.payPctSymbol}>%</Text>
                </View>
                <View style={[styles.payAmountBox, styles.payColAmt]}>
                  <Text style={styles.payAmount}>
                    ${payouts[i].toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Total row */}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.payColPlace]}>TOTAL</Text>
              <View style={[styles.payColPct, { alignItems: 'flex-end' }]}>
                <Text style={styles.totalPct}>
                  {totalPct.toFixed(0)}%
                  {Math.abs(totalPct - 100) > 0.5 && (
                    <Text style={{ color: COLORS.danger }}> !</Text>
                  )}
                </Text>
              </View>
              <View style={[styles.payColAmt, { alignItems: 'flex-end' }]}>
                <Text style={styles.totalAmount}>
                  ${payouts.reduce((s, v) => s + v, 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  header:      { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  headerTitle: { color: COLORS.primaryText, fontSize: 13, letterSpacing: 2 },
  content:     { paddingHorizontal: 16, paddingTop: 12 },

  statsRow:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox:     { flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  statLabel:   { color: COLORS.labelText, fontSize: 10, letterSpacing: 2 },
  statValue:   { color: COLORS.timerText, fontSize: 22, fontWeight: '300' },

  section:     { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle:{ color: COLORS.labelText, fontSize: 10, letterSpacing: 2, marginBottom: 10 },

  fieldRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  fieldLabel:  { color: COLORS.primaryText, fontSize: 14 },
  fieldInputWrap:{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: 8, overflow: 'hidden' },
  fieldPrefix: { color: COLORS.dimText, paddingLeft: 10, fontSize: 14 },
  fieldInput:  { color: COLORS.primaryText, paddingHorizontal: 10, paddingVertical: 8, width: 110, textAlign: 'right', fontSize: 15 },

  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { borderWidth: 1, borderColor: COLORS.divider, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  chipActive:  { borderColor: COLORS.timerText, backgroundColor: COLORS.timerText + '22' },
  chipText:    { color: COLORS.dimText, fontSize: 12 },

  posRow:      { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  posBtn:      { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.divider, alignItems: 'center', justifyContent: 'center' },
  posBtnActive:{ borderColor: COLORS.timerText, backgroundColor: COLORS.timerText + '22' },
  posBtnText:  { color: COLORS.dimText, fontSize: 13 },

  payTable:    { gap: 0, borderRadius: 8, overflow: 'hidden' },
  payHeader:   { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 8, backgroundColor: COLORS.surfaceAlt },
  payHead:     { color: COLORS.dimText, fontSize: 10, letterSpacing: 1.5 },
  payColPlace: { flex: 2 },
  payColPct:   { flex: 1, alignItems: 'center' as const },
  payColAmt:   { flex: 1 },
  payRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  payRowOdd:   { backgroundColor: COLORS.surfaceAlt + '66' },
  payPlace:    { color: COLORS.primaryText, fontSize: 14 },
  payPctWrap:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  payPctInput: { width: 52, backgroundColor: COLORS.surfaceAlt, color: COLORS.blindText, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, fontSize: 14, textAlign: 'right' },
  payPctSymbol:{ color: COLORS.dimText, fontSize: 12 },
  payAmountBox:{ alignItems: 'flex-end', justifyContent: 'center' },
  payAmount:   { color: COLORS.blindText, fontSize: 14, textAlign: 'right', fontWeight: '500' },
  totalRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.divider, marginTop: 4 },
  totalLabel:  { color: COLORS.labelText, fontSize: 11, letterSpacing: 1.5 },
  totalPct:    { color: COLORS.labelText, fontSize: 13, textAlign: 'right' },
  totalAmount: { color: COLORS.timerText, fontSize: 15, fontWeight: '600', textAlign: 'right' },
});
