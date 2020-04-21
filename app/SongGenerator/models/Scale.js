import Mode from './Mode';

// major: {
//   name: 'Major',
//   modes: majorModes,
//   intervals: [0, 2, 4, 5, 7, 9, 11]
// },

class Scale {
  constructor(scale, chord) {
    this.scale = scale;
    this.chord = chord;
  }

  get(attr) {
    return this.scale[attr];
  }

  intervals() {
    return this.get('intervals');
  }

  name() {
    return this.scale.name;
  }

  getMode(num = 1, chord) {
    return new Mode(num, chord)
  }
}

export default Scale;
