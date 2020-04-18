import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { dissocPath, assocPath } from 'ramda';
import PRC from './PianoRollCanvas';

const isRightClick = e => e.which === 3 || e.nativeEvent.which === 3;

const storage = {
  cachedNewNote: null,
  ringingNote: null,
  noteBeforeChange: null,
};

const mergeNotes = (noteToMerge, notes) => {
  if (!noteToMerge) return notes;
  const { startTick, noteNum, ...lengthAndVelocity } = noteToMerge;
  return assocPath(
    [startTick.toString(), noteNum.toString()],
    lengthAndVelocity,
    notes,
  );
};

const Wrapper = styled.div`
  position: relative;
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
group move
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
    notes: mergeNotes(storage.cachedNewNote, notes),
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
    storage.cachedNewNote,
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

  const addNote = (note, options = { deselect: true }) => {
    onNotesChange(
      mergeNotes(
        note,
        options.deselect ? noteClassRef.current.deselectAll() : notes,
      ),
    );
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
    if (tool === 'draw') {
      const newLength = snap(data.location) - data.noteClickedOn.startTick;
      const adjustedNote = {
        ...data.noteClickedOn,
        length: newLength < tickDivision ? tickDivision : newLength,
      };
      deleteNote(data.noteClickedOn);
      storage.cachedNewNote = adjustedNote;
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
    const newNote =
      tool === 'draw'
        ? {
            ...storage.noteBeforeChange,
            length: newLength < tickDivision ? tickDivision : newLength,
          }
        : {
            ...storage.noteBeforeChange,
            noteNum: data.noteNum,
            startTick: newStartTick < 0 ? 0 : newStartTick,
          };
    deleteNote(storage.noteBeforeChange);
    if (tool === 'edit') playSingleNote(data.noteNum);
    storage.cachedNewNote = newNote;
  };

  const onNoteUp = () => {
    if (storage.cachedNewNote) {
      addNote(storage.cachedNewNote, { deselect: false });
      storage.cachedNewNote = null;
    }
    storage.noteBeforeChange = null;
  };

  const onNoteHover = data => {
    /* console.log(data.noteClickedOn)*/
  };

  // ************************* Grid ************************* handlers
  // ************************* Grid ************************* handlers
  // ************************* Grid ************************* handlers
  const onGridDown = data => {
    if (tool === 'draw') {
      addNote({
        noteNum: data.noteNum,
        startTick: snap(data.location),
        length: drawLength,
        velocity: drawVelocity,
      });
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
      if (data.piano) return onPianoDown(data);
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
      setMouseIsDown(false);
      if (storage.noteBeforeChange) return onNoteUp(data);
      onGridUp(data);
      if (storage.ringingNote) {
        onPianoKeyUp(storage.ringingNote);
        storage.ringingNote = null;
      }
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
      <Wrapper onWheel={onWheel} style={{ width, height }}>
        <Canvas ref={gridRef} width={width} height={height} />
        <Canvas ref={noteRef} width={width} height={height} />
        <Canvas ref={selectionRef} width={width} height={height} />
        <Canvas
          ref={pianoRef}
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
  outputId: PropTypes.string.isRequired,
  onDeviceChange: PropTypes.func.isRequired,
  onPianoKeyDown: PropTypes.func.isRequired,
  onPianoKeyUp: PropTypes.func.isRequired,
  onNotesChange: PropTypes.func.isRequired,
};

export default PianoRoll;
