import Chord from '../Chord';
import { convertNotesToVoicing } from '../helpers';

describe('Chord', () => {
  const D_minor_in_C_Dorian = new Chord({ key: 0, scale: 'major', mode: 2, chord: 2, notes: { 1: 0, 3: 0, 5: 0 }});
  const D_Major_in_Csharp_Phrygian = new Chord({ key: 1,  scale: 'major', mode: 3,  chord: 2, notes: { 1: 0, 3: 0, 5: 0 } });
  const DsharpDim_in_Dsharp_Locrian = new Chord({ key: 3, scale: 'minor', mode: 2, chord: 1, notes: { 1: 0, 3: 0, 5: 0 } });
  const E7_in_PhrygDom = new Chord({ key: 4, scale: 'harmonicMinor', mode: 5, chord: 1, notes: { 1: 0, 3: 0, 5: 0, 7:0 } });
  const Fsharp_minorMajor7_in_HarmonicMinor = new Chord({ key: 6, scale: 'harmonicMinor', mode: 1, chord: 1, notes: { 1: 0, 3: 0, 5: 0, 7:0 } });
  const Em9inC = new Chord({ key: 0, scale: 'major', mode: 1, chord: 3, notes: { 1: 0, 3: 0, 5: 0, 7: 0, 9: 0 } });
  const Esus2inC = new Chord({ key: 0, scale: 'major', mode: 1, chord: 3, notes: { 1: 0, 2: 0, 5: 0 } });
  const AMsus2 = new Chord({ key: 9, scale: 'major', mode: 1, chord: 1, notes: { 1: 0, 2: 0, 5: 0 } });
  const FMsus4 = new Chord({ key: 0, scale: 'major', mode: 1, chord: 4, notes: { 1: 0, 4: 0, 5: 0 } });
  const G7 = new Chord( {key: 0, scale: 'major', mode: 1, chord: 5, notes: { 1: 0, 3: 0, 5: 0, 7: 0 } });
  const A7 = new Chord( {key: 2, scale: 'major', mode: 1, chord: 5, notes: { 1: 0, 3: 0, 5: 0, 7: 0 } });

  it('has a key', () => {
    expect(D_minor_in_C_Dorian.key().name()).toEqual('C');
    expect(D_minor_in_C_Dorian.key().value()).toEqual(0);
    expect(D_Major_in_Csharp_Phrygian.key().name()).toEqual('D♭');
    expect(D_Major_in_Csharp_Phrygian.key().value()).toEqual(1);
  });

  it('has a scale', () => {
    expect(E7_in_PhrygDom.getScale().name()).toEqual('Harmonic Minor');
    expect(DsharpDim_in_Dsharp_Locrian.getScale().name()).toEqual('Minor');
    expect(D_minor_in_C_Dorian.getScale().name()).toEqual('Major');
  });

  it('has notes', () => {
    expect(D_minor_in_C_Dorian.noteNames()).toEqual(['D', 'F', 'A']);
    expect(D_Major_in_Csharp_Phrygian.noteNames()).toEqual(['D', 'G♭', 'A']);
    expect(DsharpDim_in_Dsharp_Locrian.noteNames()).toEqual(['E♭', 'G♭', 'A']);
    expect(E7_in_PhrygDom.noteNames()).toEqual(['E', 'A♭', 'B', 'D']);
    expect(
      new Chord({
        key: 0,
        scale: 'major',
        mode: 1,
        chord: 1,
        notes: { 1: 0, 3: 0, 5: 0 },
      }).noteNames(),
    ).toEqual(['C', 'E', 'G']);
    expect(AMsus2.noteValues()).toEqual([9, 11, 16]);
    expect(AMsus2.noteNames()).toEqual(['A', 'B', 'E']);
    expect(FMsus4.noteNames()).toEqual(['F', 'B♭', 'C']);
  });

  it('uses true intervals outside core chord even when outside scale', () => {
    expect(Em9inC.noteNames()).toEqual(['E', 'G', 'B', 'D', 'G♭']);
    expect(Esus2inC.noteNames()).toEqual(['E', 'G♭', 'B']);
  });

  it('has a mode', () => {
    expect(D_minor_in_C_Dorian.getMode().name()).toEqual('Dorian');
    expect(D_Major_in_Csharp_Phrygian.getMode().name()).toEqual('Phrygian');
    expect(DsharpDim_in_Dsharp_Locrian.getMode().name()).toEqual('Locrian');
    expect(E7_in_PhrygDom.getMode().name()).toEqual('Phrygian Dominant');
  });

  it('has a root', () => {
    expect(D_minor_in_C_Dorian.root().name()).toEqual('D');
    expect(D_minor_in_C_Dorian.root().value()).toEqual(2);
    expect(E7_in_PhrygDom.root().name()).toEqual('E');
    expect(E7_in_PhrygDom.root().value()).toEqual(4);
    expect(DsharpDim_in_Dsharp_Locrian.root().name()).toEqual('E♭');
    expect(DsharpDim_in_Dsharp_Locrian.root().value()).toEqual(3);
  });

  it('has an analysis', () => {
    expect(D_minor_in_C_Dorian.analyze()).toEqual({ 3: 'minor', 5: 'perfect'});
    expect(D_Major_in_Csharp_Phrygian.analyze()).toEqual({ 3: 'major', 5: 'perfect'});
    expect(DsharpDim_in_Dsharp_Locrian.analyze()).toEqual({ 3: 'minor', 5: 'flat'});
    expect(E7_in_PhrygDom.analyze()).toEqual({ 3: 'major', 5: 'perfect', 7: 'minor'});
  });

  it('has a signature', () => {
    expect(D_minor_in_C_Dorian.signature()).toEqual('minor3perfect5');
    expect(D_Major_in_Csharp_Phrygian.signature()).toEqual('major3perfect5');
    expect(DsharpDim_in_Dsharp_Locrian.signature()).toEqual('minor3flat5');
    expect(E7_in_PhrygDom.signature()).toEqual('major3perfect5minor7');
    expect(AMsus2.signature()).toEqual('major2perfect5');
  });

  it('has a name', () => {
    expect(D_minor_in_C_Dorian.name()).toEqual('Dm');
    expect(D_Major_in_Csharp_Phrygian.name()).toEqual('D');
    expect(DsharpDim_in_Dsharp_Locrian.name()).toEqual('E♭dim');
    expect(E7_in_PhrygDom.name()).toEqual('E7');
    expect(Fsharp_minorMajor7_in_HarmonicMinor.name()).toEqual('G♭mM7');
  });

  it('can have a note added', () => {
    expect(D_minor_in_C_Dorian.addNote(7).name()).toEqual('Dm7');
    expect(D_minor_in_C_Dorian.addNote(6).name()).toEqual('Dm6');
    expect(D_minor_in_C_Dorian.addNote(13).name()).toEqual('Dm13');
    expect(D_Major_in_Csharp_Phrygian.addNote(6).name()).toEqual('D6');
    expect(D_Major_in_Csharp_Phrygian.addNote(6).noteNames()).toEqual(['D', 'G♭', 'A', 'B']);
  });

  it('can have a note removed', () => {
    expect(D_minor_in_C_Dorian.addNote(7).removeNote(7).name('abreviation')).toEqual('Dm');
  });

  it('can be suspended', () => {
    expect(D_minor_in_C_Dorian.sus().name()).toEqual('Dsus4');
    expect(D_minor_in_C_Dorian.sus(2).name()).toEqual('Dsus2');
    expect(D_minor_in_C_Dorian.sus(2,4).name()).toEqual('Dsus42');
    expect(D_minor_in_C_Dorian.sus(4,2,6).name()).toEqual('Dsus42');
    console.log(`!!!!!!!!!! in can be suspended:`, D_minor_in_C_Dorian.sus(4,2,6).voicing().noteValues());
  });

  it('creates a secondary dominant', () => {
    expect(D_minor_in_C_Dorian.secondaryDominant().name()).toEqual('A7');
  });

  it('creates a secondary chord', () => {
    expect(D_minor_in_C_Dorian.secondary(5).addNote(7).name()).toEqual('A7');
    const Fmaj = new Chord({ chord: 4});
    expect(Fmaj.name()).toEqual('F');
    expect(Fmaj.secondary(5).secondary(7).name()).toEqual('Bdim');
    expect(Fmaj.addNote(7).secondary(5).secondary(7).name()).toEqual('Bm7♭5');
    expect(Fmaj.addNote(7).secondary(5,{ notes:   {1: 0, 3: 0, 5: 0}}).secondary(7).name()).toEqual('Bdim');
    expect(G7.secondary(4).name()).toEqual('CM7');
  });

  it('has tritone substitution', () => {
    expect(G7.tritoneSubstitution().name()).toEqual('D♭7');
    expect(A7.tritoneSubstitution().name()).toEqual('E♭7');
    expect(A7.diminishedSubstitution().name()).toEqual('D♭dim7');
  });

  it('creates a default chord from root', () => {
    const gM = Chord.fromRoot(7);
    expect(gM.name()).toEqual('G');
    expect(gM.key().name()).toEqual('G');
    const g7 = gM.makeDominantFifth();
    expect(g7.name()).toEqual('G7');
    expect(g7.key().name()).toEqual('C');
  });

  it('substitutes a minor 4th', () => {
    expect(G7.fourthMinorSubstitution().name()).toEqual('Fm');
    expect(G7.fourthMinorSubstitution().addNote(7).name()).toEqual('Fm7');
  });

  it('creates a chromatic substitution', () => {
    expect(G7.chromaticSubstitution()[0].name()).toEqual('A♭7');
    expect(G7.chromaticSubstitution()[1].name()).toEqual('G7');
  });

  it('creates a 2/5 substitution', () => {
    expect(G7.twoFiveSubstitution()[0].name()).toEqual('Dm');
    expect(G7.chromaticSubstitution()[1].name()).toEqual('G7');
  });

  it('creates default triads', () => {
    expect(Chord.fromMinorScale(1).name()).toEqual('Cm');
    expect(Chord.fromMinorScale(2).name()).toEqual('Ddim');
    expect(Chord.fromMinorScale(3).name()).toEqual('E♭');
    expect(Chord.fromMajorScale(1).name()).toEqual('C');
    expect(Chord.fromMajorScale(2).name()).toEqual('Dm');
    expect(Chord.fromMajorScale(3).name()).toEqual('Em');
  });

  it('creates roman numerals', () => {
    expect(new Chord().romanNumeral()).toEqual('I');
    expect(Chord.fromMajorScale(2).romanNumeral()).toEqual('ii');
    expect(Chord.fromMajorScale(3).romanNumeral()).toEqual('iii');
    expect(Chord.fromMinorScale(1).romanNumeral()).toEqual('i');
    expect(Chord.fromMinorScale(2).romanNumeral()).toEqual('ii°');
    expect(Chord.fromMinorScale(3).romanNumeral()).toEqual('III');
  });

  it('has a voicing', () => {
    const cChord = new Chord();
    expect(cChord.get('voicing')).toEqual({ 1: [0], 3: [0], 5: [0] });
    expect(cChord.voicing().noteValues()).toEqual([60, 64, 67]);
    expect(cChord.voicing().noteNames()).toEqual(['C', 'E', 'G']);
    expect(new Chord({voicing: { 1: [-2, 0], 3: [1], 5: [1, 2]} })
      .voicing()
      .noteValues())
      .toEqual([36, 60, 76, 79, 91]);
    expect(new Chord({voicing: { 1: [-2, 0], 3: [1, 2], 5: [1] }})
      .voicing()
      .noteNames())
      .toEqual(['C', 'C', 'E', 'G', 'E']);
  });

  it('matches voicing to another chord', () => {
    const Amin = new Chord({ chord: 6 });
    const Cmaj = new Chord();
    expect(Amin.name()).toEqual('Am');
    expect(Amin.matchVoicingToChord({ lastPlayedChord: Cmaj })
      .voicing()
      .noteValues())
      .toEqual([60, 64, 69]);
    expect(Amin.matchVoicingToChord({ lastPlayedChord: Cmaj })
      .voicing({ withRoot: 3})
      .noteValues())
      .toEqual([45, 60, 64, 69]);
    });

  describe('voicings', () => {
    const Cmaj = new Chord();
    const Cmaj7 = new Chord().addNote(7).matchVoicingToChord({ lastPlayedChord: Cmaj });
    const Emin = new Chord({ chord: 3 }).matchVoicingToChord({ lastPlayedChord: Cmaj });
    const Amin = new Chord({ chord: 6 }).matchVoicingToChord({ lastPlayedChord: Cmaj });
    const Adim = new Chord({ chord: 6, mode: 2 }).matchVoicingToChord({ lastPlayedChord: Amin });
    const Fmaj = new Chord({ chord: 4 }).matchVoicingToChord({ lastPlayedChord: Amin });
    const Gmaj = new Chord({ chord: 5 }).matchVoicingToChord({ lastPlayedChord: Fmaj });
    const GmajFromE = new Chord({ chord: 5 }).matchVoicingToChord({ lastPlayedChord: Emin });

    it('matches voicings in a progression', () => {
      expect(Cmaj7.voicing().noteValues()).toEqual([59, 60, 64, 67]);
      expect(Amin.voicing().noteValues()).toEqual([60, 64, 69]);
      expect(Adim.voicing().noteValues()).toEqual([60, 63, 69]);
      expect(Fmaj.voicing().noteValues()).toEqual([60, 65, 69]);
      expect(Gmaj.voicing().noteValues()).toEqual([59, 62, 67]);

      expect(Emin.voicing().noteValues()).toEqual([59, 64, 67]);
      expect(GmajFromE.voicing().noteValues()).toEqual([59, 62, 67]);
    });

    it('serializes a new voicing', () => {
      const voicedAmin = new Chord({
        chord: 6,
        voicing: { 1: [0], 3: [-1], 5: [-1] }
      });
      expect(voicedAmin.voicing().noteValues()).toEqual([60, 64, 69]);
      expect(Amin.get('voicing')).toEqual({ 1: [0], 3: [-1], 5: [-1] });
      expect(GmajFromE.get('voicing')).toEqual({ 1: [0], 3: [-1], 5: [-1] });
      expect(new Chord({ chord: 5, voicing: { 1: [0], 3: [-1], 5: [-1] } })
        .voicing()
        .noteValues())
        .toEqual([59, 62, 67]);
    });

    describe('helpers', () => {
      describe('convertNotesToVoicing', () => {
        const Cmaj = new Chord();
        const Cmaj9 = new Chord({ notes: {1:0, 3:0, 5:0, 7:0, 9:0}});
        const Cmaj7 = new Chord().addNote(7);
        const Dmaj7 = new Chord({ key: 2 }).addNote(7);
        it('converts an adjust voicing to voicing object', () => {
          expect(Cmaj.voicing().noteValues()).toEqual([60, 64, 67]);
          expect(Cmaj7.voicing().noteValues()).toEqual([60, 64, 67, 71]);
          expect(Dmaj7.voicing().noteValues()).toEqual([62, 66, 69, 73]);
          expect(convertNotesToVoicing(Cmaj, [64, 67, 72])).toEqual({ 1: [1], 3: [0], 5: [0] });
          expect(convertNotesToVoicing(Cmaj, [67, 72, 76])).toEqual({ 1: [1], 3: [1], 5: [0] });
          expect(convertNotesToVoicing(Cmaj7, [64, 67, 71, 72])).toEqual({ 1: [1], 3: [0], 5: [0], 7:[0] });
          expect(convertNotesToVoicing(Cmaj7, [59, 60, 64, 67])).toEqual({ 1: [0], 3: [0], 5: [0], 7:[-1] });
          expect(convertNotesToVoicing(Cmaj7, [59, 60, 52, 67])).toEqual({ 1: [0], 3: [-1], 5: [0], 7:[-1] });
          expect(convertNotesToVoicing(Dmaj7, [61, 62, 54, 69])).toEqual({ 1: [0], 3: [-1], 5: [0], 7:[-1] });
          expect(convertNotesToVoicing(Dmaj7, [62, 66, 69, 73])).toEqual({ 1: [0], 3: [0], 5: [0], 7:[0] });
          expect(convertNotesToVoicing(Cmaj9, [60, 64, 67, 71, 74])).toEqual({ 1: [0], 3: [0], 5: [0], 7:[0], 9:[0] });
        });
      });
    });

    it('has inversions', () => {
      const Cmaj = new Chord();
      const Cmaj7 = new Chord().addNote(7);
      expect(Cmaj.voicing().noteValues()).toEqual([60, 64, 67]);
      expect(Cmaj.setInversion(0).voicing().noteValues()).toEqual([60, 64, 67]);
      expect(Cmaj.setInversion(1).voicing().noteValues()).toEqual([64, 67, 72]);
      expect(Cmaj.setInversion(2).voicing().noteValues()).toEqual([67, 72, 76]);
      expect(Cmaj.setInversion(3).voicing().noteValues()).toEqual([60, 64, 67]);
      expect(Cmaj7.setInversion(3).voicing().noteValues()).toEqual([71, 72, 76, 79]);
      expect(Cmaj7.setInversion(4).voicing().noteValues()).toEqual([60, 64, 67, 71]);
    });

    it('has idempotent inversions', () => {
      const Cmaj = new Chord();
      expect(Cmaj.setInversion(1).voicing().noteValues()).toEqual([64, 67, 72]);
      expect(Cmaj.setInversion(2).voicing().noteValues()).toEqual([67, 72, 76]);
      expect(Cmaj.setInversion(2).setInversion(1).voicing().noteValues()).toEqual([64, 67, 72]);
      expect(Cmaj.setInversion(1).setInversion(1).voicing().noteValues()).toEqual([64, 67, 72]);
      expect(Cmaj.setInversion(1).setInversion(2).voicing().noteValues()).toEqual([67, 72, 76]);
      expect(Cmaj.setInversion(1).setInversion(0).voicing().noteValues()).toEqual([60, 64, 67]);
      expect(Cmaj.setInversion(0).setInversion(0).voicing().noteValues()).toEqual([60, 64, 67]);
      expect(Cmaj.setInversion(2).setInversion(2).voicing().noteValues()).toEqual([67, 72, 76]);
      expect(Cmaj.setInversion(2).addNote(7).setInversion(0).voicing().noteValues()).toEqual([60, 64, 67, 71]);
      expect(Cmaj.setInversion(2).addNote(7).setInversion(3).voicing().noteValues()).toEqual([71, 72, 76, 79]);
      expect(Cmaj.addNote(7).setInversion(2).setInversion(3).voicing().noteValues()).toEqual([71, 72, 76, 79]);
    });

    it('has roman numeral analysis', () => {
      const Cmin = new Chord({ mode: 2 });
      expect(Cmin.name()).toEqual('Cm');
      expect(Cmin.setInversion(1).romanNumeralAnalysis().figuredBass).toEqual([6]);
      expect(Cmin.setInversion(2).romanNumeralAnalysis().figuredBass).toEqual([6, 4]);
      expect(Cmin.setInversion(3).romanNumeralAnalysis().figuredBass).toEqual([]);
    });
  });

  it('determines if next chord is compatible', () => {
    const Bdim = new Chord({ chord: 7 });
    const Gmaj = new Chord({ chord: 5 });
    // const Dmin = new Chord({ chord: 2 });
    expect(Bdim.isGoodNextChord(Gmaj)).toEqual(true);
    expect(Gmaj.isGoodNextChord(Bdim)).toEqual(false);
  });

  it('determines hook theory next chord probability', () => {
    const C = new Chord();
    // const oneSix = C.setInversion(1);
    const G = new Chord({ chord: 5 });
    const F = new Chord({ chord: 4 });
    const Em = new Chord({ chord: 3 });
    const Dm = new Chord({ chord: 2 });
    // const twoSeven = Dm.addNote(7);
    const Am = new Chord({ chord: 6 });
    const E = new Chord({ scale: 'harmonicMinor', mode: 3, chord: 3 });
    const fiveOfSix = Am.secondary(5);
    // const inverted5of6 = Am.secondary(5).setInversion(2); //
    // console.log(`inverted5of6 not in fist hooktheory chords:`, inverted5of6)
    const Bdim = new Chord({ chord: 7 });
    const CmM7 = new Chord({ scale: 'harmonicMinor' }).addNote(7);

    expect(C.nextChordProbability(G)).toEqual(0.252);
    expect(C.nextChordProbability(F)).toEqual(0.182);
    expect(C.nextChordProbability(CmM7)).toEqual(0);
    expect(Dm.nextChordProbability(Am)).toEqual(0.18);
    expect(Bdim.nextChordProbability(G)).toEqual(0.05);
    expect(Bdim.nextChordProbability(Am)).toEqual(0.218);
    expect(Bdim.nextChordProbability(E)).toEqual(0.072);
    expect(CmM7.nextChordProbability(C)).toEqual(0);
    expect(Em.nextChordProbability(G)).toEqual(0.077);
    expect(Bdim.nextChordProbability(fiveOfSix)).toEqual(0.072);
    // expect(inverted5of6.nextChordProbability(Am)).toEqual(0.072);
    // expect(oneSix.nextChordProbability(twoSeven)).toEqual(0.064);
  });
});
