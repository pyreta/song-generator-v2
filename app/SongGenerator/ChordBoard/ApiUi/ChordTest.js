import React from 'react';
import ChordModel from '../../models/Chord';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-size: 19px;
  font-family: times;
  font-weight: bold;
  display: flex;
`;

const FiguredBass = styled.div`
  font-size: 11px;
  padding-left: 2px;
`;

const Num = styled.div`
  height: 9px
`;

const RomanNumeral = ({
  numeral,
  figuredBass,
  quality,
  invertedQuality
}) => (
    <Wrapper>
      { numeral }
      { figuredBass.length ? invertedQuality : quality }
      <FiguredBass>
        { figuredBass.map(i => <Num key={i}>{i}</Num>) }
      </FiguredBass>
    </Wrapper>
  )

export class ChordTest extends React.Component {
  render() {
    const chord = new ChordModel({ chord: 5 }).addNote(7).setInversion(2);
    const chord2 = new ChordModel({ chord: 7 }).setInversion(2).setInversion(0);
    return (
      <div>
      <div>
        {chord.voicing().noteNames().join(' ')}
        <RomanNumeral {...chord.romanNumeralAnalysis()} />
      </div>
      <div>
        {chord2.voicing().noteNames().join(' ')}
        <RomanNumeral {...chord2.romanNumeralAnalysis()} />
      </div>
      </div>
    )
  }
}

export default ChordTest
