export const intervalTypes = [
  { 0: 'root' },
  { 2: 'minor' },
  { 2: 'major' },
  { 3: 'minor' },
  { 3: 'major' },
  { 4: 'perfect' },
  { 5: 'flat', 4: 'sharp' },
  { 5: 'perfect' },
  { 5: 'sharp' },
  { 7: 'diminished', 6: 'major' },
  { 7: 'minor' },
  { 7: 'major' },
  { 8: 'octave' },
  { 9: 'flat' },
  { 9: 'perfect' },
  { 9: 'sharp' },
  { 11: 'flat' },
  { 11: 'perfect' },
  { 11: 'sharp' },
  { 5: 'perfectOctave' },
  { 13: 'flat' },
  { 13: 'perfect' },
  { 13: 'sharp' },
];

let idx = 0
export const intervals = intervalTypes.reduce((ints, intervalObject) => {
  const namesForThisInterval = Object.keys(intervalObject).reduce((smallInts, intKey) => {
    const key = `${intervalObject[intKey]}${intKey}`;
    return { ...smallInts, [key]: idx };
  }, {})
  idx++;
  return { ...ints, ...namesForThisInterval };
}, {})

export const romanNumerals = ['i','ii', 'iii', 'iv', 'v', 'vi', 'vii']
export const notes = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export const scales = {
  major: {
    name: 'Major',
    intervals: [2, 2, 1, 2, 2, 2, 1],
    modes: [
      'Major',
      'Dorian',
      'Phrygian',
      'Lydian',
      'Mixolydian',
      'Minor',
      'Locrian'
    ],
  },
  minor: {
    name: 'Minor',
    intervals: [2, 1, 2, 2, 1, 2, 2],
    modes: [
      'Minor',
      'Locrian',
      'Major',
      'Dorian',
      'Phrygian',
      'Lydian',
      'Mixolydian',
    ],
  },
  harmonicMinor: {
    name: 'Harmonic Minor',
    intervals: [2, 1, 2, 2, 1, 3, 1],
    modes: [
      'Harmonic Minor',
      'Locrian #6',
      'Ionian Augmented',
      'Dorian #4',
      'Phrygian Dominant',
      'Lydian #2',
      'Superlocrian'
    ],
  },
  melodicMinor: {
    name: 'Melodic Minor',
    intervals: [2, 1, 2, 2, 2, 2, 1],
    modes: [
      'Melodic Minor',
      'Dorian b9',
      'Lydian Augmented',
      'Lydian Dominant',
      'Mixolydian b6',
      'Semilocrian',
      'Altered Scale'
    ],
  },
  harmonicMajor: {
    name: 'Harmonic Major',
    intervals: [2, 2, 1, 2, 1, 2, 1],
    modes: [
      'Harmonic Major',
      'Dorian b5',
      'Phrygian b4',
      'Lydian b3',
      'Mixolydian b9',
      'Aeolian b1',
      'Locrian b7'
    ],
  },
};

//iOMO = 0 semitones from root, Major, 0inversion
//i9m1 = 9 semitones from root, minor, 1st inversion

export const hooktheoryChordFunction = {
    '0M0': {
      '7M0': 0.252,
      '5M0': 0.182,
    },
}

export const chordFunction = {
  1: {
    major: {},
    minor: {},
    diminished: {},
    augmented: {},
  },
  2: {
    major: {},
    minor: {
      diminished7: true,
      major5: true,
    },
    diminished: {
      diminished7: true,
      major5: true,
    },
    augmented: {},
  },
  3: {
    major: {
      major4: true,
    },
    minor: {
      minor6: true,
      major4: true,
    },
    diminished: {
      major4: true,
    },
    augmented: {},
  },
  4: {
    major: {
      minor2: true,
      diminished7: true,
      major5: true,
      major1: true,
      minor1: true,
    },
    minor: {
      diminished2: true,
      diminished7: true,
      major5: true,
    },
    diminished: {},
    augmented: {},
  },
  5: {
    major: {
      major1: true,
      minor1: true,
      major4inversion1: true,
      minor4inversion1: true,
      minor6: true,
      major6: true,
    },
    minor: {},
    diminished: {},
    augmented: {},
  },
  6: {
    major: {
      minor1inversion1: true,
      minor4: true,
      diminished2: true,
      diminished7: true,
      major5: true,
    },
    minor: {
      major1inversion1: true,
      major4: true,
      minor3: true,
      minor2: true,
      diminished7: true,
      major5: true,
    },
    diminished: {},
    augmented: {},
  },
  7: {
    major: {},
    minor: {},
    diminished: {
      major5: true,
      major1: true,
      minor1: true,
    },
    augmented: {},
  },
}
