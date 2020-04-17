import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { dissocPath, assocPath } from 'ramda';
import PRC from './PianoRollCanvas';

let openNote;
let hoveredNote = {};
let selectedNote;
let newNote;
let xOffsetTicks;

const mergeNotes = (noteToMerge, notes) => {
  if (!noteToMerge) return notes;
  const { startTick, note, ...lengthAndVelocity } = noteToMerge;
  return assocPath([startTick, note], lengthAndVelocity, notes);
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
  const noteRef = useRef();
  const gridRef = useRef();
  const pianoRef = useRef();
  const coordRef = useRef();
  const selectionRef = useRef();
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(800);
  const [pianoWidth, setPianoWidth] = useState(100);
  const [zoomX, setZoomX] = useState(500);
  const [zoomY, setZoomY] = useState(150);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [timeSignature] = useState([4, 8]);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const zoomXAmount = zoomX / 100;
  const zoomYAmount = zoomY / 100;
  const changeScrollX = e => setScrollX(parseInt(e.target.value, 10));
  const changeScrollY = e => setScrollY(parseInt(e.target.value, 10));
  const changeZoomX = e => setZoomX(parseInt(e.target.value, 10));
  const changeZoomY = e => setZoomY(parseInt(e.target.value, 10));
  const changePianoWidth = e => setPianoWidth(parseInt(e.target.value, 10));

  const deleteNote = ({ startTick, note }) => {
    const delPath = dissocPath([startTick, note], notes);
    onNotesChange(delPath);
  };

  const addNote = note => {
    onNotesChange(mergeNotes(note, notes));
  };

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
    notes: mergeNotes(newNote, notes),
  };

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
  ]);

  useEffect(() => {
    const canvas = noteRef.current;
    const pianoRoll = new PRC(canvas, opts);
    coordRef.current = pianoRoll;
    coordRef.current.drawNotes();
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
    notes,
    newNote,
  ]);

  const maxScrollWidth = width * canvasWidthMultiple * zoomXAmount - width;
  const maxScrollHeight = height * canvasHeightMultiple * zoomYAmount - height;

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

  const analyzeMousePosition = e => {
    const elem = noteRef.current;
    const rect = elem.getBoundingClientRect();
    const yOffset = rect.top;
    const xOffset = rect.left;
    const x = e.clientX - xOffset;
    const y = e.clientY - yOffset;
    if (!coordRef.current) {
      coordRef.current = new PRC(noteRef.current, opts);
    }
    return coordRef.current.at(x, y);
  };

  const [selectionCoords, setSelectionCoords] = useState(null);

  const drawSquare = (downClick, currentPosition) => {
    const coords = {
      x1: downClick.x < currentPosition.x ? downClick.x : currentPosition.x,
      y1: downClick.y < currentPosition.y ? downClick.y : currentPosition.y,
      x2: downClick.x > currentPosition.x ? downClick.x : currentPosition.x,
      y2: downClick.y > currentPosition.y ? downClick.y : currentPosition.y,
    };
    setSelectionCoords(coords);
  };

  useEffect(() => {
    const pianoRoll = new PRC(selectionRef.current, opts);
    if (selectionCoords) {
      pianoRoll.drawSelection(selectionCoords)
    } else {
      pianoRoll.clear();
    }
  }, [selectionCoords])

  const clickPiano = note => {
    openNote = note;
    console.log(`note:`, note)
    onPianoKeyDown(note);
  };

  const onRightClick = e => {
    e.preventDefault();
    const data = analyzeMousePosition(e);
    setMouseIsDown(data);
    if (data.piano) {
      clickPiano(data.note);
    } else {
      const clickedNote = data.getNote();
      if (clickedNote) {
        deleteNote(clickedNote);
      }
    }
  };

  const onMouseDown = e => {
    if (e.nativeEvent.which === 3) {
      onRightClick(e);
      return;
    }
    const data = analyzeMousePosition(e);
    setMouseIsDown(data);
    if (data.piano) {
      clickPiano(data.note);
    } else {
      const clickedNote = data.getNote();
      if (clickedNote) {
        xOffsetTicks = clickedNote.xOffsetTicks;
        selectedNote = clickedNote;
      } else {
        onNotesChange(coordRef.current.deselectAll());
        // addNote(data.newNote);
      }
    }
  };

  const onMouseMove = e => {
    const data = analyzeMousePosition(e);
    if (mouseIsDown) {
      if (data.piano) {
        if (data.note !== openNote) {
          onPianoKeyUp(openNote);
          clickPiano(data.note);
        }
      } else if (selectedNote) {
        const { velocity, length } = selectedNote;
        const trueStartTick = data.newNote.startTick - xOffsetTicks;
        const tickDivision = (4 / timeSignature[1]) * 128;
        const startTick = snapToGrid
          ? Math.floor(trueStartTick / tickDivision) * tickDivision
          : trueStartTick;
        newNote = {
          ...data.newNote,
          velocity,
          length,
          startTick: startTick < 0 ? 0 : startTick,
        };
        deleteNote(selectedNote);
      } else {
        drawSquare(mouseIsDown, data);
      }
      hoveredNote = {};
    } else {
      const note = data.getNote();
      if (!note) {
        hoveredNote = {};
        return;
      }
      if (
        !note ||
        (hoveredNote.startTick === note.startTick &&
          note.note === hoveredNote.note)
      ) {
        return;
      }
      hoveredNote = note;
      // console.log(`hoveredNote:`, hoveredNote);
    }
  };

  useEffect(() => {
    const onMouseUp = () => {
      setMouseIsDown(false);
      if (selectionCoords) {
        const notesWithSelections = coordRef.current.getNotesWithSelections(selectionCoords);
        setSelectionCoords(null);
        console.log(`notesWithSelections:`, notesWithSelections)
        onNotesChange(notesWithSelections)
      }
      if (newNote) {
        addNote(newNote);
      }
      selectedNote = null;
      newNote = null;
      if (openNote) {
        onPianoKeyUp(openNote);
        openNote = null;
      }
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

      <select value={outputId} onChange={e => onDeviceChange(e.target.value)}>
        {outputOptions.map(({ name, id }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

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
