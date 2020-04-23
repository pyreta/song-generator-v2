import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { dissocPath, assocPath, flatten } from 'ramda';
import PRC from './PianoRollCanvas';

const isRightClick = e => e.which === 3 || e.nativeEvent.which === 3;

const storage = {
  ringingNote: null,
  noteBeforeChange: null,
  selectionsBeforeChange: null,
  noteDelta: null,
};

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
volume
grid highlighting by chord
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
  onPianoKeyDown,
  onPianoKeyUp,
  onNotesChange,
}) => {
  // ************************* Refs *************************
  // ************************* Refs *************************
  // ************************* Refs *************************
  const noteRef = useRef();
  const gridRef = useRef();
  const pianoRef = useRef();
  const headerAndFooterRef = useRef();
  const noteClassRef = useRef();
  const selectionRef = useRef();

  // ************************* State *************************
  // ************************* State *************************
  // ************************* State *************************
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(800);
  const [pianoWidth, setPianoWidth] = useState(100);
  const [zoomX, setZoomX] = useState(500);
  const [zoomY, setZoomY] = useState(150);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [tool, setTool] = useState('edit');
  const [drawLength] = useState(128);
  const [drawVelocity] = useState(42);
  const [timeSignature] = useState([4, 8]);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [selectionCoords, setSelectionCoords] = useState(null);
  const changeScrollX = e => setScrollX(parseInt(e.target.value, 10));
  const changeScrollY = e => setScrollY(parseInt(e.target.value, 10));
  const changeZoomX = e => setZoomX(parseInt(e.target.value, 10));
  const changeZoomY = e => setZoomY(parseInt(e.target.value, 10));
  const changePianoWidth = e => setPianoWidth(parseInt(e.target.value, 10));

  // ************************* Variables *************************
  // ************************* Variables *************************
  // ************************* Variables *************************
  const zoomXAmount = zoomX / 100;
  const zoomYAmount = zoomY / 100;
  const maxScrollWidth = width * canvasWidthMultiple * zoomXAmount - width;
  const maxScrollHeight = height * canvasHeightMultiple * zoomYAmount - height;
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
    snapToGrid,
    chords,
    notes: updatedNotes,
  };

  // ************************* Effects *************************
  // ************************* Effects *************************
  // ************************* Effects *************************
  useEffect(() => {
    document.body.style.cursor = tool === 'edit' ? 'crosshair' : 'default';
  }, [tool]);

  useEffect(() => {
    const canvas = pianoRef.current;
    const pianoRoll = new PRC(canvas, opts);
    pianoRoll.drawPiano();
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
    const pianoRoll = new PRC(canvas, opts);
    pianoRoll.drawHeadersAndFooters();
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

  const deleteNote = ({ startTick, noteNum }) => {
    const delPath = dissocPath(
      [startTick.toString(), noteNum.toString()],
      notes,
    );
    onNotesChange(delPath);
  };

  const addNote = note => {
    onNotesChange(mergeNotes(note, notes));
  };

  const playSingleNote = noteNum => {
    if (noteNum === storage.ringingNote) return;
    console.log(`noteNum:`, noteNum);
    if (storage.ringingNote) {
      onPianoKeyUp(storage.ringingNote);
    }
    storage.ringingNote = noteNum;
    onPianoKeyDown(noteNum);
  };

  const snap = tick => {
    return snapToGrid ? Math.floor(tick / tickDivision) * tickDivision : tick;
  };

  const deselectAll = () => onNotesChange(noteClassRef.current.deselectAll());

  // ************************* Note ************************* handlers
  // ************************* Note ************************* handlers
  // ************************* Note ************************* handlers
  const onNoteDown = data => {
    storage.noteBeforeChange = data.noteClickedOn;
    if (storage.noteBeforeChange.isSelected) {
      storage.selectionsBeforeChange = seperateSelected(notes).selected;
    }
    if (tool === 'draw') {
      const newLength = snap(data.location) - data.noteClickedOn.startTick;
      deleteNote(data.noteClickedOn);
      storage.noteDelta = {
        length:
          newLength < tickDivision
            ? tickDivision - storage.noteBeforeChange.length
            : newLength - storage.noteBeforeChange.length,
      };
    } else {
      playSingleNote(data.noteNum);
      if (!data.noteClickedOn.isSelected) deselectAll();
    }
  };

  const onNoteDrag = data => {
    const newStartTick = snap(
      data.location - storage.noteBeforeChange.xOffsetTicks,
    );

    const newLength = snap(data.location) - storage.noteBeforeChange.startTick;
    if (storage.selectionsBeforeChange) {
      onNotesChange(seperateSelected(notes).notSelected);
    } else {
      deleteNote(storage.noteBeforeChange);
    }

    if (tool === 'edit') playSingleNote(data.noteNum);
    const { length, noteNum, startTick } = storage.noteBeforeChange;
    storage.noteDelta =
      tool === 'draw'
        ? {
            length:
              newLength < tickDivision
                ? tickDivision - length
                : newLength - length,
          }
        : {
            noteNum: data.noteNum - noteNum,
            startTick: newStartTick < 0 ? -startTick : newStartTick - startTick,
          };
  };

  const onNoteUp = () => {
    if (storage.noteDelta) {
      onNotesChange(updatedNotes);
      storage.noteDelta = null;
    }
    storage.noteBeforeChange = null;
    storage.selectionsBeforeChange = null;
  };

  const onNoteHover = data => {
    /* console.log(data.noteClickedOn)*/
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
      onNotesChange(notesWithSelections);
    }
  };

  const onGridHover = data => {
    /* console.log(data.location)*/
  };

  // ************************* Piano ************************* handlers
  // ************************* Piano ************************* handlers
  // ************************* Piano ************************* handlers
  const onPianoDown = data => playSingleNote(data.noteNum);
  const onPianoHover = data => {
    /* console.log(data.noteNum)*/
  };

  // ************************* GENERAL ************************* handlers
  // ************************* GENERAL ************************* handlers
  // ************************* GENERAL ************************* handlers
  const analyzeMousePosition = e => {
    const elem = noteRef.current;
    const rect = elem.getBoundingClientRect();
    const yOffset = rect.top;
    const xOffset = rect.left;
    const x = e.clientX - xOffset;
    const y = e.clientY - yOffset;
    if (!noteClassRef.current) {
      noteClassRef.current = new PRC(noteRef.current, opts);
    }
    return noteClassRef.current.at(x, y);
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
    setMouseIsDown(data);
    if (data.piano) return onPianoDown(data);
    if (data.noteClickedOn) return onNoteDown(data);
    return onGridDown(data);
  };

  const onMouseMove = e => {
    const data = analyzeMousePosition(e);
    if (mouseIsDown) {
      if (data.piano) onPianoDown(data);
      if (storage.noteBeforeChange) return onNoteDrag(data);
      return onGridDrag(data);
    }
    if (data.piano) return onPianoHover(data);
    if (data.noteClickedOn) return onNoteHover(data);
    return onGridHover(data);
  };

  useEffect(() => {
    const onMouseUp = e => {
      const data = analyzeMousePosition(e);
      if (storage.ringingNote) {
        onPianoKeyUp(storage.ringingNote);
        storage.ringingNote = null;
      }
      setMouseIsDown(false);
      if (storage.noteBeforeChange) return onNoteUp(data);
      onGridUp(data);
      return null;
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  });

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
          min={100}
          max={1000}
          onChange={changeZoomX}
          value={zoomX}
        />
        {`Zoom X: ${zoomXAmount}`}
      </div>
      <div>
        <input
          type="range"
          min={100}
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
        <button type="button" onClick={() => onNotesChange({})}>
          CLEAR
        </button>
      </Flex>

      <Wrapper onWheel={onWheel} style={{ width, height }}>
        <Canvas ref={gridRef} width={width} height={height} />
        <Canvas ref={noteRef} width={width} height={height} />
        <Canvas ref={selectionRef} width={width} height={height} />
        <Canvas ref={pianoRef} width={width} height={height} />
        <Canvas
          ref={headerAndFooterRef}
          width={width}
          height={height}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
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
  onPianoKeyDown: PropTypes.func.isRequired,
  onPianoKeyUp: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
};

export default PianoRoll;
