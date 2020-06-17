import React, { Component } from 'react';
import WebMidi from 'webmidi';
import { connect } from 'react-redux';
import noOpMidiDevice from '../../helpers/noOpMidiDevice';
// import { defaultdeviceIds } from '../../constants';
import actions from '../../actions';


class MidiDeviceSetup extends Component {
  componentWillMount() {
    this.setupWebMidiAPI();
  }

  loadDevices() {
    const inputDevice =
      WebMidi.inputs.filter(i => i.manufacturer === 'Roland')[0] ||
      WebMidi.inputs.filter(i => !i.name.includes('IAC'))[0] ||
      noOpMidiDevice;
    const outputDevice = WebMidi.outputs.filter(i => i.name.includes('ChordBoard'))[0] || noOpMidiDevice;
    const devices = {
      inputDevice,
      dawListener: noOpMidiDevice,
      outputDevice,
    };

    this.props.loadDevices(devices);
  }

  setupWebMidiAPI() {
    WebMidi.enable(err => {
      if (err) {
        this.props.webMidiError(err);
      } else {
        this.loadDevices();
        this.props.enableWebMidi();
      }
    });
  }

  render() {
    return (
      <div>
        {this.props.ready ? (
          <div>
            {this.props.children}
          </div>
        ) : (
          <div>...loading</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ progression, webMidiEnabled: ready }) => ({
  progression,
  ready
});

const mapDispatchToProps = dispatch => ({
  enableWebMidi: () => dispatch(actions.ENABLE_WEB_MIDI()),
  webMidiError: err => dispatch(actions.WEB_MIDI_ERROR(err)),
  loadDevices: devices => dispatch(actions.LOAD_MIDI_DEVICES(devices))
});

export default connect(mapStateToProps, mapDispatchToProps)(MidiDeviceSetup);
