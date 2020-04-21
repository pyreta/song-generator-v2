import { intervals, NOTES } from './constants';

const keys = obj => Object.keys(obj);

const chordMaps = {
  root: {
    1: intervals.root
  },
  major: {
    1: intervals.root,
    3: intervals.majorThird,
    5: intervals.perfectFifth
  },
  minor: {
    1: intervals.root,
    3: intervals.minorThird,
    5: intervals.perfectFifth
  }
};

class ChordMap {
  static wrap(chordMap) {
    return new ChordMap(chordMap);
  }

  static get maps() {
    return chordMaps;
  }

  static major() {
    return ChordMap.wrap(this.maps.major);
  }

  static minor() {
    return ChordMap.wrap(this.maps.minor);
  }

  constructor(chordMap) {
    this.chordMap = chordMap;
  }

  minor() {
    return ChordMap.wrap({ ...this.chordMap, 3: intervals.minorThird });
  }

  map(f) {
    return new ChordMap(f(this.chordMap));
  }

  unwrap() {
    return this.chordMap;
  }

  updateIntervals(newMap) {
    return ChordMap.wrap({ ...this.chordMap, ...newMap });
  }

  getChord(root = 0) {
    return keys(this.chordMap).reduce(
      (noteObj, note) => ({
        ...noteObj,
        [note]: this.chordMap[note](root)
      }),
      {}
    );
  }

  noteNumbers(root = 0) {
    const chord = this.getChord(root);
    return keys(chord)
      .sort()
      .map(k => chord[k]);
  }

  notes(root = 0) {
    return this.noteNumbers(root).map(n => NOTES[n % NOTES.length]);
  }
}

export default ChordMap;
