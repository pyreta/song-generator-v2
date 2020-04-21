
const intervalMap = {
  i: 0,
  I: 0,
  II: 1,
  ii: 2,
  iii: 4,
  III: 3,
  'vii/iii': 3,
  iv: 5,
  IV: 5,
  V: 7,
  v: 7,
  VI: 8,
  vi: 9,
  vii: 11,
  VII: 10,
  'V/IV': 0,
  'V/vi': 4,
  'V/ii': 9,
  'V/iii': 11,
  'V/V': 2,
  'vii/ii': 1,
  'vii/V': 6,
  'IV/IV': 10,
  'IV/iii': 9,
  'V/vii': 6,
  'IV/vii': 4,
  'IV/V': 0,
  'IV/vi': 2,
  'vii/vii': 10,
  'vii/vi': 8,
  'IV/ii': 7,
};

export const parseChord = (chord, allChords) => {
  const attrs = {
    inversion: 0,
  };

  let htmlId = chord.chord_HTML;
  if (htmlId.includes('<sup>6</sup><sub>5</sub>')) {
    attrs.inversion = 1;
    attrs.seventh = true;
    htmlId = htmlId.split('<sup>6</sup><sub>5</sub>').join('');
  }
  if (htmlId.includes('<sup>6</sup><sub>4</sub>')) {
    attrs.inversion = 2;
    attrs.seventh = false;
    htmlId = htmlId.split('<sup>6</sup><sub>4</sub>').join('');
  }
  if (htmlId.includes('<sup>6</sup>')) {
    attrs.inversion = 1;
    attrs.seventh = false;
    htmlId = htmlId.split('<sup>6</sup>').join('');
  }
  if (htmlId.includes('<sup>??</sup><sup>7</sup>')) {
    attrs.type = 'hd';
    attrs.seventh = true;
    htmlId = htmlId.split('<sup>??</sup><sup>7</sup>').join('');
  }
  if (htmlId.includes('<sup>7</sup>')) {
    attrs.inversion = 0;
    attrs.seventh = true;
    htmlId = htmlId.split('<sup>7</sup>').join('');
  }
  if (htmlId.includes('<sup>4</sup><sub>2</sub>')) {
    attrs.inversion = 3;
    attrs.seventh = true;
    htmlId = htmlId.split('<sup>4</sup><sub>2</sub>').join('');
  }
  if (htmlId.includes('<sup>4</sup><sub>3</sub>')) {
    attrs.inversion = 2;
    attrs.seventh = true;
    htmlId = htmlId.split('<sup>4</sup><sub>3</sub>').join('');
  }
  if (htmlId.includes('&#9837;')) {
    attrs.flat = true;
    htmlId = htmlId.split('&#9837;').join('');
  }
  if (htmlId.includes('&#9839;')) {
    attrs.sharp = true;
    htmlId = htmlId.split('&#9839;').join('');
  }
  if (htmlId.includes('&deg;')) {
    attrs.diminished = true;
    htmlId = htmlId.split('&deg;').join('');
  }
  if (htmlId.includes('#7')) {
    attrs.type = 'M7';
    attrs.inversion = 0;
    htmlId = htmlId.split('#7').join('');
  }
  if (htmlId.includes('b7')) {
    attrs.type = 'D';
    attrs.inversion = 0;
    htmlId = htmlId.split('b7').join('');
  }

  attrs.interval = intervalMap[htmlId];

  if (attrs.diminished && !attrs.seventh) {
    attrs.type = 'd';
  }

  if (
    htmlId !== 'V' &&
    htmlId.toUpperCase() === htmlId &&
    attrs.seventh &&
    !attrs.type
  ) {
    attrs.type = 'M7';
  }

  if (htmlId === 'V' && attrs.seventh && !attrs.type) {
    attrs.type = 'D';
  }

  if (htmlId.toUpperCase() !== htmlId && attrs.seventh && !attrs.type) {
    attrs.type = 'm7';
  }

  if (htmlId[0] !== htmlId[0].toUpperCase() && !attrs.type && !attrs.seventh) {
    attrs.type = 'm';
  }

  if (chord.chord_ID === 'C37' || chord.chord_ID === 'C3') {
    attrs.interval = 3;
  }

  if (htmlId === 'vii' && attrs.flat) {
    attrs.interval = 10;
  }

  if (htmlId === 'V' && attrs.flat) {
    attrs.interval = 6;
  }

  if (htmlId === 'iv' && attrs.sharp) {
    attrs.interval = 6;
  }

  if (htmlId.includes('/')) {
    attrs.type = parseChord(allChords[chord.chord_ID.split('/')[0]]).type
  }

  attrs.type = attrs.type || 'M';

  const { interval, inversion, type } = attrs;

  return {
    ...chord,
    interval,
    inversion,
    type,
    id: `${interval}${type}${inversion}`,
  }
}



// console.log(`Object.values(startingChordsObject).length:`, Object.values(startingChordsObject).length)
// console.log(
//   JSON.stringify(
//     responses[0].map((chord) => {
//       return {[startingChordsObject[chord.chord_ID].id]: chord.probability};
//     }),
//   ),
// );
// console.log(`startingChordsObject["67"]:`, startingChordsObject["67"])


// const chordProps =
//   JSON.stringify(
//     responses.reduce((acc, secondChords) => {
//       const lastChordId = secondChords[0].child_path.split(',')[0];
//       const probabilities = secondChords.reduce((accum, chord) => {
//         // if (startingChordsObject[chord.chord_ID].id === '9m0') {
//         //   console.log(`chord:`, chord)
//         // }
//         return {...accum, [startingChordsObject[chord.chord_ID].id]: chord.probability};
//       },{})
//       return {...acc, [startingChordsObject[lastChordId].id]: probabilities};
//     }, {}),
//   );

  // console.log(`chordProps:`, chordProps)
