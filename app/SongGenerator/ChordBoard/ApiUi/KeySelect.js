import React from 'react';
import styled from 'styled-components';
import { notes } from '../../constants/theory';

const StyledContainer = styled.div`
  display: flex;
  margin-bottom: 4px;
`;

const Container = styled.div`
  border: 1px solid rgb(33, 37, 43);
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 0;
  padding: 5px 0;
  transition: all 0.2s ease;
  background: rgb(33, 37, 43);
  color: ${({ selected }) => selected ? 'rgba(43, 123, 245, 0.9)' : 'rgba(141, 152, 169, 0.9)'};
  ${({ selected }) => selected ? 'font-weight: bold;' : ''};

  &:hover {
    background: rgba(43, 123, 245, 0.3);
    color: rgb(33, 37, 43);
    cursor: pointer;
    box-shadow: 3px 3px 20px 1px #ccc;
  }
  &:active {
    color: rgb(33, 37, 43);
    width: 51px;
    background: rgb(216, 0, 0);
  }
`;

const KeySelect = ({ tonic, changeKey, playChord, stopChord }) => (
  <StyledContainer>
    {notes.map((note, idx) => (
      <Container
        key={idx}
        onClick={() => changeKey(idx)}
        onMouseDown={() => playChord([idx + 60])}
        onMouseUp={() => stopChord([idx + 60])}
      selected={tonic === idx}
    >
        {note}
      </Container>
    ))}
  </StyledContainer>
)

export default KeySelect;
