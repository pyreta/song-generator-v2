import { notes } from '../constants';

// scale = {
//     name: 'Major',
//     modes: majorModes,
//     intervals: [0, 2, 4, 5, 7, 9, 11]
//   },

class Mode {
  constructor(number, chord) {
    this.number = number;
    this.chord = chord;
  }

  name() {
    return this.chord.getScale().get('modes')[this.number - 1];
  }

  getScale() {
    return this.chord.getScale();
  }

  intervalsFromRoot({ octaves = 1 } = {}) {
    const ints = this.intervals();
    const intervals = ints
      .reduce(
        (acc, interval) => {
          return [...acc, acc[acc.length - 1] + interval];
        },
        [0],
      )
      .slice(0, 7);

    const addedOctaves = [...Array(octaves).keys()]
      .slice(1)
      .reduce((acc, oct) => [...acc, ...intervals.map(n => n + 12 * oct)], []);

    return [...intervals, ...addedOctaves];
  }

  intervals() {
    const scaleIntervals = this.getScale().intervals();
    const sliceIdx = (this.number % 12) - 1;
    const left = scaleIntervals.slice(0, sliceIdx);
    const right = scaleIntervals.slice(sliceIdx);
    return [...right, ...left];
  }

  isMajor() {
    const [i1, i2] = this.intervals();
    return i1 + i2 === 4;
  }

  notes() {
    return this.intervals().map(i => notes[(i + this.chord.get('key')) % 12]);
  }
}

export default Mode;
