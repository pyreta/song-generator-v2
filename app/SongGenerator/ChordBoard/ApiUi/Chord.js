import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import ChordModel from '../../models/Chord';
import RomanNumeral from './RomanNumeral';

const Name = styled.div`
  font-size: 12px;
`;

const NameNoRoman = styled.div`
  font-size: 15px;
`;

const Container = styled.div`
  border: 1px solid rgb(33, 37, 43);
  height: 60px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-left: 0;
  border-bottom: 0;
  color: rgb(33, 37, 43);
  user-select: none;
  transition: all 100ms ease;
  transition: box-shadow 400ms ease;
  &:hover {
    background: rgb(33, 37, 43);
    color: white;
    cursor: pointer;
    transform: scale(1.1);
    box-shadow: 3px 3px 20px 1px #ccc;
  }
  &:active {
    color: rgb(33, 37, 43);
    transform: scale(1.2);
    background: rgb(216, 0, 0);
  }
`;

const probabilityStyle = (probability, functional, held) => {
  let pixels = Math.floor(probability * 60);
  if (pixels < 5 && functional) pixels = 7;
  if (probability > 0 && probability < 0.01) pixels = 1;
  return { boxShadow: `inset 0px -${pixels * 2}px 0px 0px #3c8aff` };
  // return held ?
  //   { boxShadow: `inset 0px -${pixels * 2}px 0px 0px #3c8aff`, background: 'rgba(60, 138, 255, 0.34)' } :
  //   { boxShadow: `inset 0px -${pixels * 2}px 0px 0px #3c8aff` };
};

const empty = {};

const allNotes = [...Array(124).keys()];
const Chord = ({
  chord,
  onClick,
  onStop,
  lastPlayedChord,
  showNextChord,
  voicingDecorator: decorator,
  isInverted,
  showRomanNumerals,
  heldChord,
}) => {
  let voicingDecorator = decorator;
  if (voicingDecorator === 'rootNote' && isInverted) voicingDecorator = 'bassNote';
  const decoratedChord = chord.decorate[voicingDecorator]();
  const notes = decoratedChord.voicing().noteValues();
  const percentNextChord = lastPlayedChord.nextChordProbability(decoratedChord, {
    showInversion: voicingDecorator !== 'rootNote'
  });
  const chordName = chord.name({ showInversion: voicingDecorator !== 'rootNote' });
  const style = showNextChord
    ? probabilityStyle(
      percentNextChord,
      lastPlayedChord.isGoodNextChord(decoratedChord),
      heldChord === chord.name()
    )
    : empty;
  return (
    <Container
      onMouseDown={() => {
        onClick(notes, chord.unwrap());
      }}
      onMouseUp={() => onStop(allNotes)}
      style={style}
    >
      {showRomanNumerals && (
        <RomanNumeral
          {...chord.romanNumeralAnalysis()}
          showInversion={voicingDecorator !== 'rootNote'}
        />
      )}
      {showRomanNumerals ? (
        <Name>{chordName}</Name>
      ) : (
        <NameNoRoman>{chord.name({ showInversion: voicingDecorator !== 'rootNote' })}</NameNoRoman>
      )}
    </Container>
  );
};

const mapStateToProps = ({
  lastPlayedChord,
  voicingDecorator,
  heldChord,
  settings
}) => ({
  lastPlayedChord: new ChordModel(lastPlayedChord),
  showNextChord: !!lastPlayedChord.notes && settings.showNextChord,
  voicingDecorator,
  heldChord,
  showRomanNumerals: settings.showRomanNumerals,
});

export default connect(mapStateToProps)(Chord);
