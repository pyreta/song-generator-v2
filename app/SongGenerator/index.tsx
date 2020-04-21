import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import WebMidi from 'webmidi';
import PianoRoll from './PianoRoll';
import Transport from './Transport';
import { trackData1, trackData2 } from './trackData';
import chordData from './chordData';
import { exportMidi, playMidi } from './helpers';

const Wrapper = styled.div`
  max-height: 75vh;
  max-width: 75vw;
  height: 2000px;
  width: 1500px;
`;

const SongGenerator = props => {
  const [bpm, setBpm] = useState(120);
  const [width, setWidth] = useState(2000);
  const [height, setHeight] = useState(400);
  const [notes, setNotes] = useState(trackData1.ticks);
  const [chords, setChords] = useState(chordData);
  const [outputId, setOutputId] = useState(trackData1.outputDevice);
  const sizeRef = useRef();
  const tracks = [{ outputDevice: outputId, name: 'Willy', ticks: notes }];
  const outputDevice = WebMidi.outputs.filter(o => o.id === outputId)[0];
  // const tracks = [trackData1, trackData2];

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

  return (
    <>
      <Transport
        onPlay={() => playMidi(tracks, bpm)}
        onExport={() => exportMidi(tracks)}
        setBpm={setBpm}
        bpm={bpm}
      />
      <Wrapper ref={sizeRef}>
        <PianoRoll
          width={width}
          height={height}
          canvasWidthMultiple={2}
          canvasHeightMultiple={2}
          octaves={7}
          columns={128}
          columnsPerQuarterNote={1}
          notes={notes}
          chords={chords}
          onNotesChange={setNotes}
          onDeviceChange={setOutputId}
          onPianoKeyDown={note =>
            outputDevice.playNote([note], 1, { velocity: 0.5 })
          }
          onPianoKeyUp={note => outputDevice.stopNote([note], 1)}
          outputId={outputId}
          outputOptions={WebMidi.outputs.map(o => ({ id: o.id, name: o.name }))}
        />
      </Wrapper>
    </>
  );
};

SongGenerator.propTypes = {};

export default SongGenerator;
