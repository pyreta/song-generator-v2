import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import WebMidi from 'webmidi';
import PianoRoll from './PianoRoll';
import Transport from './Transport';
import { trackData1, trackData2 } from './trackData';
import chordData from './chordData';
import { exportMidi, playMidi } from './helpers';
import Chord from './models/Chord';

const Wrapper = styled.div`
  max-height: 75vh;
  max-width: 90vw;
  height: 2000px;
  width: 1500px;
`;

const getNote = ([trackName, startTick, noteVal], tracks) => {
  return tracks[trackName].ticks[startTick][noteVal];
};

const setNote = (note, [trackName, startTick, noteVal], tracks) => {
  return {
    ...tracks,
    [trackName]: {
      ...tracks[trackName],
      ticks: {
        ...tracks[trackName].ticks,
        [startTick]: {
          ...tracks[trackName].ticks[startTick],
          [noteVal]: note
        }
      }
    }
  };
};

const SongGenerator = props => {
  const [bpm, setBpm] = useState(120);
  const [width, setWidth] = useState(2000);
  const [height, setHeight] = useState(400);
  const [trackInPianoRoll, setTrackInPianoRoll] = useState('trackData1');
  const [tracks, setTracks] = useState({ trackData1, trackData2 });
  const [chords, setChords] = useState(chordData);
  const [playheadLocation, setPlayheadLocation] = useState(0);
  const sizeRef = useRef();

  useEffect(() => {
    const handler = () => {
      const current = sizeRef.current;
      if (!current) return;
      const rect = current.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const updateNoteByPath = (path, data) => {
    const note = {
      ...tracks[trackInPianoRoll].ticks[path[0]][path[1]],
      ...data,
    };
    console.log(`note:`, note)
  };

  const highlightNote = (data) => {
    console.log(`data:`, data)
  };

  return (
    <>
      <Transport
        onPlay={() => playMidi(Object.values(tracks), bpm, trackInPianoRoll, highlightNote)}
        onExport={() => exportMidi(Object.values(tracks))}
        setBpm={setBpm}
        bpm={bpm}
      />
      <div>{tracks[trackInPianoRoll].name}</div>
      <div>
        {Object.keys(tracks).map(t => (
          <button
            key={t}
            onClick={() => setTrackInPianoRoll(t)}
            style={{ background: trackInPianoRoll === t ? 'red' : 'white' }}
          >
            {tracks[t].name}
          </button>
        ))}
      </div>
      <Wrapper ref={sizeRef}>
        <PianoRoll
          width={width}
          height={height}
          canvasWidthMultiple={2}
          canvasHeightMultiple={2}
          octaves={7}
          columns={64}
          columnsPerQuarterNote={1}
          playheadLocation={playheadLocation}
          setPlayheadLocation={setPlayheadLocation}
          updateNoteByPath={updateNoteByPath}
          notes={tracks[trackInPianoRoll].ticks}
          chords={chords.map(c => Chord.wrap(c).pianoRollData())}
          onNotesChange={ticks => {
            setTracks({
              ...tracks,
              [trackInPianoRoll]: {
                ...tracks[trackInPianoRoll],
                ticks,
              },
            });
          }}
          onDeviceChange={outputDevice => {
            setTracks({
              ...tracks,
              [trackInPianoRoll]: {
                ...tracks[trackInPianoRoll],
                outputDevice,
              },
            });
          }}
          onChordReorder={newIndeces =>
            setChords(newIndeces.map(i => chords[i]))
          }
          onChordResize={lengths =>
            setChords(lengths.map((length, i) => ({ ...chords[i], length })))
          }
          outputId={tracks[trackInPianoRoll].outputDevice}
          outputOptions={WebMidi.outputs.map(o => ({ id: o.id, name: o.name }))}
        />
      </Wrapper>
    </>
  );
};

SongGenerator.propTypes = {};

export default SongGenerator;
