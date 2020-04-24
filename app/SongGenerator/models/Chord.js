import Scale from './Scale';
// import Progression from './Progression';
import chordProbabilities from './hookTheory/chordProbabilities';
import chordDictionary from '../constants/chordDictionary';
import {
  scales,
  intervalTypes,
  notes,
  intervals,
  romanNumerals,
  chordFunction,
} from '../constants/theory';
import {
  getVoicing,
  matchChordVoicings,
  matchOctaveToChord,
  rotateVoice,
  convertNotesToVoicing,
} from './helpers';

const ascending = (a, b) => a - b;
const defaultChord = {
  key: 0,
  octave: 5,
  scale: 'major',
  mode: 1,
  chord: 1,
  notes: { 1: 0, 3: 0, 5: 0 },
};

const pianoRollIntervalKeyMap = {
  1: 'root',
  3: 'third',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  9: 'ninth',
};

class Chord {
  static newChordFromScale(chord, scale, progression) {
    return new Chord({ scale, chord }, progression);
  }

  static fromMinorScale(chord, progression) {
    return Chord.newChordFromScale(chord, 'minor', progression);
  }

  static fromMajorScale(chord, progression) {
    return Chord.newChordFromScale(chord, 'major', progression);
  }

  static wrap(...args) {
    return new Chord(...args);
  }

  static fromRoot(key) {
    return new Chord({ key });
  }

  constructor(chord = {}, progression) {
    // TODO what if only a progression is passed into constuctor?
    this.chord = { ...defaultChord, ...chord };
    const voicing = Object.keys(this.chord.notes).reduce(
      (acc, n) => ({ ...acc, [n]: [0] }),
      {},
    );
    this.chord.voicing = this.chord.voicing || voicing;
    // this.progression = progression || new Progression([chord]);
    this.progression = progression;
  }

  clone(attrs = {}) {
    return new Chord({ ...this.chord, ...attrs }, this.progression);
  }

  resetVoicing(attrs = {}) {
    const voicing = Object.keys(this.chord.notes).reduce(
      (acc, n) => ({ ...acc, [n]: [0] }),
      {},
    );
    return this.clone({ ...attrs, voicing });
  }

  // *************** change chord

  sus(i1 = 4, i2) {
    const sus = this.removeNote(3).addNote(i1);
    return i2 ? sus.addNote(i2) : sus;
  }

  secondaryDominant() {
    return new Chord(
      { key: this.root().value(), chord: 5 },
      this.progression,
    ).addNote(7);
  }

  secondary(chord = 0, chordOptions) {
    if (chord) {
      return new Chord(
        {
          notes: this.get('notes'),
          ...chordOptions,
          key: this.root().value(),
          chord,
        },
        this.progression,
      );
    }
    return this;
  }

  tritoneSubstitution() {
    // TODO take scales into account
    const newNotes = { 1: 0, 3: 0, 5: 0, 7: 0 };
    return this.set('key', this.get('key') + 6).setNotes(newNotes);
  }

  diminishedSubstitution() {
    // TODO take scales into account
    const newNotes = { 1: 0, 3: -1, 5: -1, 7: -1 };
    return this.set('key', this.get('key') + 4).setNotes(newNotes);
  }

  incrementKey(add = 1) {
    return new Chord(
      { ...this.chord, key: this.get('key') + add },
      this.progression,
    );
  }

  chromaticSubstitution() {
    return [this.makeDominantFifth().incrementKey(), this.clone()];
  }

  chromaticMediants() {
    return [
      this.incrementKey(-4),
      this.incrementKey(-3),
      this.incrementKey(3),
      this.incrementKey(4),
    ];
  }

  conjugateMinorSubstitution() {
    // TODO do!
    return this;
  }

  twoFiveSubstitution() {
    return [
      this.makeDominantFifth()
        .set('chord', 2)
        .resetNotes(),
      this.clone(),
    ];
  }

  resetNotes() {
    return this.setNotes({ 1: 0, 3: 0, 5: 0 });
  }

  fourthMinorSubstitution() {
    return this.makeDominantFifth()
      .set('chord', 4)
      .set('scale', 'minor')
      .set('mode', 1)
      .resetNotes();
  }

  makeDominantFifth() {
    const root = this.root().value() + 5;
    return Chord.fromRoot(root)
      .set('chord', 5)
      .addNote(7);
  }

  // ****************** change chord

  setNotes(newNotes) {
    return new Chord({ ...this.chord, notes: newNotes }, this.progression);
  }

  addNote(interval, value = 0) {
    const chord = this.clone({
      notes: { ...this.chord.notes, [interval]: value },
      voicing: { ...this.get('voicing'), [interval]: [0] },
    });
    return interval > 7 ? chord.addNote(7) : chord;
  }

  removeNote(interval) {
    const newNotes = { ...this.get('notes') };
    delete newNotes[interval];
    return this.setNotes(newNotes);
  }

  get(attr) {
    return this.chord[attr];
  }

  set(attr, value) {
    return this.clone({ [attr]: value });
    // return new Chord({ ...this.chord, [attr]: value }, this.progression);
  }

  getScale() {
    // const chordReference = this;
    return new Scale(scales[this.chord.scale], this);
  }

  getMode() {
    // const chordReference = this;
    return this.getScale().getMode(this.chord.mode, this);
  }

  getNoteFromInterval(i, n) {
    const root = this.root().value();
    const interval = intervals[i];
    const intervalAdjustment = this.get('notes')[n];
    const mod = notes.length * 2;
    return root + interval + (intervalAdjustment % mod);
  }

  getDiatonicNote(n) {
    const extendedIntervals = this.getMode().intervalsFromRoot({ octaves: 2 });
    const intervalIdx = n + this.get('chord') - 2;
    const key = this.get('key');
    const interval = extendedIntervals[intervalIdx];
    const intervalAdjustment = this.get('notes')[n];
    const mod = notes.length * 2;
    return interval + intervalAdjustment + (key % mod);
  }

  noteValues() {
    return Object.keys(this.get('notes')).reduce((acc, n) => {
      const note = parseInt(n, 10);
      let newNote;
      if (note === 2) newNote = this.getNoteFromInterval('major2', note);
      if (note === 4) newNote = this.getNoteFromInterval('perfect4', note);
      if (note === 6) newNote = this.getNoteFromInterval('major6', note);
      if (note === 9) newNote = this.getNoteFromInterval('perfect9', note);
      if (note === 11) newNote = this.getNoteFromInterval('perfect11', note);
      if (note === 13) newNote = this.getNoteFromInterval('perfect13', note);
      if (!newNote) newNote = this.getDiatonicNote(note);
      return [...acc, newNote];
    }, []);
  }

  noteNames() {
    return this.noteValues().map(i => notes[i % 12]);
  }

  root() {
    const noteIdx = this.get('chord') - 1;
    const ints = this.getMode().intervalsFromRoot();
    const value = this.chord.key + ints[noteIdx];
    const name = notes[value % 12];
    return {
      name: () => name,
      value: () => value,
    };
  }

  key() {
    return {
      name: () => notes[this.chord.key % 12],
      value: () => this.chord.key % 12,
    };
  }

  analyze() {
    const analysis = {};
    const ints = Object.keys(this.chord.notes)
      .map(i => {
        return parseInt(i, 10);
      })
      .sort(ascending)
      .slice(1);
    const intervalValues = this.noteValues()
      .map(i => i - this.root().value())
      .sort(ascending)
      .slice(1);
    ints.forEach((int, idx) => {
      analysis[int] = intervalTypes[intervalValues[idx]][int];
    });
    return analysis;
  }

  signature() {
    const analysis = this.analyze();
    return Object.keys(analysis)
      .map(i => parseInt(i, 10))
      .sort(ascending)
      .reduce((signature, interval) => {
        return signature + analysis[interval] + interval;
      }, '');
  }

  isValid() {
    const sig = this.signature();
    const validity = !!chordDictionary[sig];
    if (validity) return validity;
    return false;
    // console.log('missing:', sig);
    // console.log('');
  }

  name({ format = 'abreviation', showInversion = true } = {}) {
    const sig = this.signature();
    const inversion = this.inversion();
    if (chordDictionary[sig]) {
      const extension = chordDictionary[sig][format];
      const inv =
        inversion > 0 && showInversion ? `/${this.noteNames()[inversion]}` : '';
      return this.root().name() + extension + inv;
    }
    return `Unknown Chord: ${sig}`;
  }

  unwrap() {
    return this.chord;
  }

  isMajor() {
    const [first, third] = this.noteValues();
    return third - first > 3;
  }

  triadType() {
    const [first, third, fifth] = this.noteValues();
    if (fifth - first === 6) return 'diminished';
    if (fifth - first === 8) return 'augmented';
    if (third - first === 3) return 'minor';
    if (third - first === 4) return 'major';
    return 'unknown';
  }

  chordDefinition() {
    return chordDictionary[this.signature()];
  }

  romanNumeral() {
    const def = this.chordDefinition();
    if (def) {
      const numeral = romanNumerals[this.get('chord') - 1];
      return def.getRomanNumeral(
        this.isMajor() ? numeral.toUpperCase() : numeral,
      );
    }
    return '';
  }
  //
  // romanNumeral() {
  //   const numeral = romanNumerals[this.get('chord') - 1];
  //   return this.chordDefinition().getRomanNumeral(
  //     this.isMajor() ? numeral.toUpperCase() : numeral,
  //   );
  // }

  inversion() {
    const bassNote = this.voicing().noteNames()[0];
    return this.noteNames().indexOf(bassNote);
  }

  romanNumeralAnalysis() {
    const numeral = romanNumerals[this.get('chord') - 1];
    return this.chordDefinition().romanNumeralAnalysis(
      numeral,
      this.inversion(),
    );
  }

  voicing(options) {
    return getVoicing(this, options);
  }

  findDistance(lastVoicing, closestNote) {
    return lastVoicing.map(x => Math.abs(x - closestNote));
  }

  matchVoicingToChord({ lastPlayedChord, method = 'louisMethod' }) {
    const lowestChord = lastPlayedChord
      .resetVoicing({ chord: 6 })
      .shiftOctave(-1);
    const highestChord = lastPlayedChord.resetVoicing({ chord: 7 });
    const c = matchChordVoicings[method](this, lastPlayedChord);
    const firstNote = c.voicing().noteValues()[0];

    if (firstNote < lowestChord.voicing().noteValues()[0]) {
      return matchChordVoicings[method](this, lowestChord);
    }
    if (firstNote > highestChord.voicing().noteValues()[0]) {
      return matchChordVoicings[method](this, highestChord);
    }
    return c;
  }

  matchOctaveToChord(otherChord) {
    return matchOctaveToChord(this, otherChord);
  }

  setInversion(n) {
    const vals = this.voicing().noteValues();
    const resetVoice = rotateVoice(vals, vals.length - this.inversion()).map(
      notee => notee - 12,
    );
    const newV = rotateVoice(resetVoice, n % vals.length);
    return this.clone({ voicing: convertNotesToVoicing(this, newV) });
  }

  shiftOctave(diff) {
    const v = this.get('voicing');
    const voicing = Object.keys(v).reduce((acc, i) => {
      return { ...acc, [i]: v[i].map(n => n + diff) };
    }, {});
    return this.clone({ voicing });
  }

  get decorate() {
    const v = this.get('voicing');
    const vg = this.voicing().noteValues();
    const newV = [vg[0] - 24, ...vg];
    return {
      identity: () => this,
      bassNote: () =>
        this.clone({ voicing: convertNotesToVoicing(this, newV) }),
      rootNote: () => {
        const chordWithRoot = this.clone({
          voicing: { ...v, 1: [v[1][0] - 2, ...v[1]] },
        });
        chordWithRoot.decorator = 'rootNote';
        return chordWithRoot;
      },
    };
  }

  nextChords() {
    const chordNumber = this.get('chord');
    return chordFunction[chordNumber][this.triadType()];
  }

  isGoodNextChord(nextChord) {
    let inv = '';
    const nextChords = this.nextChords();
    // TODO fix prediction for sus chords
    if (!nextChords) return false;
    const nextInv = nextChord.inversion();
    const nextTriadType = nextChord.triadType();
    if (nextInv && !nextChord.decorator) inv = `inversion${nextInv}`;
    const chordId = `${nextTriadType}${nextChord.get('chord')}${inv}`;
    if (nextTriadType === 'unknown') return false;
    // return false;
    return !!this.nextChords()[chordId];
  }

  type() {
    const [first, third, fifth, seventh = 100] = this.noteValues();
    const thirdI = third - first;
    const seventhI = seventh - first;
    const fifthI = fifth - first;

    if (fifthI === 7) {
      if (thirdI === 4) {
        if (seventhI === 10) return 'D';
        if (seventhI === 11) return 'M7';
        if (seventhI > 50) return 'M';
      }
      if (thirdI === 3) {
        if (seventhI === 10) return 'm7';
        if (seventhI > 50) return 'm';
      }
    }

    if (fifthI === 6) {
      if (thirdI === 3 && seventhI === 10) return 'hd';
      if (thirdI === 3) return 'd';
    }

    return 'unknown';
  }

  id({ chord = this, showInversion } = {}) {
    const type = this.type();
    if (type === 'unknown') return type;
    let interval = (this.noteValues()[0] % 12) - chord.get('key');
    if (interval < 0) interval += 12;
    const inversion = showInversion ? this.inversion() : 0;
    return `${interval}${this.type()}${inversion}`;
  }

  nextChordProbability(nextChord, { showInversion } = {}) {
    const [thisId, nextId] = [
      this.id({ showInversion }),
      nextChord.id({ chord: this, showInversion }),
    ];
    if (
      thisId === 'unknown' ||
      nextId === 'unknown' ||
      !chordProbabilities[thisId] ||
      !chordProbabilities[thisId][nextId]
    )
      return 0;
    return chordProbabilities[thisId][nextId];
  }

  equals(otherChord) {
    return this.voicing().signature() === otherChord.voicing().signature();
  }

  pianoRollData(otherAttrs = {}) {
    const chordIdxs = this.noteValues().map(x => x % 12);
    const scale = this.getMode()
      .intervalsFromRoot()
      .reduce((acc, idx) => {
        acc[idx] = chordIdxs.includes(idx) ? 'chord' : 'scale';
        return acc;
      }, Array(12).fill(null));

    const chordIntervals = Object.keys(this.get('notes')).sort();
    chordIntervals.forEach((interval, i) => {
      scale[chordIdxs[i] % 12] = pianoRollIntervalKeyMap[interval] || 'chord';
    });

    const noteValues = this.noteValues();

    return {
      name: this.name({ format: 'name' }),
      abreviation: this.name(),
      noteValues: [noteValues[0] + 36, ...noteValues.map(x => x + 60)],
      scale,
      root: chordIdxs[0],
      key: this.get('key'),
      romanNumeral: this.romanNumeral(),
      ...otherAttrs,
    };
  }
}

export default Chord;
