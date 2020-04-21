//eslint-ignore-page

// Scale
const cScale = Scale.major('C') // major scale from 'C'
const dScale = Scale.major(2) // major scale from 'D' ?
const scaleNoteValues = scale.noteValues() // [0, 2, 4, 5, 7, 9, 11]
const scaleNotes = cScale.notes() // [C, D, E, F, G, A, B]
// Mode from Scale
const secondMode = cScale.getMode(2); // Mode Class of C Dorian
const secondModeAndNote = cScale.getMode(2, { transpose: true }); // Mode Class of D Dorian

// Mode
const secondMode = Mode.create('C', 'Dorian'); // same as above
const secondMode = Mode.dorian('C'); // same as above
const secondMode = Mode.major('C', 3); // C phrygian i think?
const secondMode = Mode.major('C', 3, { transpose: true }); // E phrygian i think?
const secondMode = Mode.harmonicMinor('E', 5);

const secondModeNoteValues = secondMode.noteValues() // [0, 2, 3, 5, 7, 9, 10] or whatever
const secondModeNotes = secondMode.notes() // [D, E, F, G, A, B, C]
const secondModeName = secondMode.name(); // Dorian
secondMode.getScale() === scale // true

// Chord
const thirdDorianChord = secondMode.getChord(3); // Chord Class whatever chord 3 is of C Dorian
thirdDorianChord.getMode() === secondMode // true
const chordNoteValues = thirdDorianChord.noteValues(); // [0, 4, 7] triad array
const chordNotes = thirdDorianChord.notes(); // [F, A#, D] or some shit triad array of notes
const currentChordVoicing = thirdDorianChord.voicing(); // default voicing [0, 4, 7]

const seventhChord = thirdDorianChord.seventh(); // new Chord class with correct sevent note added.
const chordNoteValues = thirdDorianChord.noteValues(); // [0, 4, 7, 10] 4 notes
const chordNotes = thirdDorianChord.notes(); // [F, A#, D, E] or some shit

// voicings`
``

// inversions


//
