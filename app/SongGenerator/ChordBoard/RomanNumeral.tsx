import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-size: 30px;
  font-family: times;
  font-weight: bold;
  display: flex;
  font-family: Times New Roman;
`;

const FiguredBass = styled.div`
  font-size: 11px;
  padding-left: 2px;
`;

const Num = styled.div`
  height: 9px;
`;

const RomanNumeral = ({ numeral, figuredBass, quality, invertedQuality, showInversion }) => (
  <Wrapper>
    {numeral}
    {figuredBass.length && showInversion ? invertedQuality : quality}
    <FiguredBass>{showInversion && figuredBass.map(i => <Num key={i}>{i}</Num>)}</FiguredBass>
  </Wrapper>
);

export default RomanNumeral;
