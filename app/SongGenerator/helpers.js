import WebMidi from 'webmidi';
import MidiWriter from 'midi-writer-js';

// https://github.com/grimmdude/MidiWriterJS

const convertTicksToMs = (ticks, bpm) => {
  const milisecondsPerBeat = (60 / bpm) * 1000;
  const miliSecondsPerTick = milisecondsPerBeat / 128;
  const totalMiliseconds = ticks * miliSecondsPerTick;
  return totalMiliseconds;
};

const playMidiTrack = (trackObject, outputDevice, bpm, callback) => {
  Object.keys(trackObject.ticks).forEach((startTick, idx) => {
    const notes = trackObject.ticks[startTick];
    const start = convertTicksToMs(startTick, bpm);
    const isLastTick = Object.keys(trackObject.ticks).length - 1 === idx;
    Object.keys(notes).forEach((noteValue, idx2) => {
      const note = notes[noteValue];
      const noteVal = parseInt(noteValue, 10);
      const velocity = note.velocity / 100;
      const isLastNote = Object.keys(notes).length - 1 === idx2;
      setTimeout(() => {
        if (callback) callback({ startTick, noteVal, noteDown: note });
        outputDevice.playNote([noteVal], 1, { velocity });
        setTimeout(() => {
          if (callback) {
            callback({
              startTick,
              noteVal,
              complete: callback && isLastTick && isLastNote,
            });
          }
          outputDevice.stopNote([noteVal], 1);
        }, convertTicksToMs(note.length, bpm) - 5);
      }, start);
    });
  });
};

// export const playMidi = (tracks, bpm, callback) => {
//   const milisecondsPerBeat = (60 / bpm) * 1000;
//   const miliSecondsPerTick = milisecondsPerBeat / 128;
//   let tick = 0;
//   const outputs = WebMidi.outputs.reduce((acc, device) => {
//     return {
//       ...acc,
//       [device.id]: device,
//     };
//   });
//   const tickInterval = setInterval(() => {
//     if (tick % 20 === 0) callback(tick);
//     tracks.forEach(track => {
//       const outputDevice = outputs[track.outputDevice];
//       if (track.ticks[tick]) {
//         // console.log(`track.ticks[tick]:`, track.ticks[tick])
//         const notes = track.ticks[tick];
//         Object.keys(notes).forEach(noteValue => {
//           const note = notes[noteValue];
//           const noteVal = parseInt(noteValue, 10);
//           const velocity = note.velocity / 100;
//           outputDevice.playNote([noteVal], 1, { velocity });
//         });
//       }
//     });
//     tick += 1;
//     if (tick > 1024) clearInterval(tickInterval);
//   }, miliSecondsPerTick);
// };

export const playMidi = (tracks, bpm, trackId, callback) => {
  const outputs = WebMidi.outputs.reduce((acc, device) => {
    return {
      ...acc,
      [device.id]: device,
    };
  });
  tracks.forEach(track => {
    playMidiTrack(
      track,
      outputs[track.outputDevice],
      bpm,
      trackId === track.id && callback,
    );
  });
};

const formatTrackData = trackObject => {
  return Object.keys(trackObject.ticks).reduce((acc, startTick) => {
    const notes = trackObject.ticks[startTick];

    const noteEvents = Object.keys(notes).reduce((noteAcc, noteNum) => {
      const note = notes[noteNum];
      const noteData = {
        startTick: parseInt(startTick, 10),
        pitch: [parseInt(noteNum, 10)],
        duration: `t${note.length}`,
        velocity: note.velocity,
      };
      const noteEvent = new MidiWriter.NoteEvent(noteData);
      return [...noteAcc, noteEvent];
    }, []);

    return [...acc, ...noteEvents];
  }, []);
};

const getTrackFromData = trackObject => {
  const track = new MidiWriter.Track();
  track.addTrackName(trackObject.name);
  track.addEvent(formatTrackData(trackObject), (event, index) => {
    console.log(`event:`, event);
    console.log(`index:`, index);
    // return { sequential: true };
  });
  return track;
};

export const exportMidi = tracks => {
  const write = new MidiWriter.Writer(tracks.map(t => getTrackFromData(t)));
  write.saveMIDI(`midiFiles/multipleTracks-${Date.now()}`);
};
