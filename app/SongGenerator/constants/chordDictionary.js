//♯⦰♭iiºV+ vii°7
// triads
// 1st: 6
// 2nd: 6/4
//Major
//M7
//M9
// seventh
// 1st: 6/5
// 2nd: 4/3
// 3rd: 4/2

const triadInversions = [[], [6], [6, 4]];
const seventhInversions = [[], [6, 5], [4, 3], [4, 2]];
const ninthInversions = [[], [6, 5], [4, 3], [4, 2]];
// const ninthInversions = [[], [6, 16], [7, 17], [8, 18], [9, 19]];
const sixthInversions = [[], [6, 4, 3], [6, 4, 2], [7, 5, 3]];
const makeRomanNumeralAnalysis = ({
  major,
  seventh,
  ninth,
  sixth,
  quality,
  invertedQuality,
} = {}) => (n, i) => {
  let figuredBass;
  if (seventh) {
    figuredBass = seventhInversions[i];
  } else if (sixth) {
    figuredBass = sixthInversions[i];
  } else if (ninth) {
    figuredBass = ninthInversions[i];
  } else {
    figuredBass = triadInversions[i];
  }
  return {
    numeral: major ? n.toUpperCase() : n,
    quality,
    invertedQuality,
    figuredBass,
  }
};




export default {
// triads
  major3perfect5: {
    name: ' Major',
    abreviation: '',
    getRomanNumeral: n => n,
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ major: true })
  },
  minor3perfect5: {
    name: ' minor',
    abreviation: 'm',
    getRomanNumeral: n => n,
    romanNumeralAnalysis: makeRomanNumeralAnalysis()
  },
  minor3flat5: {
    name: ' diminished',
    abreviation: 'dim',
    getRomanNumeral: n => `${n}°`,
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '°', quality: '°'})
  },
  major3sharp5: {
    name: ' augmented',
    abreviation: 'aug',
    getRomanNumeral: n => `${n}+`,
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '+', quality: '+', major: true})
  },
  major2perfect5: {
    name: ' suspened 2nd',
    abreviation: 'sus2',
    getRomanNumeral: n => `${n}sus2`,
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'sus2' }),
  },
  major2major3perfect5: {
    name: ' Major add 2',
    abreviation: 'Madd2',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'add2', major: true }),
    getRomanNumeral: n => `${n}add2`
  },
  major2minor3perfect5: {
    name: ' minor add 2',
    abreviation: 'madd2',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'add2' }),
    getRomanNumeral: n => `${n}add2`
  },
  major2flat5: {
    name: ' suspened 2nd flat 5',
    abreviation: '°sus2',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: '°sus2' }),
    getRomanNumeral: n => `${n}°sus2`
  },
  perfect4perfect5: {
    name: ' suspened 4th',
    abreviation: 'sus4',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'sus', major: true }),
    getRomanNumeral: n => `${n}sus`
  },
  major2perfect4perfect5: {
    name: ' suspened 4th and 2nd',
    abreviation: 'sus42',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'sus42' }),
    getRomanNumeral: n => `${n}sus42`
  },

// 7th chords
  major3perfect5major7: {
    name: ' Major 7th',
    abreviation: 'M7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'M7', seventh: true, major: true }),
    getRomanNumeral: n => `${n}M7`
  },
  minor3perfect5major7: {
    name: ' minor Major 7th',
    abreviation: 'mM7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'mM7', seventh: true }),
    getRomanNumeral: n => `${n}mM7`
  },
  major3perfect5minor7: {
    name: ' Dominant 7th',
    abreviation: '7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '7', quality: '7', seventh: true, major: true }),
    getRomanNumeral: n => `${n}7`
  },
  minor3perfect5minor7: {
    name: ' minor 7th',
    abreviation: 'm7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ quality: 'm7', seventh: true }),
    getRomanNumeral: n => `${n}7`
  },
  minor3flat5minor7: {
    name: ' Half-diminished',
    abreviation: 'm7♭5',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '⦰', quality: '⦰', seventh: true }),
    getRomanNumeral: n => `${n}⦰`
  },
  minor3flat5diminished7: {
    name: ' diminished',
    abreviation: 'dim7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '°', quality: '°7', seventh: true }),
    getRomanNumeral: n => `${n}°7`
  },
  major3sharp5major7: {
    name: ' augmented 7th',
    abreviation: 'aug7',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '+', quality: '+7', seventh: true, major: true }),
    getRomanNumeral: n => `${n}+7`
  },
  major2perfect5minor7: {
    name: ' dominant 7 suspended 2nd',
    abreviation: '7sus2',
    getRomanNumeral: n => `${n}7sus2`
  },
  major2perfect5major7: {
    name: ' Major 7 suspended 2nd',
    abreviation: 'M7sus2',
    getRomanNumeral: n => `${n}M7sus2`
  },
  perfect4perfect5minor7: {
    name: ' dominant 7 suspended 4th',
    abreviation: '7sus4',
    getRomanNumeral: n => `${n}7sus4`
  },
  major2perfect4perfect5minor7: {
    name: ' dominant 7 suspened 4th and 2nd',
    abreviation: '7sus42',
    getRomanNumeral: n => `${n}7sus42`
  },

// 9th chords
  major3perfect5major7perfect9: {
    name: ' Major 9th',
    abreviation: 'M9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'M9', quality: 'M9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}M9`
  },
  major3perfect5major7sharp9: {
    name: ' Major 7th sharp 9',
    abreviation: 'M7♯9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'M7♯9', quality: 'M7♯9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}M7♯9`
  },
  major3perfect5major7flat9: {
    name: ' Major 7th flat 9',
    abreviation: 'M7♭9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'M7♭9', quality: 'M7♭9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}M7♭9`
  },
  major3perfect5perfect9: {
    name: ' Major add 9',
    abreviation: 'Madd9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'Madd9', quality: 'Madd9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}Madd9`
  },
  minor3perfect5perfect9: {
    name: ' minor add 9',
    abreviation: 'madd9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'add9', quality: 'add9', ninth: true }),
    getRomanNumeral: n => `${n}add9`
  },
  minor3flat5perfect9: {
    name: ' diminished add 9',
    abreviation: '°add9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '°add9', quality: '°add9', ninth: true }),
    getRomanNumeral: n => `${n}°add9`
  },
  minor3perfect5minor7perfect9: {
    name: ' minor 9th',
    abreviation: 'm9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '9', quality: '9', ninth: true }),
    getRomanNumeral: n => `${n}9`
  },
  minor3perfect5major7perfect9: {
    name: ' minor Major 9',
    abreviation: 'mM9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'mM9', quality: 'mM9', ninth: true }),
    getRomanNumeral: n => `${n}mM9`
  },
  major3perfect5minor7perfect9: {
    name: ' Dominant 9th',
    abreviation: '9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '9', quality: '9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}9`
  },
  major3perfect5minor7flat9: {
    name: ' Dominant 7th flat 9th',
    abreviation: '7♭9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '7♭9', quality: '7♭9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}7♭9`
  },
  major3perfect5minor7sharp9: {
    name: ' Dominant 9th',
    abreviation: '7♯9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '7♯9', quality: '7♯9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}7♯9`
  },
  major3sharp5minor7sharp9: {
    name: ' Dominant 7th Sharp 9 Sharp 5',
    abreviation: '7♯9♯5',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '7♯9♯5', quality: '7♯9♯5', ninth: true, major: true }),
    getRomanNumeral: n => `${n}7♯9♯5`
  },
  minor3flat5minor7perfect9: {
    name: ' Half-diminished 9th',
    abreviation: 'm9♭5',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '⦰9', quality: '⦰9', ninth: true }),
    getRomanNumeral: n => `${n}⦰9`
  },
  minor3flat5diminished7perfect9: {
    name: ' diminished 9th',
    abreviation: 'dim9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '°9', quality: '°9', ninth: true }),
    getRomanNumeral: n => `${n}°9`
  },
  major3sharp5major7perfect9: {
    name: ' augmented 9th',
    abreviation: 'aug9',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '+9', quality: '+9', ninth: true, major: true }),
    getRomanNumeral: n => `${n}+9`
  },

  // 6th chords

  minor3perfect5major6: {
    name: ' minor 6th',
    abreviation: 'm6',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: 'm6', quality: 'm6', sixth: true }),
    getRomanNumeral: n => `${n}m6`
  },

  major3perfect5major6: {
    name: ' Major 6th',
    abreviation: '6',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '6', quality: '6', sixth: true, major: true }),
    getRomanNumeral: n => `${n}6`
  },

  minor3flat5major6: {
    name: ' Dim 6th',
    abreviation: 'dim6',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '°6', quality: '°6', sixth: true }),
    getRomanNumeral: n => `${n}°6`
  },

  major3sharp5major6: {
    name: ' Aug 6th',
    abreviation: 'aug6',
    romanNumeralAnalysis: makeRomanNumeralAnalysis({ invertedQuality: '6+', quality: '6+', sixth: true, major: true }),
    getRomanNumeral: n => `${n}6+`
  },

  //11th Chords
  major3perfect5major7perfect11: {
    name: ' Major 11th',
    abreviation: 'M11',
    getRomanNumeral: n => `${n}M11`
  },

  minor3perfect5minor7perfect11: {
    name: ' minor 11th',
    abreviation: 'm11',
    getRomanNumeral: n => `${n}11`
  },

  major3perfect5minor7perfect11: {
    name: ' Dominant 11th',
    abreviation: '11',
    getRomanNumeral: n => `${n}11`
  },

  major3perfect5minor7flat11: {
    name: ' Dominant 7th flat 11',
    abreviation: '7♭11',
    getRomanNumeral: n => `${n}7♭11`
  },

  major3perfect5minor7sharp11: {
    name: ' Dominant 7th sharp 11',
    abreviation: '7♯11',
    getRomanNumeral: n => `${n}7♯11`
  },

  major3perfect5minor7perfect9flat11: {
    name: ' Dominant 9th flat 11',
    abreviation: '9♭11',
    getRomanNumeral: n => `${n}9♭11`
  },

  major3perfect5minor7perfect9sharp11: {
    name: ' Dominant 9th sharp 11',
    abreviation: '9♯13',
    getRomanNumeral: n => `${n}9♯13`
  },

  //13th Chords
  major3perfect5major7perfect13: {
    name: ' Major 13th',
    abreviation: 'M13',
    getRomanNumeral: n => `${n}M13`
  },

  minor3perfect5minor7perfect13: {
    name: ' minor 13th',
    abreviation: 'm13',
    getRomanNumeral: n => `${n}13`
  },

  major3perfect5minor7perfect13: {
    name: ' Dominant 13th',
    abreviation: '13',
    getRomanNumeral: n => `${n}13`
  },

  major3perfect5minor7flat13: {
    name: ' Dominant 7th flat 13',
    abreviation: '7♭13',
    getRomanNumeral: n => `${n}7♭13`
  },

  major3perfect5minor7sharp13: {
    name: ' Dominant 7th sharp 13',
    abreviation: '7♯13',
    getRomanNumeral: n => `${n}7♯13`
  },

  major3perfect5minor7perfect9flat13: {
    name: ' Dominant 9th flat 13',
    abreviation: '9♭13',
    getRomanNumeral: n => `${n}9♭13`
  },

  major3perfect5minor7perfect9sharp13: {
    name: ' Dominant 9th sharp 13',
    abreviation: '9♯13',
    getRomanNumeral: n => `${n}9♯13`
  },
  // other
}
