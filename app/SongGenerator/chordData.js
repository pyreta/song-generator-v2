import Chord from './models/Chord';

const chord1 = new Chord({
  key: 0,
  scale: 'major',
  mode: 2,
  chord: 2,
  notes: { 1: 0, 3: 0, 5: 0, 7: 0 },
});

const data1 = chord1.pianoRollData({ length: 1024 });

const data2 = new Chord({
  key: 0,
  scale: 'major',
  mode: 2,
  chord: 4,
  notes: { 1: 0, 3: 0, 5: 0, 7: 0, 9: 0 },
}).pianoRollData({ length: 512 });

const chordData = [
  data1,
  data2,
  new Chord({
    key: 4,
    scale: 'harmonicMinor',
    mode: 4,
    chord: 1,
    notes: { 1: 0, 3: 0, 5: 0, 7: 0 },
  }).pianoRollData({ length: 512 }),
  new Chord({
    key: 2,
    scale: 'minor',
    mode: 1,
    chord: 5,
    notes: { 1: 0, 2: 0, 5: -1, 7: 0 },
  }).pianoRollData({ length: 1024 }),
];

export default chordData;
