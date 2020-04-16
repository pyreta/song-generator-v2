import { useState, useEffect } from 'react';
import WebMidi from 'webmidi';

const MidiDeviceSetup = props => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    WebMidi.enable(err => {
      if (err) {
        console.log('ERror', err);
      } else {
        console.log('Webmidi outputs:', WebMidi.outputs);
        setIsLoaded(true);
      }
    }, []);
  });
  return isLoaded ? props.children : 'Loading...';
};

export default MidiDeviceSetup;
