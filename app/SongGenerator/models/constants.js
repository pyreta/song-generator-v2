export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const SCALES = ['Major', 'Minor', 'Harmonic Minor', 'Harmonic Major', 'Melodic Minor'];

export const intervals = {
  nullify: () => null,
  root: root => root,
  flatSecond: root => root + 1,
  second: root => root + 2,
  minorThird: root => root + 3,
  majorThird: root => root + 4,
  fourth: root => root + 5,
  flatFifth: root => root + 7,
  perfectFifth: root => root + 7,
  sharpFifth: root => root + 8,
  majorSixth: root => root + 9,
  minorSeventh: root => root + 10,
  majorSeventh: root => root + 11,
  octave: root => root + 12,
  flatNinth: root => root + 13,
  ninth: root => root + 14,
  sharpNinth: root => root + 15,
  flatEleventh: root => root + 16,
  eleventh: root => root + 17,
  sharpEleventh: root => root + 18,
  fifthOctave: root => root + 19,
  flatThirteenth: root => root + 20,
  thirteenth: root => root + 21,
  sharpThirteenth: root => root + 22
};
export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

export const MAJOR_SCALE_MAP = {
  1: intervals.root,
  2: intervals.second,
  3: intervals.majorThird,
  4: intervals.fourth,
  5: intervals.perfectFifth,
  6: intervals.majorSixth,
  7: intervals.majorSeventh
};

export const MAJOR_MODE_NAMES = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian'
];

export const HARMONIC_MINOR_MODE_NAMES = [
  'harmonic Minor',
  'locrian #6',
  'ionian #5',
  'dorian #4',
  'phrygian Dominant',
  'lydian #2',
  'alt Dominant bb7'
];;

export const HARMONIC_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 11];
