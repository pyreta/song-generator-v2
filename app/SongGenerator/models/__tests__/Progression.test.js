import Progression from '../Progression';
import progression from '../../fixtures/progression';

describe('Progression', () => {
  const newProgression = new Progression(progression);

  it('swaps chords', () => {
    expect(newProgression.swap(1, 3).at(0).unwrap()).toEqual(newProgression.at(2).unwrap());
    expect(newProgression.swap(1, 3).chordNumber(1).unwrap()).not.toEqual(newProgression.chordNumber(1).unwrap());
    expect(newProgression.swap(1, 3).at(1).unwrap()).toEqual(newProgression.at(1).unwrap());
  });

  it('transports chords', () => {
    const shiftedProgression = newProgression.transport(1, 3);
    expect(shiftedProgression.at(2).unwrap()).toEqual(newProgression.at(0).unwrap());
  });

  it('inserts chords', () => {
    const insertedProgression = newProgression.insert(progression[0], 2);
    expect(insertedProgression.progression.length).toEqual(4);
    expect(insertedProgression.at(1).unwrap()).toEqual(progression[0]);
    expect(insertedProgression.at(2).unwrap()).toEqual(progression[1]);
    expect(insertedProgression.at(0).unwrap()).toEqual(progression[0]);
  });

  it('gives each chord a reference to itself', () => {
    expect(newProgression.at(1).progression).toEqual(newProgression);
    expect(newProgression.at(0).progression.at(1)).toEqual(newProgression.at(1));
  });

  it('sets a global key', () => {
    expect(newProgression.setKey(4).at(1).get('key')).toEqual(4);
    expect(newProgression.at(1).get('key')).toEqual(3);
  });

  it('inverts all chords inversion', () => {
    const progression = new Progression([
      {
        key: 0,
        octave: 5,
        scale: 'major',
        mode: 1,
        chord: 1,
        notes: { 1: 0, 3: 0, 5: 0 },
      },
      {
        key: 0,
        octave: 5,
        scale: 'major',
        mode: 1,
        chord: 6,
        notes: { 1: 0, 3: 0, 5: 0, 7: 0 },
      },
    ])
    expect(progression.getChord(1).inversion()).toEqual(0);
    expect(progression.setInversion(1).getChord(1).inversion()).toEqual(1);
    expect(progression.setInversion(1).getChord(2).inversion()).toEqual(1);
    expect(progression.setInversion(3).getChord(1).inversion()).toEqual(0);
    expect(progression.setInversion(3).getChord(2).inversion()).toEqual(3);
  });

  it('replaces chords', () => {
    const replacedPrgression = newProgression.replace(1, c => [c.sus(), c.addNote(7), c.set('mode', 7)]);
    expect(replacedPrgression.getChord(1).name()).toEqual('Dsus4');
    expect(replacedPrgression.getChord(2).name()).toEqual('Dm7');
    expect(replacedPrgression.getChord(3).name()).toEqual('D♭');
    expect(replacedPrgression.getChord(4).name()).toEqual(newProgression.getChord(2).name());
    expect(replacedPrgression.chords().length).toEqual(5);
    expect(newProgression.chords().length).toEqual(3);
  });
});
