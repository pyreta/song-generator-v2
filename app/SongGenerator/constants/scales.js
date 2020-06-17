export const mapMajor = {
  to: {
    ionian: {},
    dorian: { 4: 3, 11: 10 },
    phrygian: { 2: 1, 4: 3, 9: 8, 11: 10 },
    lydian: { 5: 6 },
    mixolydian: { 11: 10 },
    aeolian: { 4: 3, 9: 8, 11: 10 },
    locrian: { 2: 1, 4: 3, 7: 6, 9: 8, 11: 10 },
    harmonicMinor: { 4: 3 },
    locrianSharp6: { 2: 1, 4: 3, 7: 6, 11: 10 },
    phrygianDominant: { 2: 1, 9: 8, 11: 10 },
    ionianSharp5: { 7: 8 },
  },
};

/*
C: 0, G: 7,
C#: 1, F#: 6,
D: 2, F: 5,
D#: 3, E: 4,
E: 4, D#: 3,
F: 5, D: 2,
F#: 6, C#: 1,
G: 7, C: 0,
G#: 8, B: 11,
A: 9, A#: 10,
A#: 10, A: 9,
B: 11, G#: 8,

*/

export const negativeMap = [7, 5, 3, 1, 11, 9, 7, 5, 3, 1, 11, 9];

export const intervalTypes = [
  'root',
  'minor',
  'major',
  'minor',
  'major',
  'perfect',
  'flat',
  'perfect',
  'sharp',
  'diminished',
  'minor',
  'major',
  'octave',
  'flat',
  'perfect',
  'sharp',
  'flat',
  'perfect',
  'sharp',
  'perfect',
  'flat',
  'perfect',
  'sharp',
];

export const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

const scales = {
  major: {
    name: 'Major',
    intervals: [2, 2, 1, 2, 2, 2, 1],
    modes: [
      'Ionian',
      'Dorian',
      'Phrygian',
      'Lydian',
      'Mixolydian',
      'Aeolian',
      'Locrian',
    ],
  },
  minor: {
    name: 'Minor',
    intervals: [2, 1, 2, 2, 1, 2, 2],
    modes: [
      'Aeolian',
      'Locrian',
      'Ionian',
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
      'Ionian #5',
      'Dorian #4',
      'Phrygian Dominant',
      'Lydian #2',
      'Alt Dominant bb7',
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
      'Superlocrian',
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
      'Locrian b7',
    ],
  },
};

export default scales;
