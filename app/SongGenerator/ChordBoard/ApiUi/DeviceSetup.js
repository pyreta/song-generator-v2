import React from 'react';
import { connect } from 'react-redux';
import actions from '../../actions';
import mapScale, { getScaleDegree } from '../../helpers/mapScale';

const modeIndexMap = {
  1: 0,
  3: 1,
  6: 2,
  8: 3,
  10: 4
};

const getChord = ({
  note, voicingDecorator, rows, selectedModeRow
  // note, voicingDecorator, rows, selectedModeRow, registerChordOnKeyboard
}) => {
  const scaleDegree = getScaleDegree(note.number);
  const chord = rows[selectedModeRow][scaleDegree];
  // registerChordOnKeyboard(chord.name());
  if (chord) {
    const notes = chord.decorate[voicingDecorator]()
      .voicing()
      .noteValues();
    return notes;
  }
};

const getNewNote = props =>
  props.note.number < 48
    ? getChord(props)
    : mapScale(props.note.number, props.rows[props.selectedModeRow][0].unwrap());

export const connectMidiController = ({
  newDevice,
  devices: { inputDevice, outputDevice },
  selectModeRow,
  selectedModeRow,
  voicingDecorator,
  rows,
  registerChordOnKeyboard,
  removeChordOnKeyboard,
  bypass
}) => {
  inputDevice.removeListener('noteoff');
  inputDevice.removeListener('noteon');
  let device;
  if (newDevice) {
    device = newDevice;
  } else {
    device = inputDevice;
  }
  device.addListener('noteon', 'all', e => {
    const { note, velocity } = e;
    const newNote = bypass
      ? note.number
      : getNewNote({
        rows,
        note,
        selectedModeRow,
        voicingDecorator,
        registerChordOnKeyboard
      });

    if (newNote) {
      outputDevice.playNote(newNote, 1, { velocity });
      return;
    }

    if (note.number > 48) {
      const modeIdx = modeIndexMap[note.number % 12];

      if (modeIdx < rows.length) {
        selectModeRow(modeIdx);
      }
    }
  });
  device.addListener('noteoff', 'all', e => {
    const { note } = e;
    const newNote = bypass
      ? note.number
      : getNewNote({
        rows,
        note,
        selectedModeRow,
        voicingDecorator,
        registerChordOnKeyboard: removeChordOnKeyboard
      });

    if (newNote) {
      outputDevice.stopNote(newNote, 1);
    }
  });

  device.addListener('pitchbend', 'all', e => {
    outputDevice.sendPitchBend(e.value, 1);
  });

  device.addListener('controlchange', 'all', e => {
    outputDevice.sendControlChange(e.controller.name, e.value, 1);
  });
};

export class DeviceSetup extends React.Component {
  constructor(props) {
    super(props);
    connectMidiController(props);
  }

  componentWillReceiveProps(nextProps) {
    connectMidiController(nextProps);
    if (nextProps.selectedModeRow >= nextProps.rows.length) {
      this.props.selectModeRow(nextProps.rows.length - 1);
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = ({ devices, voicingDecorator, selectedModeRow }) => ({
  devices,
  voicingDecorator,
  selectedModeRow
});

const mapDispatchToProps = dispatch => ({
  selectModeRow: idx => dispatch(actions.SELECT_MODE_ROW(idx)),
  registerChordOnKeyboard: name => dispatch(actions.REGISTER_KEYBOARD_CHORD(name)),
  removeChordOnKeyboard: () => dispatch(actions.REGISTER_KEYBOARD_CHORD(null))
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceSetup);
