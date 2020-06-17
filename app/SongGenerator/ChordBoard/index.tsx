import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ChordModel from '../models/Chord';
import ChordChord from './Chord';
import RomanNumeral from './RomanNumeral';
import Progression from '../models/Progression';
import { chordColors } from '../theme';

const height = 140;

const Chord = styled.div`
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  color: white;
  user-select: none;
  color: black;
`;

const Chords = styled.div`
  display: flex;
`;

const Block = styled.div`
  display: flex;
  flex: 1;
  border: 1px solid white;
  height: ${height}px;
  flex-direction: column;
  margin: 10px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  height: ${height / 4}px;
`;

const Row2 = styled(Row)`
  height: ${height / 2}px;
`;

const Square = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Sqix = styled.div`
  border: 1px solid white;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  opacity: 0.3;
  &:hover {
    opacity: 1;
  }
`;

const Square2 = styled(Square)`
  border: 1px solid white;
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.9);
  &:hover {
    transform: scale(1);
    color: black;
  }
`;

const ScaleWrapper = styled.div`
  overflow-y: auto;
  height: 90vh;
`;

const Chordd = ({ chord }) => (
  <Block>
    <Row>
      <Sqix style={{ background: chordColors[chord.secondaryDominant().root().value() % 12] }}>
        {chord.secondaryDominant().name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.fourthMinorSubstitution().root().value() % 12] }}>
        {chord.fourthMinorSubstitution().name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.chromaticSubstitution()[0].root().value() % 12] }}>
        {chord.chromaticSubstitution()[0].name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.tritoneSubstitution().root().value() % 12] }}>
        {chord.tritoneSubstitution().name()}
      </Sqix>
    </Row>
    <Row2>
      <Square>
        <Sqix style={{ background: chordColors[chord.makeDominantFifth().root().value() % 12] }}>
          {chord.makeDominantFifth().name()}
        </Sqix>
        <Sqix style={{ background: chordColors[chord.incrementKey(-1).root().value() % 12] }}>
          {chord.incrementKey(-1).name()}
        </Sqix>
      </Square>
      <Square2 style={{ background: chordColors[chord.root().value() % 12] }}>
        <RomanNumeral
          {...chord.romanNumeralAnalysis()}
          />
        {chord.name()}
      </Square2>
      <Square>
        <Sqix style={{ background: chordColors[chord.chromaticMediants()[0].root().value() % 12] }}>
          {chord.chromaticMediants()[0].name()}
        </Sqix>
        <Sqix style={{ background: chordColors[chord.chromaticMediants()[1].root().value() % 12] }}>
          {chord.chromaticMediants()[1].name()}
        </Sqix>
      </Square>
    </Row2>
    <Row>
      <Sqix style={{ background: chordColors[chord.chromaticMediants()[0].root().value() % 12] }}>
        {chord.chromaticMediants()[0].name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.chromaticMediants()[1].root().value() % 12] }}>
        {chord.chromaticMediants()[1].name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.chromaticMediants()[2].root().value() % 12] }}>
        {chord.chromaticMediants()[2].name()}
      </Sqix>
      <Sqix style={{ background: chordColors[chord.chromaticMediants()[3].root().value() % 12] }}>
        {chord.chromaticMediants()[3].name()}
      </Sqix>
    </Row>
  </Block>
);

const Mode = ({ chords, onNotesDown, onNotesUp }) => {
  return (
    <>
      {chords[0].getMode().name()}
      <Chords>
        {chords.map((c, i) => (
          <ChordChord key={`${i + 1}`} chord={c}
            onNotesDown={onNotesDown}
            onNotesUp={onNotesUp}
          />
        ))}
      </Chords>
    </>
  );
};

const ChordBoard = ({ chords, onNotesDown, onNotesUp }) => {
  return (
    <>
      <Chords>
        {chords.map((c, i) => {
          const chord = ChordModel.wrap(c);
          return (
            <Chord
              key={`${i + 1}`}
              style={{
                background: chordColors[chord.root().value() % 12],
                flex: c.length,
              }}
            >
              {chord.name()}
            </Chord>
          );
        })}
      </Chords>
      <ScaleWrapper>
        {[1, 2, 3, 6].map(mode => {
          const progression = Progression.allChords({
            mode,
            key: 6,
            octave: 2,
            scale: 'major',
          });
          return (
            <Mode
              key={mode}
              chords={progression.chords()}
              onNotesDown={onNotesDown}
              onNotesUp={onNotesUp}
            />
          );
        })}
      </ScaleWrapper>
    </>
  );
};
//
// const ChordBoard = ({ chords, onNotesDown, onNotesUp }) => {
//   return (
//     <>
//       <Chords>
//         {chords.map((c, i) => {
//           const chord = ChordModel.wrap(c);
//           return (
//             <Chord
//               key={`${i + 1}`}
//               style={{
//                 background: chordColors[chord.root().value() % 12],
//                 flex: c.length,
//               }}
//             >
//               {chord.name()}
//             </Chord>
//           );
//         })}
//       </Chords>
//       <ScaleWrapper>
//         {[1, 2, 3, 6].map(mode => {
//           const progression = Progression.allChords({
//             mode,
//             key: 6,
//             scale: 'major',
//           });
//           return <Mode key={mode} chords={progression.chords()} />;
//         })}
//       </ScaleWrapper>
//     </>
//   );
// };

ChordBoard.propTypes = {
  chords: PropTypes.array.isRequired, // eslint-disable-line
  onNotesDown: PropTypes.func.isRequired, // eslint-disable-line
  onNotesUp: PropTypes.func.isRequired, // eslint-disable-line
};

export default ChordBoard;
