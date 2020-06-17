import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MidiDeviceSetup from './MidiDeviceSetup';
import KeySelect from './KeySelect';
import ModeRowsComponent from './ModeRows';
import ModeSelectComponent from './ModeSelect';
import Buttons from './Buttons';
import actions from '../../actions';
import ChordModel from '../../models/Chord';

import Progression from '../../models/Progression';
import * as Icons from './Icons';
import DeviceManager from './DeviceManager';
import DeviceSetup, { connectMidiController } from './DeviceSetup';

import mapScale from '../../helpers/mapScale';

const getChordFromNum = ({
  scaleDegree, voicingDecorator, rows, selectedModeRow
}) => {
  const chord = rows[selectedModeRow][scaleDegree - 1];
  if (chord) {
    const notes = chord.decorate[voicingDecorator]()
      .voicing()
      .noteValues();
    return notes;
  }
};
const Wrapper = styled.div`
  width: 619px;
  display: flex;
  border: 2px solid #3c5e85;
  box-shadow: 1px 11px 31px rgba(0, 0, 0, 0.9);
  border-radius: 10px;
  padding: 7px;
  background: rgb(255, 255, 255);
  flex-direction: column;
`;

const Gear = styled(Icons.Gear)`
  fill: #2a72e1;
  position: absolute;
  padding: 5px;
  top: 0px;
  left: 0px;
`;

const DropdownWrapper = styled.div`
  background-color: white;
  position: absolute;
  left: 29px;
  top: 10px;
  border-radius: 2px;
  box-shadow: 0 6px 31px rgb(15, 15, 15);
  font-size: 12px;
`;

const Check = styled.div`
  color: #4088f6;
  display: flex;
  ${({ visible }) => (visible ? '' : 'visibility: hidden;')};
`;

const SettingsOption = styled.div`
  padding: 5px 20px 5px 5px;
  display: flex;
  cursor: pointer;
  user-select: none;
  &:hover {
    background: rgba(43, 123, 245, 0.3);
  }
`;

export class ApiUi extends React.Component {
  constructor() {
    super();
    this.state = { voicePreviousChord: false };
  }

  componentDidMount() {
    this.setupKeyBindings();
    document.body.addEventListener('click', this.documentClick);
  }

  componentWillUnmount = () => {
    document.body.removeEventListener('click', this.documentClick);
  };

  documentClick = e => {
    if (this.dropdownEl && !this.dropdownEl.contains(e.target)) {
      this.props.closeSettings();
    }
  };

  toggleVoicePreviousChord = () => (
    this.setState({ voicePreviousChord: !this.state.voicePreviousChord })
  )

  toggleBypass = () => (
    this.setState({ bypass: !this.state.bypass })
  )

  ColumnDropdown = ({ rows }) => {
    const isInverted = !!this.inversion();
    return (
      <DropdownWrapper>
        <SettingsOption onClick={this.toggleBypass}>
          <Check visible={this.state.bypass}>
            <Icons.Check size={11} />
          </Check>
          Bypass Chord Board
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleRomanNumerals}>
          <Check visible={this.props.showRomanNumerals}>
            <Icons.Check size={11} />
          </Check>
          Roman Numeral Notation
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleNextChord}>
          <Check visible={this.props.showNextChord}>
            <Icons.Check size={11} />
          </Check>
          Show next chord probability
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleRootNoteDecorator}>
          <Check visible={this.props.voicingDecorator === 'rootNote' && !isInverted}>
            <Icons.Check size={11} />
          </Check>
          Add root bass note
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleBassNoteDecorator}>
          <Check
            visible={
              this.props.voicingDecorator === 'bassNote' ||
              (this.props.voicingDecorator === 'rootNote' && isInverted)
            }
          >
            <Icons.Check size={11} />
          </Check>
          Add inverted bass note
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleAutoVoicing}>
          <Check visible={this.props.autoVoicing}>
            <Icons.Check size={11} />
          </Check>
          Auto voicing
        </SettingsOption>

        <SettingsOption onClick={this.toggleVoicePreviousChord}>
          <Check visible={this.state.voicePreviousChord}>
            <Icons.Check size={11} />
          </Check>
          Voice previous chord
        </SettingsOption>

        <SettingsOption onClick={this.props.toggleScales}>
          <Check visible={this.props.showScales}>
            <Icons.Check size={11} />
          </Check>
          Show scales
        </SettingsOption>

        <DeviceManager rows={rows} connectMidiController={connectMidiController} />
      </DropdownWrapper>
    );
  };

  decreaseKey() {
    return this.props.tonic === 0
      ? this.props.changeKey(11)
      : this.props.changeKey(this.props.tonic - 1);
  }

  increaseKey() {
    return this.props.changeKey((this.props.tonic + 1) % 12);
  }

  decreaseMode() {
    const newRow = this.props.selectedModeRow === 0 ? this.numberOfChordRows - 1 : this.props.selectedModeRow - 1;
    this.props.selectModeRow(newRow);
  }

  increaseMode() {
    this.props.selectModeRow((this.props.selectedModeRow + 1) % this.numberOfChordRows);
  }

  setupKeyBindings() {
    const keyNotes = {
      84: 57 + 12,
      89: 59 + 12,
      85: 60 + 12,
      73: 62 + 12,
      79: 64 + 12,
      80: 65 + 12,
      219: 67 + 12,
      221: 69 + 12,
      220: 71 + 12,
    };
    document.addEventListener('keydown', e => {
      if (this.state[e.key]) return;
      this.setState({ [e.key]: true });

      const scaleDegree = parseInt(e.key, 10);
      if (scaleDegree > 0 && scaleDegree < 8) {
        const chord = getChordFromNum({
          scaleDegree,
          voicingDecorator: this.props.voicingDecorator,
          rows: this.chordRows(),
          selectedModeRow: this.props.selectedModeRow
        });
        this.props.playChord(chord);
        return;
      }

      if (keyNotes[e.keyCode]) {
        const note = mapScale(
          keyNotes[e.keyCode],
          this.chordRows()[this.props.selectedModeRow][0].unwrap()
        );
        this.props.playChord(note);
        return;
      }

      if (e.key === 'z') {
        this.props.addNotes({
          1: 0, 2: 0, 5: 0
        });
      }
      if (e.key === 'x') {
        this.props.addNotes({
          1: 0, 4: 0, 5: 0
        });
      }
      if (e.key === 'c') {
        this.props.addNotes({
          1: 0, 3: 0, 5: 0, 6: 0
        });
      }
      if (e.key === 'v') {
        this.props.addNotes({
          1: 0, 3: 0, 5: 0, 7: 0
        });
      }
      if (e.key === 'b') {
        this.props.addNotes({
          1: 0, 3: 0, 5: 0, 9: 0
        });
      }
      if (e.keyCode === 37) this.decreaseKey();
      if (e.keyCode === 39) this.increaseKey();
      if (e.keyCode === 38) this.decreaseMode();
      if (e.keyCode === 40) this.increaseMode();
      if (e.key === 'a') this.props.toggleAutoVoicing();
    });
    document.addEventListener('keyup', e => {
      const scaleDegree = parseInt(e.key, 10);
      this.setState({ [e.key]: false });

      if (scaleDegree > 0 && scaleDegree < 8) {
        const chord = getChordFromNum({
          scaleDegree,
          voicingDecorator: this.props.voicingDecorator,
          rows: this.chordRows(),
          selectedModeRow: this.props.selectedModeRow
        });
        this.props.stopChord(chord);
        return;
      }

      if (keyNotes[e.keyCode]) {
        const note = mapScale(
          keyNotes[e.keyCode],
          this.chordRows()[this.props.selectedModeRow][0].unwrap()
        );
        this.props.stopChord(note);
        return;
      }

      this.props.addNotes({ 1: 0, 3: 0, 5: 0 });
    });
  }

  inversion() {
    if (this.state.r) return 3;
    if (this.state.e) return 2;
    if (this.state.w) return 1;
    if (this.state.q) return 99;
    return 0;
  }

  secondary() {
    if (this.state.s) return 4;
    if (this.state.d) return 5;
    if (this.state.f) return 7;
    return 0;
  }

  chordRows() {
    const {
      modeRows,
      tonic,
      chordBody,
      secondaryDominants,
      autoVoicing,
      lastPlayedChord
    } = this.props;

    const inversion = this.inversion();
    const secondary = this.secondary();
    const chordToVoice = this.state.voicePreviousChord ? lastPlayedChord : new ChordModel();
    return Object.keys(modeRows).reduce((acc, scale) => {
      const scaleModes = Object.keys(modeRows[scale])
        .filter(mode => modeRows[scale][mode])
        .map((mode) => {
          const progression = Progression.allChords(
            {
              key: tonic,
              scale,
              mode,
              notes: chordBody
            },
            secondaryDominants
          ).setInversion(inversion);
          return progression.chords().map((c) => {
            const voicedChord =
              autoVoicing && inversion < 1
                ? c
                  .secondary(secondary)
                  .matchVoicingToChord({ lastPlayedChord: chordToVoice, method: 'bijective' })
                : c.secondary(secondary).matchOctaveToChord(lastPlayedChord);
            return voicedChord;
          });
        });

      return [...acc, ...scaleModes];
    }, []);
  }

  render() {
    const chordRows = this.chordRows();
    this.numberOfChordRows = chordRows.length;
    return (
      <div>
        <div ref={el => (this.dropdownEl = el)}>
          <Gear
            size={20}
            onClick={this.props.toggleSettings}
          />
          {this.props.showSettingsDropdown && <this.ColumnDropdown rows={chordRows} />}
        </div>
        <MidiDeviceSetup rows={chordRows}>
          <DeviceSetup rows={chordRows} bypass={this.state.bypass} />
          <Wrapper>
            {this.props.showScales && <ModeSelectComponent />}
            <KeySelect
              changeKey={this.props.changeKey}
              playChord={this.props.playChord}
              stopChord={this.props.stopChord}
              tonic={this.props.tonic}
            />
            <Buttons isInverted={!!this.inversion()} />
            <ModeRowsComponent
              rows={chordRows}
              inversion={this.inversion()}
              selectedModeRow={this.props.selectedModeRow}
            />
          </Wrapper>
        </MidiDeviceSetup>
      </div>
    );
  }
}

const mapStateToProps = ({
  tonic,
  // progression,
  devices: { outputDevice },
  keysPressed,
  // modeRowsProps
  modeRows,
  chordBody,
  autoVoicing,
  lastPlayedChord,
  selectedModeRow,
  settings,
  voicingDecorator
}) => ({
  keysPressed,
  tonic,
  playChord: chord => outputDevice.playNote(chord, 1, { velocity: 0.7 }),
  stopChord: chord => outputDevice.stopNote(chord, 1),
  // modeRowsProps
  chordBody,
  autoVoicing,
  lastPlayedChord: new ChordModel(lastPlayedChord),
  secondaryDominants: keysPressed['83'],
  modeRows,
  selectedModeRow,
  showScales: settings.showScales,
  showDeviceSetup: settings.showDeviceSetup,
  showSettingsDropdown: settings.show,
  showRomanNumerals: settings.showRomanNumerals,
  showNextChord: settings.showNextChord,
  voicingDecorator
});

const mapDispatchToProps = dispatch => ({
  addKeyPress: k => dispatch(actions.ADD_KEY_PRESS(k)),
  removeKeyPress: k => dispatch(actions.REMOVE_KEY_PRESS(k)),
  changeKey: key => dispatch(actions.CHANGE_KEY(key)),
  addNotes: notes => dispatch(actions.UPDATE_CHORD_BODY(notes)),
  registerChord: chord => dispatch(actions.PLAY_CHORD(chord)),
  toggleAutoVoicing: () => dispatch(actions.TOGGLE_AUTO_VOICING()),
  loadChords: chords => dispatch(actions.LOAD_CHORDS(chords)),
  toggleSettings: () => dispatch(actions.TOGGLE_SETTINGS()),
  closeSettings: () => dispatch(actions.CLOSE_SETTINGS()),

  toggleRomanNumerals: () => dispatch(actions.TOGGLE_ROMAN_NUMERALS()),
  toggleNextChord: () => dispatch(actions.TOGGLE_NEXT_CHORD()),
  toggleScales: () => dispatch(actions.TOGGLE_SCALES()),
  toggleDeviceSetup: () => dispatch(actions.TOGGLE_DEVICE_SETUP()),
  selectModeRow: row => dispatch(actions.SELECT_MODE_ROW(row)),

  toggleRootNoteDecorator: () => dispatch(actions.TOGGLE_VOICING_DECORATOR('rootNote')),
  toggleBassNoteDecorator: () => dispatch(actions.TOGGLE_VOICING_DECORATOR('bassNote'))
});

export default connect(mapStateToProps, mapDispatchToProps)(ApiUi);
