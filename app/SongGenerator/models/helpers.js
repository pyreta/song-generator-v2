import _ from 'lodash';
// import { NOTES } from './constants';
import { nonbijective_vl, bijective_vl } from './voiceLeading';
import { notes } from '../constants/theory';

// const isString = x => typeof x === 'string';
// export const shift = (arr, n) => [...arr.slice(n), ...arr.slice(0, n)];
// export const getNoteNum = (root = 0) => {
//   if (isString(root)) {
//     return NOTES.indexOf(root.toUpperCase());
//   } else {
//     return root;
//   }
// };

const ascending = (a, b) => a - b;

export const getVoicing = (chord, { withRoot } = {}) => {
  const voicing = chord.get('voicing');
  const noteValues = chord.noteValues();
  const voicedValues = _.flatten(
    Object.keys(voicing)
      .sort(ascending)
      .map((voicingIdx, idx) => {
        const noteValue = noteValues[idx];
        const noteVoicings = voicing[voicingIdx];
        return noteVoicings.map(singleVoicing => {
          const octaveAdjustment =
            chord.get('octave') * 12 + singleVoicing * 12;
          return noteValue + octaveAdjustment;
        });
      }),
  ).sort(ascending);
  const adjustedVoiceValues = withRoot
    ? [chord.root().value() + 12 * withRoot, ...voicedValues]
    : voicedValues;
  return {
    noteNames: () => adjustedVoiceValues.map(n => notes[n % 12]),
    noteValues: () => adjustedVoiceValues,
  };
};

export const convertNotesToVoicing = (chord, voice) => {
  const noteValues = chord.noteValues();
  const moddedNotes = noteValues.map(x => x % 12);
  const intervals = Object.keys(chord.get('notes'));
  const newVoice = intervals.reduce((acc, n) => {
    return { ...acc, [n]: [] };
  }, {});

  const intervalsInOrder = voice.map((note, idx) => {
    const val = note % 12;
    const valIdx = moddedNotes.indexOf(val);
    return intervals[valIdx];
  });
  const voiceOctaveRemoved = voice.map(
    n => n - 12 * chord.get('octave') - chord.root().value(),
  );
  const octavesRepresented = voiceOctaveRemoved.map((n, i) => {
    const currentInterval = intervalsInOrder[i];
    return currentInterval > 7 ? Math.floor(n / 12) - 1 : Math.floor(n / 12);
  });
  intervalsInOrder.forEach((interval, idx) => {
    newVoice[interval].push(octavesRepresented[idx]);
  });
  return newVoice;
};

export const rotateVoice = (voicing, times) => {
  if (times === 0) return voicing;
  let [first, last] = [voicing[0], voicing[voicing.length - 1]];
  while (first <= last) first += 12;
  return rotateVoice([...voicing.slice(1), first], times - 1);
};

export const matchChordVoicings = {
  nonBijective: (chord, otherChord) => {
    const lastVoicing = otherChord.voicing().noteValues();
    const newVoice = nonbijective_vl(lastVoicing, chord.noteValues())[1].map(
      x => x[1] + otherChord.get('octave') * 12,
    );
    return chord.clone({ voicing: convertNotesToVoicing(chord, newVoice) });
  },

  bijective: (chord, otherChord) => {
    const lastVoicing = otherChord.voicing().noteValues();
    const bijective = bijective_vl(lastVoicing, chord.noteValues());
    let newVoice;
    if (bijective) {
      newVoice = bijective.map(diff => diff[0] + diff[1]);
    } else {
      newVoice = nonbijective_vl(lastVoicing, chord.noteValues())[1].map(
        x => x[1] + otherChord.get('octave') * 12,
      );
    }
    return chord.clone({ voicing: convertNotesToVoicing(chord, newVoice) });
  },

  louisMethod: (chord, otherChord) => {
    const newVoice = [];
    const lastVoicing = otherChord.voicing().noteValues();

    chord.noteValues().forEach(cNote => {
      let closestNote = cNote;
      let winner = { smallestDistance: 1000 };
      while (closestNote <= lastVoicing[lastVoicing.length - 1] + 12) {
        const distancesFromVoicing = chord.findDistance(
          lastVoicing,
          closestNote,
        );
        const smallestDistance = _.min(distancesFromVoicing);
        const smallestIdx = distancesFromVoicing.indexOf(smallestDistance);

        if (smallestDistance < winner.smallestDistance) {
          winner = { smallestIdx, smallestDistance, closestNote };
        }
        closestNote += 12;
      }
      newVoice.push(winner.closestNote);
    });

    return chord.clone({ voicing: convertNotesToVoicing(chord, newVoice) });
  },
};

export const matchOctaveToChord = (chord, otherChord) => {
  const chordValues = chord.voicing().noteValues();
  const otherChordValues = otherChord.voicing().noteValues();
  const diff = chordValues[0] - otherChordValues[0];
  if (diff > 12) {
    return chord.shiftOctave(-1);
  }
  if (diff < -12) {
    return chord.shiftOctave(1);
  }
  if (diff > 0) {
    return Math.abs(diff) < Math.abs(diff - 12) ? chord : chord.shiftOctave(-1);
  }
  if (diff < 0) {
    return Math.abs(diff) < Math.abs(diff - 12) ? chord : chord.shiftOctave(+1);
  }
  return chord;
};
