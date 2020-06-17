import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Chord from './Chord';
import ChordModel from '../../models/Chord';
import actions from '../../actions';

const ScaleContainer = styled.div`
  display: flex;
  width: 100%;
`;

const ModeName = styled.div`
  width: 60px;
  display: flex;
  align-items: center;
  padding: 10px;
  user-select: none;
  cursor: pointer;
  font-family: sans-serif;
  color: ${({ isSelected }) =>
    isSelected ? 'rgba(43, 123, 245, 0.9)' : 'rgba(141, 152, 169, 0.9)'};
  background: rgb(33, 37, 43);
  font-size: 13px;
  transition: all 100ms ease;
`;

const ScaleDegree = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 10px;
  user-select: none;
  font-family: sans-serif;
  color: ${({ isSelected }) =>
    isSelected ? 'rgba(43, 123, 245, 0.9)' : 'rgba(141, 152, 169, 0.9)'};
  background: rgb(33, 37, 43);
  font-size: 13px;
  transition: all 100ms ease;
`;

const Container = styled.div`
  border-bottom: 1px solid rgb(33, 37, 43);
  display: inline-block;
`;

export class ModeRows extends React.Component {
  constructor() {
    super();
    this.playChord = this.playChord.bind(this);
  }

  componentWillReceiveProps({ rows, selectedModeRow }) {
    const totalRows = rows.reduce((acc, row) => row.length + acc, 0);
    if (selectedModeRow >= totalRows) this.props.selectModeRow(totalRows - 1);
  }

  playChord(notes, chord) {
    this.props.playChord(notes);
    this.props.registerChord(chord);
  }

  render() {
    return (
      <Container>
        <ScaleContainer>
          <ModeName />
          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
            <ScaleDegree key={c}>{c}</ScaleDegree>
          ))}
        </ScaleContainer>
        {this.props.rows.map((mode, idx) => {
          const name = mode[0].getMode().name();
          return (
            <ScaleContainer key={`${name}${idx + 1}`}>
              <ModeName
                isSelected={this.props.selectedModeRow === idx}
                onClick={() => this.props.selectModeRow(idx)}
              >
                {name}
              </ModeName>
              {mode.map((c, i) => (
                <Chord
                  key={`${i + 1}`}
                  chord={c}
                  i={i}
                  onClick={this.playChord}
                  onStop={this.props.stopChord}
                  isInverted={!!this.props.inversion}
                />
              ))}
            </ScaleContainer>
          );
        })}
      </Container>
    );
  }
}

const mapStateToProps = ({
  modeRows,
  keysPressed,
  chordBody,
  autoVoicing,
  lastPlayedChord,
  devices: { outputDevice },
  tonic,
}) => ({
  tonic,
  chordBody,
  autoVoicing,
  lastPlayedChord: new ChordModel(lastPlayedChord),
  stopChord: chord => outputDevice.stopNote(chord, 1),
  playChord: chord => outputDevice.playNote(chord, 1, { velocity: 0.7 }),
  secondaryDominants: keysPressed['83'],
  modeRows,
});

const mapDispatchToProps = dispatch => ({
  registerChord: chord => dispatch(actions.PLAY_CHORD(chord)),
  selectModeRow: idx => dispatch(actions.SELECT_MODE_ROW(idx)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModeRows);
