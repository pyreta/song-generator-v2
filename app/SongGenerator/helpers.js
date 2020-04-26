import WebMidi from 'webmidi';
import MidiWriter from 'midi-writer-js';

// https://github.com/grimmdude/MidiWriterJS

const convertTicksToMs = (ticks, bpm) => {
  const milisecondsPerBeat = (60 / bpm) * 1000;
  const miliSecondsPerTick = milisecondsPerBeat / 128;
  const totalMiliseconds = ticks * miliSecondsPerTick;
  return totalMiliseconds;
};

const playMidiTrack = (trackObject, outputDevice, bpm) => {
  Object.keys(trackObject.ticks).forEach(startTick => {
    const notes = trackObject.ticks[startTick];
    const start = convertTicksToMs(startTick, bpm);
    Object.keys(notes).forEach(noteValue => {
      const note = notes[noteValue];
      const noteVal = parseInt(noteValue, 10);
      const velocity = note.velocity / 100;
      setTimeout(() => {
        outputDevice.playNote([noteVal], 1, { velocity });
        setTimeout(() => {
          outputDevice.stopNote([noteVal], 1);
        }, convertTicksToMs(note.length, bpm) - 5);
      }, start);
    });
  });
};

export const playMidi = (tracks, bpm) => {
  const outputs = WebMidi.outputs.reduce((acc, device) => {
    return {
      ...acc,
      [device.id]: device,
    };
  });
  tracks.forEach(track => {
    playMidiTrack(track, outputs[track.outputDevice], bpm);
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
