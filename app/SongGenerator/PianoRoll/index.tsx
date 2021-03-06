import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import WebMidi from 'webmidi';
import { dissocPath, assocPath, flatten } from 'ramda';
import PRC from './PianoRollCanvas';
import useKeyDown from './useKeyDown';

const isRightClick = e => e.which === 3 || e.nativeEvent.which === 3;

const storage = {
  ringingNote: null,
  noteBeforeChange: null,
  selectionsBeforeChange: null,
  noteDelta: null,
  ringingChord: null,
  newIndeces: null,
  newLengths: null,
  ringingNotes: [],
  scrollXPercent: 0,
  scrollYPercent: 0,
  playheadPixelLocation: 0,
  lastData: [],
  playingNotes: Array(128).fill(null),
  undo: {},
};

const zoomXMax = 1100;

const mergeNotes = (notesToMerge, notes) => {
  if (!notesToMerge) return notes;
  return flatten([notesToMerge]).reduce((acc, noteToMerge) => {
    const { startTick, noteNum, ...lengthAndVelocity } = noteToMerge;
    return assocPath(
      [startTick.toString(), noteNum.toString()],
      lengthAndVelocity,
      acc,
    );
  }, notes);
};

const mergeWithDelta = (note, delta) => {
  if (!note || !delta) return null;
  return Object.keys(delta).reduce((acc, noteAttr) => {
    return {
      ...acc,
      [noteAttr]: note[noteAttr] + delta[noteAttr],
    };
  }, note);
};

const mergeSelectionsWithDelta = (notes, delta) => {
  if (!notes || !delta) return null;
  return notes.map(note => mergeWithDelta(note, delta));
};

const seperateSelected = notes => {
  const selected = [];
  const notSelected = Object.keys(notes).reduce((acc, location) => {
    const notesAtLoc = notes[location];
    return {
      ...acc,
      [location]: Object.keys(notesAtLoc).reduce((acc2, noteNum) => {
        const note = notesAtLoc[noteNum];
        if (note.isSelected) {
          selected.push({
            noteNum: parseInt(noteNum, 10),
            startTick: parseInt(location, 10),
            ...note,
          });
          return acc2;
        }
        return {
          ...acc2,
          [noteNum]: note,
        };
      }, {}),
    };
  }, {});
  return { selected, notSelected };
};

const Wrapper = styled.div`
  position: relative;
`;

const Flex = styled.div`
  display: flex;
`;

const Canvas = styled.canvas`
  border: 1px solid black;
  position: absolute;
`;

const YScroll = styled.input`
  -webkit-appearance: slider-vertical;
  height: ${({ height }) => height}px;
  width: 40px;
  transform: rotate(180deg);
  right: -40px;
  position: absolute;
`;

/*
TODO:
zoom behavior (stablized view and bugs)
*/

const PianoRoll = ({
  width,
  height,
  canvasWidthMultiple,
  canvasHeightMultiple,
  octaves,
  columns,
  columnsPerQuarterNote,
  notes,
  chords,
  outputOptions,
  outputId,
  onDeviceChange,
  onNotesChange,
  onChordReorder,
  onChordResize,
  playheadLocation,
  setPlayheadLocation,
  trackId,
  getCallBack,
  timeSignatures,
}) => {
  const updateNotes = (newNotes, addToHistory = true) => {
    if (addToHistory) {
      storage.undo[trackId].history.splice(storage.undo[trackId].index + 1);
      storage.undo[trackId].history.push(newNotes);
      storage.undo[trackId].index = storage.undo[trackId].history.length - 1;
    }
    onNotesChange(newNotes);
  };
  // ************************* Refs *************************
  // ************************* Refs *************************
  // ************************* Refs *************************
  const noteRef = useRef();
  const gridRef = useRef();
  const pianoRef = useRef();
  const headerAndFooterRef = useRef();
  const noteClassRef = useRef();
  const chordClassRef = useRef();
  const pianoClassRef = useRef();
  const selectionRef = useRef();
  const playheadRef = useRef();

  // ************************* State *************************
  // ************************* State *************************
  // ************************* State *************************
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(400);
  const [pianoWidth, setPianoWidth] = useState(100);
  const [zoomX, setZoomX] = useState(110);
  const [zoomY, setZoomY] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [tool, setTool] = useState('edit');
  const [cursor, setCursor] = useState('default');
  const [drawLength] = useState(128);
  const [drawVelocity] = useState(42);
  const [timeSignature] = useState([4, 16]);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [zoomToPlayhead, setZoomToPlayhead] = useState(true);
  const [selectionCoords, setSelectionCoords] = useState(null);
  const zoomXAmount = zoomX / 100;
  const zoomYAmount = zoomY / 100;
  const maxScrollWidth = width * canvasWidthMultiple * zoomXAmount - width;
  const maxScrollHeight = height * canvasHeightMultiple * zoomYAmount - height;
  const keysDown = useKeyDown();

  const pasteNotes = () => {
    const earliestTick = storage.clipboard
      .map(x => parseInt(x.startTick, 10))
      .sort((a, b) => a - b)[0];
    const delta = { startTick: playheadLocation - earliestTick };

    const newNotes = mergeNotes(
      mergeSelectionsWithDelta(storage.clipboard, delta),
      noteClassRef.current.deselectAll(),
    );
    updateNotes(newNotes);
  };

  const copyNotes = () => {
    const { selected, notSelected } = seperateSelected(notes);
    storage.clipboard = selected;
    return notSelected;
  };

  const cutNotes = () => updateNotes(copyNotes());

  const updateNotesFromHistory = () => {
    const newNotes = storage.undo[trackId].history[storage.undo[trackId].index];
    onNotesChange(newNotes);
  };

  const undo = () => {
    if (storage.undo[trackId].index > 0) {
      storage.undo[trackId].index -= 1;
      updateNotesFromHistory();
    }
  };

  const redo = () => {
    if (
      storage.undo[trackId].index <
      storage.undo[trackId].history.length - 1
    ) {
      storage.undo[trackId].index += 1;
      updateNotesFromHistory();
    }
  };

  useEffect(() => {
    if (!storage.undo[trackId]) {
      storage.undo = {
        ...storage.undo,
        [trackId]: {
          history: [],
          index: -1,
        },
      };
    }
  }, [trackId]);

  useEffect(() => {
    if (keysDown.Meta && keysDown.c) copyNotes();
  }, [keysDown.Meta, keysDown.c]);

  useEffect(() => {
    if (keysDown.Meta && keysDown.x) cutNotes();
  }, [keysDown.Meta, keysDown.x]);

  useEffect(() => {
    if (keysDown.Meta && keysDown.v) pasteNotes();
  }, [keysDown.Meta, keysDown.v]);

  useEffect(() => {
    if (keysDown.Meta && keysDown.z) {
      if (keysDown.Shift) {
        redo();
      } else {
        undo();
      }
    }
  }, [keysDown.Meta, keysDown.z]);

  useEffect(() => {
    if (keysDown.Meta && keysDown.a) {
      updateNotes(noteClassRef.current.selectAll());
    }
  }, [keysDown.Meta, keysDown.a]);

  useEffect(() => {
    if (maxScrollHeight > 0) storage.scrollYPercent = scrollY / maxScrollHeight;
  }, [scrollY, height]);

  useEffect(() => {
    setScrollY(maxScrollHeight * storage.scrollYPercent);
  }, [zoomY, maxScrollHeight]);

  const changeScrollX = e => {
    setZoomToPlayhead(false);
    setScrollX(parseInt(e.target.value, 10));
  };
  const changeScrollY = e => setScrollY(parseInt(e.target.value, 10));
  const changeZoomX = e => {
    setZoomToPlayhead(true);
    setZoomX(parseInt(e.target.value, 10));
  };
  const changeZoomY = e => setZoomY(parseInt(e.target.value, 10));
  const changePianoWidth = e => setPianoWidth(parseInt(e.target.value, 10));

  // ************************* Variables *************************
  // ************************* Variables *************************
  // ************************* Variables *************************
  const outputDevice = WebMidi.outputs.filter(o => o.id === outputId)[0];
  const tickDivision = (4 / timeSignature[1]) * 128;
  const selDelta = mergeSelectionsWithDelta(
    storage.selectionsBeforeChange,
    storage.noteDelta,
  );

  const selectionDeltaWithoutNegativeStartTicks = selDelta
    ? selDelta.map(d => {
        const minimum = selDelta.sort((a, b) => a.startTick - b.startTick)[0]
          .startTick;
        return {
          ...d,
          startTick: minimum < 0 ? d.startTick - minimum : d.startTick,
        };
      })
    : null;

  const updatedNotes = mergeNotes(
    selectionDeltaWithoutNegativeStartTicks ||
      mergeWithDelta(storage.noteBeforeChange, storage.noteDelta),
    notes,
  );

  const opts = {
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    octaves,
    columns,
    pianoWidth,
    columnsPerQuarterNote,
    playheadLocation,
    snapToGrid,
    zoomToPlayhead,
    timeSignatures,
    chords,
    playheadPixelLocation: storage.playheadPixelLocation,
    notes: updatedNotes,
  };

  // ************************* Effects *************************
  // ************************* Effects *************************
  // ************************* Effects *************************
  useEffect(() => {
    document.body.style.cursor = cursor || 'default';
  }, [cursor]);
  useEffect(() => {
    document.body.style.cursor = tool === 'edit' ? 'crosshair' : 'default';
  }, [tool]);

  useEffect(() => {
    const canvas = pianoRef.current;
    pianoClassRef.current = new PRC(canvas, opts);
    pianoClassRef.current.drawPiano();
  }, [
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    octaves,
    columns,
    pianoWidth,
    columnsPerQuarterNote,
    snapToGrid,
  ]);

  useEffect(() => {
    const canvas = headerAndFooterRef.current;
    chordClassRef.current = new PRC(canvas, opts);
    chordClassRef.current.drawHeadersAndFooters();
  }, [
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    octaves,
    columns,
    columnsPerQuarterNote,
    snapToGrid,
    pianoWidth,
    chords,
    timeSignatures,
  ]);

  useEffect(() => {
    const canvas = gridRef.current;
    const pianoRoll = new PRC(canvas, opts);
    pianoRoll.drawGrid();
  }, [
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    octaves,
    columns,
    pianoWidth,
    columnsPerQuarterNote,
    snapToGrid,
    chords,
    timeSignatures,
  ]);

  useEffect(() => {
    const canvas = playheadRef.current;
    const pianoRoll = new PRC(canvas, opts);
    const newXScrollValue = pianoRoll.drawPlayHead();
    if (zoomToPlayhead && Math.floor(newXScrollValue) !== Math.floor(scrollX)) {
      setScrollX(newXScrollValue < 0 ? 0 : newXScrollValue);
    }
  }, [
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    columns,
    pianoWidth,
    columnsPerQuarterNote,
    snapToGrid,
    playheadLocation,
  ]);

  useEffect(() => {
    const canvas = noteRef.current;
    const pianoRoll = new PRC(canvas, opts);
    noteClassRef.current = pianoRoll;
    noteClassRef.current.drawNotes();
  }, [
    scrollX,
    scrollY,
    zoomXAmount,
    zoomYAmount,
    width,
    height,
    canvasWidthMultiple,
    canvasHeightMultiple,
    octaves,
    columns,
    pianoWidth,
    columnsPerQuarterNote,
    snapToGrid,
    notes,
    storage.noteDelta,
  ]);

  useEffect(() => {
    getCallBack(({ noteVal, noteDown, complete, startTick }) => {
      if (complete) {
        storage.playingNotes = Array(128).fill(null);
      } else {
        storage.playingNotes[noteVal] = noteDown && startTick;
      }
      noteClassRef.current.drawNotes({
        highlightedNotes: storage.playingNotes,
      });
    });
  }, [noteClassRef.current]);

  useEffect(() => {
    const pianoRoll = new PRC(selectionRef.current, opts);
    if (selectionCoords) {
      pianoRoll.drawSelection(selectionCoords);
    } else {
      pianoRoll.clear();
    }
  }, [selectionCoords]);

  // ************************* Helpers *************************
  // ************************* Helpers *************************
  // ************************* Helpers *************************

  const onPianoKeyDown = (note, velocity) =>
    outputDevice.playNote([note], 1, { velocity: velocity || 0.5 });
  const onPianoKeyUp = note => outputDevice.stopNote([note], 1);

  const deleteNote = ({ startTick, noteNum }) => {
    const delPath = dissocPath(
      [startTick.toString(), noteNum.toString()],
      notes,
    );
    updateNotes(delPath, false);
  };

  const addNote = note => {
    updateNotes(mergeNotes(note, notes));
  };

  const playSingleNote = (noteNum, velocity) => {
    if (noteNum === storage.ringingNote) return;
    console.log(`noteNum:`, noteNum);
    if (storage.ringingNote) {
      onPianoKeyUp(storage.ringingNote);
    }
    storage.ringingNote = noteNum;
    onPianoKeyDown(noteNum, velocity);
  };

  const snap = tick => {
    return snapToGrid ? Math.floor(tick / tickDivision) * tickDivision : tick;
  };

  const ticksToPixels = tick => {
    const w = width * zoomXAmount * canvasWidthMultiple - pianoWidth;
    const cellwidth = w / columns;
    const ticksPerColumn = 128 / columnsPerQuarterNote;
    return parseInt(tick, 10) * (cellwidth / ticksPerColumn);
  };

  const snapPixels = tick => {
    const snappedTick = snap(tick);
    return ticksToPixels(snappedTick);
  };

  const deselectAll = () => updateNotes(noteClassRef.current.deselectAll());

  // ************************* Note ************************* handlers
  // ************************* Note ************************* handlers
  // ************************* Note ************************* handlers
  const onNoteDown = data => {
    storage.noteBeforeChange = data.noteAtLocation;
    if (storage.noteBeforeChange.isSelected) {
      storage.selectionsBeforeChange = seperateSelected(notes).selected;
    }
    if (tool === 'draw' || data.noteAtLocation.resize) {
      const newLength = snap(data.location) - data.noteAtLocation.startTick;
      deleteNote(data.noteAtLocation);
      storage.noteDelta = {
        length:
          newLength < tickDivision
            ? tickDivision - storage.noteBeforeChange.length
            : newLength - storage.noteBeforeChange.length,
      };
    } else {
      playSingleNote(data.noteNum, storage.noteBeforeChange.velocity / 100);
      if (!data.noteAtLocation.isSelected) deselectAll();
    }
  };

  const onNoteDrag = data => {
    const mouseMove = Math.abs(mouseIsDown.x - data.x);
    const newStartTick = snap(
      data.location - storage.noteBeforeChange.xOffsetTicks,
    );

    const newLength = snap(data.location) - storage.noteBeforeChange.startTick;
    if (storage.selectionsBeforeChange) {
      updateNotes(seperateSelected(notes).notSelected, false);
    } else {
      deleteNote(storage.noteBeforeChange);
    }

    if (tool === 'edit')
      playSingleNote(data.noteNum, storage.noteBeforeChange.velocity / 100);
    const { length, noteNum, startTick } = storage.noteBeforeChange;
    if (tool === 'draw' || storage.noteBeforeChange.resize) {
      const nooLen =
        newLength < tickDivision ? tickDivision - length : newLength - length;
      storage.noteDelta = {
        length: mouseMove < 7 ? 0 : nooLen,
      };
    } else {
      storage.noteDelta = {
        noteNum: data.noteNum - noteNum,
        startTick: newStartTick < 0 ? -startTick : newStartTick - startTick,
      };
    }
  };

  const onNoteUp = () => {
    if (storage.noteDelta) {
      updateNotes(updatedNotes);
      storage.noteDelta = null;
    }
    storage.noteBeforeChange = null;
    storage.selectionsBeforeChange = null;
  };

  const onNoteHover = data => {
    if (data.noteAtLocation.resize) {
      setCursor('ew-resize');
    } else {
      setCursor('default');
    }
  };

  // ************************* Grid ************************* handlers
  // ************************* Grid ************************* handlers
  // ************************* Grid ************************* handlers
  const onGridDown = data => {
    if (tool === 'draw') {
      storage.noteBeforeChange = {
        noteNum: data.noteNum,
        startTick: snap(data.location),
        length: drawLength,
        velocity: drawVelocity,
      };
      playSingleNote(data.noteNum);
      addNote(storage.noteBeforeChange);
    } else {
      deselectAll();
    }
  };

  const onGridDrag = data => {
    if (tool === 'edit' && !storage.noteBeforeChange) {
      const coords = {
        x1: mouseIsDown.x < data.x ? mouseIsDown.x : data.x,
        y1: mouseIsDown.y < data.y ? mouseIsDown.y : data.y,
        x2: mouseIsDown.x > data.x ? mouseIsDown.x : data.x,
        y2: mouseIsDown.y > data.y ? mouseIsDown.y : data.y,
      };
      if (coords.x1 < pianoWidth + 1) coords.x1 = pianoWidth + 1;
      if (coords.x2 - coords.x1 > 3 && coords.y2 - coords.y1 > 3) {
        setSelectionCoords(coords);
      }
    }
  };

  const onGridUp = () => {
    if (selectionCoords) {
      const notesWithSelections = noteClassRef.current.getNotesWithSelections(
        selectionCoords,
      );
      setSelectionCoords(null);
      updateNotes(notesWithSelections);
    }
  };

  const onGridHover = () => {
    if (tool === 'draw') {
      setCursor('default');
    } else {
      setCursor('crosshair');
    }
  };

  // ************************* Piano ************************* handlers
  // ************************* Piano ************************* handlers
  // ************************* Piano ************************* handlers
  const onPianoDown = data => playSingleNote(data.noteNum);
  const onPianoHover = () => {};

  // ************************* Velocity ************************* handlers
  // ************************* Velocity ************************* handlers
  // ************************* Velocity ************************* handlers

  const onVelocityDrag = data => {
    const newNotesAll = data.velocitiesAtLocation.reduce(
      (acc, { path: [location, pitch], velocity, noteNum }) => {
        storage.ringingNotes.push(noteNum);
        onPianoKeyDown(noteNum, velocity / 100);
        return {
          ...acc,
          [location]: {
            ...acc[location],
            [pitch]: {
              ...acc[location][pitch],
              velocity,
            },
          },
        };
      },
      notes,
    );

    updateNotes(newNotesAll);
  };

  // ************************* Measures (Bars) ************************* handlers
  // ************************* Measures (Bars) ************************* handlers
  // ************************* Measures (Bars) ************************* handlers

  const onMeasuresDown = data => {
    const snappedPlayheadLoc = data.location;
    const snappedPixels = ticksToPixels(data.location) - scrollX;
    storage.playheadPixelLocation = snappedPixels;
    setPlayheadLocation(snappedPlayheadLoc);
  };

  const onMeasuresDrag = data => {
    const yDelta = data.y - mouseIsDown.y;
    const yDelta2 = data.y - storage.lastData[0].y;
    const xDelta2 = data.x - storage.lastData[0].x;
    let newZoom = mouseIsDown.zoomX + yDelta;
    if (newZoom < 100 / canvasWidthMultiple)
      newZoom = 100 / canvasWidthMultiple;
    if (newZoom > zoomXMax) newZoom = zoomXMax;
    setZoomToPlayhead(true);
    if (Math.abs(yDelta2) > Math.abs(xDelta2)) {
      setZoomX(newZoom);
    } else {
      setPlayheadLocation(data.location);
      const snappedPixels = ticksToPixels(data.location) - scrollX;
      storage.playheadPixelLocation = snappedPixels;
    }
    storage.lastData.shift();
    storage.lastData.push({ x: data.x, y: data.y });
  };

  const onMeasuresHover = () => {
    setCursor('default');
  };

  // ************************* Chord ************************* handlers
  // ************************* Chord ************************* handlers
  // ************************* Chord ************************* handlers
  const onChordDown = data => {
    if (!data.chordIsPresent) return;
    storage.ringingChord = data.chord;
    storage.ringingChord = data.chord;
    storage.ringingChord.noteValues.map(n => onPianoKeyDown(n));
  };

  const onChordHover = data => {
    if (data.resize) {
      setCursor('ew-resize');
    } else {
      setCursor('default');
    }
  };

  const onChordDrag = e => {
    if (mouseIsDown && mouseIsDown.drawnChords) {
      const { x, y } = getCoords(e); // eslint-disable-line
      const draggingLeft = x < mouseIsDown.x;
      const leftOffset = mouseIsDown.x - storage.ringingChord.coords.x1;
      const rightOffset = storage.ringingChord.coords.x2 - mouseIsDown.x;
      const left = [];
      const right = [];

      mouseIsDown.drawnChords.forEach((chord, i) => {
        if (i === storage.ringingChord.index) return;
        const {
          coords: { x1, x2 },
        } = chord; // eslint-disable-line
        const chordLength = x2 - x1;
        const threshold = x1 + chordLength * (draggingLeft ? 0.3 : 0.7);
        const conditionMet = draggingLeft
          ? x - leftOffset < threshold
          : x + rightOffset <= threshold;
        if (conditionMet) {
          right.push(i);
        } else {
          left.push(i);
        }
      });
      storage.newIndeces = [...left, storage.ringingChord.index, ...right];

      const drawnChords = chordClassRef.current.drawHeadersAndFooters({
        draggingChordIndex: mouseIsDown.resize
          ? storage.ringingChord.index
          : left.length,
        newX: x - leftOffset,
        resize: mouseIsDown.resize,
        timeSignature,
        reorderedChords:
          !mouseIsDown.resize && storage.newIndeces.map(i => chords[i]),
      });
      if (mouseIsDown.resize)
        storage.newLengths = drawnChords.map(c => c.length);
    }
  };

  const onChordUp = () => {
    storage.ringingChord.noteValues.map(n => onPianoKeyUp(n));
    storage.ringingChord = null;
    if (storage.newIndeces) {
      if (storage.newLengths) {
        onChordResize(storage.newLengths);
      } else {
        onChordReorder(storage.newIndeces);
      }
      storage.newIndeces = null;
      storage.newLengths = null;
    }
  };

  // ************************* GENERAL ************************* handlers
  // ************************* GENERAL ************************* handlers
  // ************************* GENERAL ************************* handlers
  const getCoords = e => {
    const elem = noteRef.current;
    const rect = elem.getBoundingClientRect();
    const yOffset = rect.top;
    const xOffset = rect.left;
    return {
      x: e.clientX - xOffset,
      y: e.clientY - yOffset,
    };
  };

  const getCanvasDetails = (x, y) => {
    if (!noteClassRef.current) {
      noteClassRef.current = new PRC(noteRef.current, opts);
    }
    if (!chordClassRef.current) {
      chordClassRef.current = new PRC(headerAndFooterRef.current, opts);
    }
    return {
      ...noteClassRef.current.at(x, y),
      ...chordClassRef.current.chordAt(x, y),
    };
  };

  const analyzeMousePosition = e => {
    const { x, y } = getCoords(e);
    return getCanvasDetails(x, y);
  };

  const onWheel = e => {
    let changeX =
      scrollX + e.deltaX / canvasWidthMultiple < 0
        ? 0
        : scrollX + e.deltaX / canvasWidthMultiple;
    if (changeX > maxScrollWidth) changeX = maxScrollWidth;
    setScrollX(changeX);
    let changeY =
      scrollY + e.deltaY / canvasHeightMultiple < 0
        ? 0
        : scrollY + e.deltaY / canvasHeightMultiple;
    if (changeY > maxScrollHeight) changeY = maxScrollHeight;
    setScrollY(changeY);
  };

  const onRightClick = () => {
    setTool(tool === 'draw' ? 'edit' : 'draw');
  };

  const onMouseDown = e => {
    if (isRightClick(e)) return onRightClick(e);
    const data = analyzeMousePosition(e);
    const { x, y } = data;
    storage.lastData = [
      { x, y },
      { x, y },
      { x, y },
      { x, y },
      { x, y },
    ];
    setMouseIsDown({
      ...data,
      zoomX,
    });
    if (data.onChordHeader) return onChordDown(data);
    if (data.onMeasuresHeader) return onMeasuresDown(data);
    if (data.piano) return onPianoDown(data);
    if (data.velocity) return onVelocityDrag(data);
    if (data.noteAtLocation) return onNoteDown(data);
    return onGridDown(data);
  };

  useEffect(() => {
    const onMouseMove = e => {
      const data = analyzeMousePosition(e);
      if (pianoClassRef.current) {
        pianoClassRef.current.drawPiano({
          highlightedNote: data.noteNum,
          location: data.velocity && data.location, // <--- show cursor on hover
        });
      }
      if (storage.ringingChord) return onChordDrag(e);

      if (mouseIsDown) {
        if (data.piano) onPianoDown(data);
        if (mouseIsDown.onMeasuresHeader) return onMeasuresDrag(data);
        if (storage.noteBeforeChange) return onNoteDrag(data);
        if (data.velocity) return onVelocityDrag(data);
        return onGridDrag(data);
      }
      setZoomToPlayhead(false);
      if (data.piano) return onPianoHover(data);
      if (data.onMeasuresHeader) return onMeasuresHover(data);
      if (data.onChordHeader && data.chordIsPresent) return onChordHover(data);
      if (data.noteAtLocation) return onNoteHover(data);
      return onGridHover(data);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  });

  useEffect(() => {
    const onMouseUp = e => {
      if (storage.lastData.length) {
        storage.lastData = [];
        setPlayheadLocation(snap(playheadLocation));
        const snappedPixels = snapPixels(playheadLocation) - scrollX;
        storage.playheadPixelLocation = snappedPixels;
      }
      const data = analyzeMousePosition(e);
      storage.ringingNotes.forEach(noteNum => onPianoKeyUp(noteNum));
      if (storage.ringingNote) {
        onPianoKeyUp(storage.ringingNote);
        storage.ringingNote = null;
      }
      if (storage.ringingChord) {
        onChordUp(data);
      }
      setMouseIsDown(false);
      if (storage.noteBeforeChange) return onNoteUp(data);
      onGridUp(data);
      return null;
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  });

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Backspace') {
        updateNotes(seperateSelected(notes).notSelected);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [notes]);

  return (
    <div>
      <div>
        <input
          type="range"
          min={20}
          max={500}
          onChange={changePianoWidth}
          value={pianoWidth}
        />
        {`PianoWidth: ${pianoWidth}`}
      </div>
      <div>
        <input
          type="range"
          min={100 / canvasWidthMultiple}
          max={zoomXMax}
          onChange={changeZoomX}
          value={zoomX}
        />
        {`Zoom X: ${zoomXAmount}`}
      </div>
      <div>
        <input
          type="range"
          min={100 / canvasHeightMultiple}
          max={500}
          onChange={changeZoomY}
          value={zoomY}
        />
        {`Zoom Y: ${zoomYAmount}`}
      </div>
      <Flex>
        <div>
          <input
            type="checkbox"
            onChange={e => setSnapToGrid(e.target.checked)}
            checked={snapToGrid}
          />
          Snap to grid
        </div>
        <div>
          <input
            type="checkbox"
            onChange={e => setTool(e.target.checked ? 'draw' : 'edit')}
            checked={tool === 'draw'}
          />
          Draw
        </div>
        <select value={outputId} onChange={e => onDeviceChange(e.target.value)}>
          {outputOptions.map(({ name, id }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => console.log(notes)}>
          NOTES
        </button>
        <button type="button" onClick={() => updateNotes({})}>
          CLEAR
        </button>
        <button type="button" onClick={cutNotes}>CUT</button>
        <button type="button" onClick={copyNotes}>COPY</button>
        <button
          type="button"
          onClick={pasteNotes}>
          PASTE
        </button>
      </Flex>

      <Wrapper onWheel={onWheel} style={{ width, height }}>
        <Canvas ref={gridRef} width={width} height={height} />
        <Canvas ref={noteRef} width={width} height={height} />
        <Canvas ref={playheadRef} width={width} height={height} />
        <Canvas ref={selectionRef} width={width} height={height} />
        <Canvas ref={pianoRef} width={width} height={height} />
        <Canvas
          ref={headerAndFooterRef}
          width={width}
          height={height}
          onMouseDown={onMouseDown}
        />
        <div>
          <YScroll
            type="range"
            min={0}
            max={maxScrollHeight}
            height={height}
            onChange={changeScrollY}
            value={scrollY}
          />
        </div>
      </Wrapper>
      <div>
        <input
          type="range"
          min={0}
          max={maxScrollWidth}
          onChange={changeScrollX}
          value={scrollX}
          style={{ width, marginTop: 10 }}
        />
      </div>
    </div>
  );
};

PianoRoll.propTypes = {
  timeSignatures: PropTypes.object.isRequired, // eslint-disable-line
  notes: PropTypes.object.isRequired, // eslint-disable-line
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  octaves: PropTypes.number.isRequired,
  columns: PropTypes.number.isRequired,
  columnsPerQuarterNote: PropTypes.number.isRequired,
  canvasWidthMultiple: PropTypes.number.isRequired,
  canvasHeightMultiple: PropTypes.number.isRequired,
  outputOptions: PropTypes.array.isRequired, // eslint-disable-line
  chords: PropTypes.array.isRequired, // eslint-disable-line
  outputId: PropTypes.string.isRequired,
  onDeviceChange: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
  onChordReorder: PropTypes.func.isRequired,
  onChordResize: PropTypes.func.isRequired,
  playheadLocation: PropTypes.number.isRequired,
  setPlayheadLocation: PropTypes.func.isRequired,
  getCallBack: PropTypes.func.isRequired,
  trackId: PropTypes.string.isRequired,
};

export default PianoRoll;
