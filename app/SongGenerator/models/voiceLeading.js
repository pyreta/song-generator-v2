import _ from 'lodash';
const VERYLARGENUMBER = 1000000; // effectively infinity
const MODULUS = 12; // size of the octave

const HALFMODULUS = parseInt(Math.floor(0.5 + MODULUS / 2.0), 10);
const adjustPythonModulus = (n, mod) => (n >= 0 ? n : n + mod);

export function bijective_vl(firstPCs, secondPCs, sort) {
  if (firstPCs.length !== secondPCs.length) {
    return false;
  }

  let bijective_vl_fullList = []; // collects all the bijective VLs along with their size
  let currentBest = []; // currentBest records the best VL we have found so far
  let currentBestSize = VERYLARGENUMBER; // currentBestSize is the size of the current best VL (starts at infinity)

  for (let i = 0; i < firstPCs.length; i++) {
    secondPCs = [
      ...secondPCs.slice(secondPCs.length - 1),
      ...secondPCs.slice(0, secondPCs.length - 1),
    ];
    let newSize = 0;
    let newPaths = [];

    for (let j = 0; j < firstPCs.length; j++) {
      let path = (secondPCs[j] - firstPCs[j]) % MODULUS; // calculate most efficient path based on the pairs
      path = adjustPythonModulus(path, MODULUS);
      if (path > HALFMODULUS) {
        path -= MODULUS;
      }
      newPaths.push([firstPCs[j], path].map(x => (x === 0 ? 0 : x)));
      newSize += Math.abs(path);
    }

    bijective_vl_fullList.push([newPaths, newSize]);
    if (newSize < currentBestSize) {
      currentBestSize = newSize;
      currentBest = newPaths;
    }
  }
  if (sort) {
    bijective_vl_fullList = bijective_vl_fullList.sort((x, y) => x[1] - y[1]);
  }

  return currentBest;
}

const uniqAndSorted = arr => {
  const uniq = arr.reduce(
    (acc, n) => (acc.indexOf(n) >= 0 ? acc : [...acc, n]),
    [],
  );
  return uniq.sort((x, y) => x - y);
};

let theMatrix;
let outputMatrix;
let globalSource;
let globalTarget;

const pcsDistance = (x, y) => {
  let one = (x - y) % MODULUS;
  let two = (y - x) % MODULUS;
  one = adjustPythonModulus(one, MODULUS);
  two = adjustPythonModulus(two, MODULUS);
  return [one, two].sort((x, y) => x - y)[0];
};

export function build_matrix(sourceArg, targetArg, pcs = true) {
  let source = [...sourceArg];
  let target = [...targetArg];
  let distanceFunction;
  if (pcs) {
    source = [...source, source[0]];
    target = [...target, target[0]];
    distanceFunction = pcsDistance;
  } else {
    distanceFunction = (x, y) => Math.abs(x - y);
  }
  globalSource = source;
  globalTarget = target;
  theMatrix = [];
  for (let i = 0; i < target.length; i++) {
    const targetItem = target[i];
    theMatrix.push([]);
    for (let j = 0; j < source.length; j++) {
      const sourceItem = source[j];
      theMatrix[theMatrix.length - 1].push(
        distanceFunction(targetItem, sourceItem),
      );
    }
  }
  outputMatrix = _.cloneDeep(theMatrix);

  for (let i = 1; i < outputMatrix[0].length; i++) {
    outputMatrix[0][i] += outputMatrix[0][i - 1];
  }
  for (let i = 1; i < outputMatrix.length; i++) {
    outputMatrix[i][0] += outputMatrix[i - 1][0];
  }

  let iIdx = 0;
  let jIdx = 0;
  for (let i = 1; i < outputMatrix.length; i++) {
    iIdx++;
    for (let j = 1; j < outputMatrix[i].length; j++) {
      iIdx === 1 && jIdx++;
      outputMatrix[i][j] += [
        outputMatrix[i][j - 1],
        outputMatrix[i - 1][j],
        outputMatrix[i - 1][j - 1],
      ].sort((x, y) => x - y)[0];
    }
  }
  return outputMatrix[iIdx][jIdx] - theMatrix[iIdx][jIdx];
}

function find_matrix_vl() {
  const theVL = [];
  let i = outputMatrix.length - 1;
  let j = outputMatrix[i - 1].length - 1;
  theVL.push([globalSource[j], globalTarget[i]]);
  while (i > 0 || j > 0) {
    let newi = i;
    let newj = j;
    let myMin = VERYLARGENUMBER;
    if (i > 0 && j > 0) {
      newi = i - 1;
      newj = j - 1;
      myMin = outputMatrix[i - 1][j - 1];
      if (outputMatrix[i - 1][j] < myMin) {
        myMin = outputMatrix[i - 1][j];
        newj = j;
      }
      if (outputMatrix[i][j - 1] < myMin) {
        myMin = outputMatrix[i][j - 1];
        newi = i;
      }
      i = newi;
      j = newj;
    } else if (i > 0) {
      i -= 1;
    } else if (j > 0) {
      j -= 1;
    }
    theVL.push([globalSource[j], globalTarget[i]]);
  }
  return [...theVL].reverse();
}

export function nonbijective_vl(source, target, pcs = true) {
  let tempTarget;
  let curVL = [];
  let curSize = VERYLARGENUMBER;
  if (pcs) {
    source = source.map(x => x % MODULUS);
    target = target.map(x => x % MODULUS);
  }
  source = uniqAndSorted(source);
  target = uniqAndSorted(target);
  if (pcs) {
    for (let i = 0; i < target.length; i++) {
      tempTarget = [...target.slice(i), ...target.slice(0, i)];
      const newSize = build_matrix(source, tempTarget);
      if (newSize < curSize) {
        curSize = newSize;
        curVL = find_matrix_vl();
      }
    }
    curVL = curVL.slice(0, curVL.length - 1);
  } else {
    curSize = build_matrix(source, tempTarget);
    curVL = find_matrix_vl();
  }
  return [curSize, curVL];
}
