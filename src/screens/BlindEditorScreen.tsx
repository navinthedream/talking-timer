import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { BlindStructure, Round } from '../types';
import { COLORS } from '../components/theme';

const CUSTOM_IDS = [3, 4, 5];
const MAX_ROUNDS = 30;

const BLANK_ROUND: Round = {
  smallBlind: 0, bigBlind: 0, ante: 0,
  durationMinutes: 20, breakAfterMinutes: 0, comment: '',
};

// ─── Blind Wizard Modal ───────────────────────────────────────────────────────

function roundToNice(n: number, denom: number): number {
  if (n <= 0 || denom <= 0) return denom;
  return Math.max(denom, Math.round(n / denom) * denom);
}

interface WizardProps {
  onApply: (rounds: Round[]) => void;
  onClose: () => void;
}

function BlindWizardModal({ onApply, onClose }: WizardProps) {
  const [players,    setPlayers]    = useState('9');
  const [hours,      setHours]      = useState('3');
  const [chipDenom,  setChipDenom]  = useState('25');
  const [startChips, setStartChips] = useState('1500');
  const [roundMins,  setRoundMins]  = useState('20');
  const [rebuys,     setRebuys]     = useState(false);
  const [addons,     setAddons]     = useState(false);
  const [antes,      setAntes]      = useState(false);

  const calculate = () => {
    const p  = Math.max(1, parseInt(players)    || 9);
    const h  = Math.max(0.5, parseFloat(hours)  || 3);
    const cd = Math.max(1, parseInt(chipDenom)  || 25);
    const sc = Math.max(1, parseInt(startChips) || 1500);
    const rm = Math.max(1, parseInt(roundMins)  || 20);

    let totalChips = p * sc;
    if (rebuys) totalChips += 0.6 * p * sc;
    if (addons) totalChips += 0.8 * p * sc;

    const finalSB   = totalChips / 10.0;
    const numLevels = Math.min(30, Math.max(2, Math.floor((h * 60) / rm)));
    const xFactor   = Math.exp((Math.log(finalSB) - Math.log(cd)) / numLevels);

    const rounds: Round[] = [];
    let sb = cd;
    for (let i = 0; i < numLevels; i++) {
      const roundedSB = roundToNice(sb, cd);
      const ante      = antes ? roundToNice(roundedSB * 0.2, cd) : 0;
      rounds.push({
        smallBlind: roundedSB, bigBlind: roundedSB * 2, ante,
        durationMinutes: rm, breakAfterMinutes: 0, comment: '',
      });
      sb *= xFactor;
    }
    for (let i = 3; i < rounds.length; i += 4) {
      rounds[i].breakAfterMinutes = 15;
    }
    onApply(rounds);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={wStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={wStyles.card}>
          <Text style={wStyles.title}>BLIND WIZARD</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {([
              ['Players',                players,    setPlayers],
              ['Tournament Length (hrs)', hours,     setHours],
              ['Smallest Chip',          chipDenom,  setChipDenom],
              ['Starting Chips',         startChips, setStartChips],
              ['Round Length (min)',      roundMins,  setRoundMins],
            ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
              <View key={label} style={wStyles.field}>
                <Text style={wStyles.fieldLabel}>{label}</Text>
                <TextInput
                  style={wStyles.fieldInput}
                  value={val}
                  onChangeText={setter}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
            ))}
            <View style={wStyles.checkRow}>
              {([
                ['Rebuys', rebuys, setRebuys],
                ['Add-ons', addons, setAddons],
                ['Antes',   antes,  setAntes],
              ] as [string, boolean, (v: boolean) => void][]).map(([label, val, setter]) => (
                <TouchableOpacity key={label as string} style={wStyles.checkItem} onPress={() => setter(!val)}>
                  <View style={[wStyles.checkbox, val && wStyles.checkboxOn]} />
                  <Text style={wStyles.checkLabel}>{label as string}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={wStyles.calcBtn} onPress={calculate}>
              <Text style={wStyles.calcBtnText}>CALCULATE & APPLY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={wStyles.cancelBtn} onPress={onClose}>
              <Text style={wStyles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const wStyles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  card:         { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  title:        { color: COLORS.timerText, fontSize: 13, letterSpacing: 2, textAlign: 'center', marginBottom: 20 },
  field:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  fieldLabel:   { color: COLORS.labelText, fontSize: 13, letterSpacing: 1 },
  fieldInput:   { backgroundColor: COLORS.surfaceAlt, color: COLORS.primaryText, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, width: 110, textAlign: 'right', fontSize: 15 },
  checkRow:     { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  checkItem:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox:     { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.divider },
  checkboxOn:   { backgroundColor: COLORS.timerText, borderColor: COLORS.timerText },
  checkLabel:   { color: COLORS.primaryText, fontSize: 13 },
  calcBtn:      { backgroundColor: COLORS.timerText, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  calcBtnText:  { color: '#000', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  cancelBtn:    { alignItems: 'center', paddingVertical: 14 },
  cancelBtnText:{ color: COLORS.dimText, fontSize: 13, letterSpacing: 1 },
});

// ─── Add Menu Modal ───────────────────────────────────────────────────────────

function AddMenu({
  afterIdx, isLast, totalRounds,
  onAddBreak, onAddComment, onEndTournament, onAddRound, onClose,
}: {
  afterIdx: number; isLast: boolean; totalRounds: number;
  onAddBreak: () => void; onAddComment: () => void;
  onEndTournament: () => void; onAddRound: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={mStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={mStyles.card}>
          <Text style={mStyles.title}>AFTER LEVEL {afterIdx + 1}</Text>

          <TouchableOpacity style={mStyles.item} onPress={() => { onAddBreak(); onClose(); }}>
            <Text style={mStyles.icon}>☕</Text>
            <Text style={mStyles.label}>Add Break</Text>
          </TouchableOpacity>

          <View style={mStyles.divider} />

          <TouchableOpacity style={mStyles.item} onPress={() => { onAddComment(); onClose(); }}>
            <Text style={mStyles.icon}>💬</Text>
            <Text style={mStyles.label}>Add Spoken Comment</Text>
          </TouchableOpacity>

          <View style={mStyles.divider} />

          {isLast && totalRounds < MAX_ROUNDS ? (
            <TouchableOpacity style={mStyles.item} onPress={() => { onAddRound(); onClose(); }}>
              <Text style={[mStyles.icon, { color: COLORS.timerText }]}>＋</Text>
              <Text style={[mStyles.label, { color: COLORS.timerText }]}>Add Round</Text>
            </TouchableOpacity>
          ) : !isLast ? (
            <TouchableOpacity
              style={mStyles.item}
              onPress={() => {
                onClose();
                Alert.alert(
                  'End Tournament Here',
                  `Delete levels ${afterIdx + 2}–${totalRounds}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Here', style: 'destructive', onPress: onEndTournament },
                  ]
                );
              }}
            >
              <Text style={[mStyles.icon, { color: COLORS.danger }]}>🏁</Text>
              <Text style={[mStyles.label, { color: COLORS.danger }]}>End Tournament</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  card:    { backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 8, minWidth: 240, overflow: 'hidden' },
  title:   { color: COLORS.labelText, fontSize: 10, letterSpacing: 2, textAlign: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  item:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20 },
  icon:    { fontSize: 18, width: 24, textAlign: 'center' },
  label:   { color: COLORS.primaryText, fontSize: 15 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const COL_IDX  = 26;
const COL_SB   = 62;
const COL_BB   = 62;
const COL_ANTE = 56;
const COL_DUR  = 44;
const COL_DEL  = 32;

export function BlindEditorScreen() {
  const structures      = useAppStore(s => s.structures);
  const modelChoice     = useAppStore(s => s.modelChoice);
  const updateStructure = useAppStore(s => s.updateStructure);

  const defaultId = CUSTOM_IDS.includes(modelChoice) ? modelChoice : CUSTOM_IDS[0];

  const [selectedId,      setSelectedId]      = useState(defaultId);
  const [name,            setName]            = useState(() => structures[defaultId].name);
  const [rounds,          setRounds]          = useState<Round[]>(() =>
    structures[defaultId].rounds.length > 0 ? structures[defaultId].rounds : [{ ...BLANK_ROUND }]
  );
  const [unsaved,         setUnsaved]         = useState(false);
  const [addMenu,         setAddMenu]         = useState<number | null>(null);
  const [showWizard,      setShowWizard]      = useState(false);
  const [pendingComments, setPendingComments] = useState<Set<number>>(new Set());

  const doSwitch = (id: number) => {
    const r = structures[id].rounds;
    setSelectedId(id);
    setName(structures[id].name);
    setRounds(r.length > 0 ? r : [{ ...BLANK_ROUND }]);
    setUnsaved(false);
    setPendingComments(new Set());
  };

  const switchTo = (id: number) => {
    if (unsaved) {
      Alert.alert('Unsaved Changes', 'Discard unsaved changes?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => doSwitch(id) },
      ]);
    } else {
      doSwitch(id);
    }
  };

  const mutate = (newRounds: Round[]) => {
    setRounds(newRounds);
    setUnsaved(true);
  };

  const save = () => {
    const updated: BlindStructure = {
      id: selectedId,
      name: name.trim() || `Custom ${selectedId - 2}`,
      rounds,
    };
    updateStructure(updated);
    setUnsaved(false);
    Alert.alert('Saved', 'Blind structure saved.');
  };

  const updateRound = (i: number, partial: Partial<Round>) => {
    const next = [...rounds];
    next[i] = { ...next[i], ...partial };
    mutate(next);
  };

  const deleteRound = (i: number) => {
    if (rounds.length <= 1) return;
    const next = [...rounds];
    next.splice(i, 1);
    mutate(next);
  };

  const handleAddBreak = (afterIdx: number) => {
    updateRound(afterIdx, { breakAfterMinutes: 15 });
  };

  const handleAddComment = (afterIdx: number) => {
    setPendingComments(prev => new Set(prev).add(afterIdx));
  };

  const handleEndTournament = (afterIdx: number) => {
    const next = rounds
      .slice(0, afterIdx + 1)
      .map((r, i) => i === afterIdx ? { ...r, comment: 'The tournament has ended' } : r);
    mutate(next);
  };

  const handleAddRound = () => {
    mutate([...rounds, { ...BLANK_ROUND }]);
  };

  const clearAll = () => {
    const emptyRounds = Array.from({ length: 30 }, () => ({
      smallBlind: 0, bigBlind: 0, ante: 0,
      durationMinutes: 0, breakAfterMinutes: 0, comment: '',
    }));
    updateStructure({ ...structures[selectedId], name, rounds: emptyRounds });
    setRounds([{ ...BLANK_ROUND }]);
    setUnsaved(false);
    setPendingComments(new Set());
  };

  const applyWizard = (newRounds: Round[]) => {
    mutate(newRounds);
    setShowWizard(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLIND EDITOR</Text>
        <TouchableOpacity onPress={save}>
          <Text style={[styles.saveBtn, unsaved && { color: COLORS.warning }]}>
            {unsaved ? 'SAVE ●' : 'SAVED ✓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Structure tabs */}
      <View style={styles.tabs}>
        {CUSTOM_IDS.map(id => (
          <TouchableOpacity
            key={id}
            style={[styles.tab, selectedId === id && styles.tabActive]}
            onPress={() => switchTo(id)}
          >
            <Text style={[styles.tabText, selectedId === id && { color: COLORS.timerText }]}>
              {structures[id].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Name + actions */}
      <View style={styles.nameRow}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={v => { setName(v); setUnsaved(true); }}
          placeholder="Structure name"
          placeholderTextColor={COLORS.dimText}
        />
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowWizard(true)}>
          <Text style={styles.actionBtnText}>WIZARD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.danger + '66' }]} onPress={clearAll}>
          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.ch, { width: COL_IDX }]}>#</Text>
        <Text style={[styles.ch, { width: COL_SB }]}>SMALL</Text>
        <Text style={[styles.ch, { width: COL_BB }]}>BIG</Text>
        <Text style={[styles.ch, { width: COL_ANTE }]}>ANTE</Text>
        <Text style={[styles.ch, { width: COL_DUR }]}>MIN</Text>
        <Text style={[styles.ch, { width: COL_DEL }]} />
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {rounds.map((round, i) => (
          <View key={i}>

            {/* ── Round row ── */}
            <View style={[styles.roundRow, i % 2 === 1 && styles.roundRowOdd]}>
              <Text style={[styles.levelNum, { width: COL_IDX }]}>{i + 1}</Text>
              <TextInput
                style={[styles.cellInput, { width: COL_SB }]}
                value={round.smallBlind > 0 ? String(round.smallBlind) : ''}
                onChangeText={v => updateRound(i, { smallBlind: parseInt(v) || 0 })}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={COLORS.dimText}
                selectTextOnFocus
              />
              <TextInput
                style={[styles.cellInput, { width: COL_BB }]}
                value={round.bigBlind > 0 ? String(round.bigBlind) : ''}
                onChangeText={v => updateRound(i, { bigBlind: parseInt(v) || 0 })}
                keyboardType="numeric"
                placeholder="auto"
                placeholderTextColor={COLORS.dimText}
                selectTextOnFocus
              />
              <TextInput
                style={[styles.cellInput, { width: COL_ANTE }]}
                value={round.ante > 0 ? String(round.ante) : ''}
                onChangeText={v => updateRound(i, { ante: parseInt(v) || 0 })}
                keyboardType="numeric"
                placeholder="—"
                placeholderTextColor={COLORS.dimText}
                selectTextOnFocus
              />
              <TextInput
                style={[styles.cellInput, { width: COL_DUR }]}
                value={round.durationMinutes > 0 ? String(round.durationMinutes) : ''}
                onChangeText={v => updateRound(i, { durationMinutes: parseInt(v) || 0 })}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor={COLORS.dimText}
                selectTextOnFocus
              />
              <TouchableOpacity
                style={{ width: COL_DEL, alignItems: 'center' }}
                onPress={() => deleteRound(i)}
                disabled={rounds.length <= 1}
              >
                <Text style={[styles.deleteX, rounds.length <= 1 && { opacity: 0.15 }]}>×</Text>
              </TouchableOpacity>
            </View>

            {/* ── Break row ── */}
            {round.breakAfterMinutes > 0 && (
              <View style={styles.breakRow}>
                <Text style={styles.breakIcon}>☕</Text>
                <Text style={styles.breakLabel}>BREAK</Text>
                <TextInput
                  style={styles.breakInput}
                  value={String(round.breakAfterMinutes)}
                  onChangeText={v => updateRound(i, { breakAfterMinutes: parseInt(v) || 0 })}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <Text style={styles.breakUnit}>min</Text>
                <TouchableOpacity onPress={() => updateRound(i, { breakAfterMinutes: 0 })} style={styles.rowDelBtn}>
                  <Text style={styles.rowDelX}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Comment row ── */}
            {(round.comment !== '' || pendingComments.has(i)) && (
              <View style={styles.commentRow}>
                <Text style={styles.commentIcon}>💬</Text>
                <TextInput
                  style={styles.commentInput}
                  value={round.comment}
                  onChangeText={v => {
                    updateRound(i, { comment: v });
                    if (v !== '') {
                      setPendingComments(prev => { const s = new Set(prev); s.delete(i); return s; });
                    }
                  }}
                  placeholder="Spoken at round start…"
                  placeholderTextColor={COLORS.dimText}
                  multiline={false}
                  autoFocus={pendingComments.has(i) && round.comment === ''}
                />
                <TouchableOpacity
                  onPress={() => {
                    updateRound(i, { comment: '' });
                    setPendingComments(prev => { const s = new Set(prev); s.delete(i); return s; });
                  }}
                  style={styles.rowDelBtn}
                >
                  <Text style={styles.rowDelX}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── + Add button ── */}
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddMenu(i)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>

          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add menu popup */}
      {addMenu !== null && (
        <AddMenu
          afterIdx={addMenu}
          isLast={addMenu === rounds.length - 1}
          totalRounds={rounds.length}
          onAddBreak={() => handleAddBreak(addMenu)}
          onAddComment={() => handleAddComment(addMenu)}
          onEndTournament={() => handleEndTournament(addMenu)}
          onAddRound={handleAddRound}
          onClose={() => setAddMenu(null)}
        />
      )}

      {/* Blind Wizard modal */}
      {showWizard && (
        <BlindWizardModal onApply={applyWizard} onClose={() => setShowWizard(false)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  headerTitle: { color: COLORS.primaryText, fontSize: 13, letterSpacing: 2 },
  saveBtn:     { color: COLORS.labelText, fontSize: 12, letterSpacing: 1.5 },

  tabs:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tab:         { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: COLORS.timerText },
  tabText:     { color: COLORS.dimText, fontSize: 11, letterSpacing: 1.5 },

  nameRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  nameInput:     { flex: 1, backgroundColor: COLORS.surfaceAlt, color: COLORS.primaryText, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  actionBtn:     { borderWidth: 1, borderColor: COLORS.timerText + '66', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  actionBtnText: { color: COLORS.timerText, fontSize: 11, letterSpacing: 1 },

  colHeaders: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: COLORS.surface },
  ch:         { color: COLORS.dimText, fontSize: 9, letterSpacing: 1.5, textAlign: 'center' },

  roundRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3 },
  roundRowOdd: { backgroundColor: COLORS.surface + '66' },
  levelNum:    { color: COLORS.dimText, fontSize: 11, textAlign: 'center' },
  cellInput:   { backgroundColor: COLORS.surfaceAlt, color: COLORS.blindText, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 5, fontSize: 13, textAlign: 'center', marginHorizontal: 2 },
  deleteX:     { color: COLORS.danger, fontSize: 18, fontWeight: '300' },

  breakRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 5, backgroundColor: COLORS.breakText + '11' },
  breakIcon:  { fontSize: 14 },
  breakLabel: { color: COLORS.breakText, fontSize: 10, letterSpacing: 1.5, flex: 1 },
  breakInput: { backgroundColor: COLORS.surfaceAlt, color: COLORS.breakText, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, textAlign: 'center', width: 52 },
  breakUnit:  { color: COLORS.breakText, fontSize: 11 },

  commentRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 5, backgroundColor: COLORS.timerText + '0D' },
  commentIcon:  { fontSize: 14 },
  commentInput: { flex: 1, backgroundColor: COLORS.surfaceAlt, color: COLORS.primaryText, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13 },

  rowDelBtn: { padding: 4 },
  rowDelX:   { color: COLORS.dimText, fontSize: 18, fontWeight: '300' },

  addBtn:     { alignItems: 'center', paddingVertical: 3 },
  addBtnText: { color: COLORS.dimText, fontSize: 18, lineHeight: 22 },
});
