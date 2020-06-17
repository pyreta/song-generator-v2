import React from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import RomanNumeral from './RomanNumeral';
import { chordColors } from '../theme';

const height = 270;
// const height = 180;

const Block = styled.div`
  display: flex;
  width: 300px;
  border: 1px solid white;
  height: ${height}px;
  flex-direction: column;
  margin: 10px;
  cursor: pointer;
  margin-top: 20px;
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

const ChordContainer = styled.div`
  border: 1px solid white;
  margin: 10px;
  cursor: pointer;
  display: inline-block;
`;

const OPTION_SIZE = 40;

const ChordOptionWrapper = styled.div`
  border: 1px solid white;
  height: ${OPTION_SIZE}px;
  width: ${OPTION_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  opacity: 0.3;
  &:hover {
    opacity: 1;
  }
`;


const MainChord = styled.div`
  border: 1px solid white;
  height: ${OPTION_SIZE * 2 + 2}px;
  width: ${OPTION_SIZE * 2 + 2}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transform: scale(0.9);
  &:hover {
    transform: scale(1);
    color: black;
  }
`;

const HorizontalRow = styled.div`
  display: flex;
`;

const ChordOption = ({ chord, onNotesDown, onNotesUp, mainChord }) =>
  <ChordOptionWrapper
    style={{ background: chordColors[chord.root().value() % 12] }}
    onMouseDown={() => onNotesDown(chord.voicing().noteValues())}
    onMouseUp={() => onNotesUp(chord.voicing().noteValues())}
  >
    {chord.name()}
  </ChordOptionWrapper>

const Chordd = ({ chord, onNotesDown, onNotesUp }) => {
  const options = chord.chordOptions();
  console.log(`options[0].noteValues():`, options[0].noteValues())
  return (
    <div style={{ paddingTop: 20 }}>
      <ChordContainer>

        <HorizontalRow>
          {[0,1,2,3,4,5].map(idx => (
              <ChordOption
                key={idx}
                chord={options[idx]}
                onNotesDown={onNotesDown}
                onNotesUp={onNotesUp}
              />
            ))}
        </HorizontalRow>

        <HorizontalRow>
          {[6, 7, 8, 9, 10, 11].map(idx => (
              <ChordOption
                key={idx}
                chord={options[idx]}
                onNotesDown={onNotesDown}
                onNotesUp={onNotesUp}
              />
            ))}
        </HorizontalRow>

        <HorizontalRow>
          <div>
            <HorizontalRow>
              {[12, 13].map(idx => (
                  <ChordOption
                    key={idx}
                    chord={options[idx]}
                    onNotesDown={onNotesDown}
                    onNotesUp={onNotesUp}
                  />
                ))}
            </HorizontalRow>
            <HorizontalRow>
              {[14, 15].map(idx => (
                  <ChordOption
                    key={idx}
                    chord={options[idx]}
                    onNotesDown={onNotesDown}
                    onNotesUp={onNotesUp}
                  />
                ))}
            </HorizontalRow>
          </div>

          <MainChord
            style={{ background: chordColors[chord.root().value() % 12] }}
            onMouseDown={() => onNotesDown(chord.voicing().noteValues())}
            onMouseUp={() => onNotesUp(chord.voicing().noteValues())}
          >
            <RomanNumeral
              {...chord.romanNumeralAnalysis()}
              />
            {chord.name()}
          </MainChord>

          <div>
          <HorizontalRow>
            {[16, 17].map(idx => (
                <ChordOption
                  key={idx}
                  chord={options[idx]}
                  onNotesDown={onNotesDown}
                  onNotesUp={onNotesUp}
                />
              ))}
          </HorizontalRow>
          <HorizontalRow>
            {[18, 19].map(idx => (
                <ChordOption
                  key={idx}
                  chord={options[idx]}
                  onNotesDown={onNotesDown}
                  onNotesUp={onNotesUp}
                />
              ))}
          </HorizontalRow>
          </div>
        </HorizontalRow>

        <HorizontalRow>
          {[0,1,2,3,4,5].map(idx => (
              <ChordOption
              key={idx}
                chord={options[idx]}
                onNotesDown={onNotesDown}
                onNotesUp={onNotesUp}
              />
            ))}
        </HorizontalRow>

        <HorizontalRow>
          {[6, 7, 8, 9, 10, 11].map(idx => (
              <ChordOption
                key={idx}
                chord={options[idx]}
                onNotesDown={onNotesDown}
                onNotesUp={onNotesUp}
              />
            ))}
        </HorizontalRow>
      </ChordContainer>
      <MainChord
        style={{ background: chordColors[chord.mirror().root().value() % 12] }}
        onMouseDown={() => onNotesDown(chord.mirror().voicing().noteValues())}
        onMouseUp={() => onNotesUp(chord.mirror().voicing().noteValues())}
      >
        <RomanNumeral
          {...chord.mirror().romanNumeralAnalysis()}
          />
        {chord.name()}
      </MainChord>
    </div>
  )
};

export default Chordd;
