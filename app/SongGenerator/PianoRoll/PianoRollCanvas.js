const colors = {
  root: 'rgb(54, 41, 49)',
  third: 'rgb(58, 51, 24)',
  // fifth: 'rgb(27, 55, 72)',
  fifth: 'rgb(27, 72, 100)',
  seventh: 'rgb(24, 55, 58)',
  line: '#17242D',
  background: '#09161D',
  noteSelected: 'yellow',
  note: 'red',
  blackKey: 'rgb(27, 55, 72)',
  whiteKey: '#BDC2C4',
  selection: 'rgba(0, 1, 127, 0.1',
  playHead: 'rgb(15, 168, 209)',
  border1: 'orange',
  border2: 'rgb(27, 55, 72)',
  border3: '#FFFFFF',
  scale: '#2B383F',
  chord: '#484842',
};

const chordColors = [
  'rgb(221, 40, 87)',
  'rgb(255, 251, 133)',
  'rgb(118, 141, 170)',
  'rgb(51, 219, 207)',
  'rgb(107, 176, 141)',
  'red',
  'rgb(15,168,209)',
  'yellow',
  'red',
  'orange',
  'purple',
  '#ffa54f',
  '#FF7F50',
  '#ffdab9',
  '#b5f6da',
];

function rectsIntersect(r1, r2) {
  return !(r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y1);
}

class PianoRollCanvas {
  constructor(
    canvas,
    {
      octaves = 7,
      columns = 64,
      pianoWidth = 100,
      barsHeight = 20,
      chordsHeight = 40,
      velocityHeight = 100,
      columnsPerQuarterNote = 1,
      scrollX = 0,
      scrollY = 0,
      zoomXAmount = 1,
      zoomYAmount = 1,
      width = 800,
      height = 800,
      bottomNote = 12,
      canvasWidthMultiple = 10,
      canvasHeightMultiple = 10,
      snapToGrid = false,
      chords = [],
      notes,
    } = {},
  ) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.headerHeight = barsHeight + chordsHeight;
    this.w = width * zoomXAmount * canvasWidthMultiple - pianoWidth;
    this.h =
      height * zoomYAmount * canvasHeightMultiple -
      this.headerHeight -
      velocityHeight;
    this.pianoWidth = pianoWidth;
    this.barsHeight = barsHeight;
    this.chordsHeight = chordsHeight;
    this.velocityHeight = velocityHeight;
    this.rows = octaves * 12;
    this.notes = notes;
    this.columns = columns;
    this.octaves = octaves;
    this.ticksPerColumn = 128 / columnsPerQuarterNote;
    this.cellwidth = this.w / columns;
    this.cellheight = this.h / this.rows;
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.zoomXAmount = zoomXAmount;
    this.zoomYAmount = zoomYAmount;
    this.bottomNote = bottomNote;
    this.topNote = this.octaves * 12 + this.bottomNote - 1;
    this.canvasWidthMultiple = canvasWidthMultiple;
    this.canvasHeightMultiple = canvasHeightMultiple;
    this.noteCoords = null;
    this.chordCoords = null;
    this.snapToGrid = snapToGrid;
    this.chords = chords;
    this.velocityHeighPercent = 0.96;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawSelection({ x1, y1, x2, y2 }) {
    this.clear();
    this.ctx.fillStyle = colors.selection;
    this.ctx.strokeStyle = colors.border3;
    this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  getNoteCoords(location, noteNum, length) {
    const x1 = this.ticksToPixels(location) + this.pianoWidth - this.scrollX;
    const x2 = x1 + this.ticksToPixels(length);
    const y1 =
      (this.topNote - noteNum) * this.cellheight -
      this.scrollY +
      this.headerHeight;
    const y2 = y1 + this.cellheight;
    return { x1, y1, x2, y2 };
  }

  snap(tick, timeSignature) {
    const tickDivision = (4 / timeSignature[1]) * 128;
    return this.snapToGrid
      ? Math.floor(tick / tickDivision) * tickDivision
      : tick;
  }

  setSelections(val) {
    return Object.keys(this.notes).reduce((acc, location) => {
      const notesAtLoc = this.notes[location];
      return {
        ...acc,
        [location]: Object.keys(notesAtLoc).reduce((acc2, noteNum) => {
          const note = notesAtLoc[noteNum];
          return {
            ...acc2,
            [noteNum]: {
              ...note,
              isSelected:
                typeof val === 'function'
                  ? val({ location, noteNum, ...note })
                  : val,
            },
          };
        }, {}),
      };
    }, {});
  }

  getNotesWithSelections(coords) {
    const fn = ({ location, noteNum, length }) =>
      rectsIntersect(this.getNoteCoords(location, noteNum, length), coords);
    return this.setSelections(fn);
  }

  selectAll() {
    return this.setSelections(true);
  }

  deselectAll() {
    return this.setSelections(false);
  }

  noteAt(x, y) {
    if (x <= this.pianoWidth) return [null, []];
    let noteAtLocation;
    const velocitiesAtLocation = [];
    if (this.noteCoords) {
      this.noteCoords.forEach(coord => {
        const [startTick, noteNum] = coord.path;
        if (
          x >= coord.x &&
          x < coord.x + 5 &&
          y > this.canvas.height - this.velocityHeight
        ) {
          const clickHeight = this.canvas.height - y;
          const vel =
            (clickHeight / (this.velocityHeight * this.velocityHeighPercent)) *
            100;
          velocitiesAtLocation.push({ path: coord.path, velocity: vel, noteNum });
        }
        if (
          y < this.canvas.height - this.velocityHeight &&
          x > coord.x &&
          x < coord.x + coord.width &&
          y > coord.y &&
          y < coord.y + coord.height
        ) {
          noteAtLocation = {
            ...this.notes[startTick][noteNum],
            startTick: parseInt(startTick, 10),
            noteNum: parseInt(noteNum, 10),
            xOffsetTicks: this.pixelsToTicks(x - coord.x),
          };
        }
      });
    }
    return [noteAtLocation, velocitiesAtLocation];
  }

  chordAt(x, y) {
    let chordIdx;
    let chord;
    let resize;
    this.chords.forEach((c, i) => {
      if (!c.coords) return;
      const { x1, x2 } = c.coords;
      if (x >= x1 && x < x2) {
        chordIdx = i;
        chord = c;
        resize = x > x2 - 10;
      }
    });

    return {
      chordIdx,
      chord,
      resize,
      drawnChords: this.chords,
      chordIsPresent: chordIdx !== undefined,
      onChordHeader: y < this.chordsHeight,
    };
  }

  getRow(x, y) {
    return Math.floor((y + this.scrollY - this.headerHeight) / this.cellheight);
  }

  getNoteNumFromCoords(x, y) {
    const row = this.getRow(x, y);
    const note = this.rows - row + this.bottomNote - 1;
    return note;
  }

  at(x, y) {
    const column = (x + this.scrollX - this.pianoWidth) / this.cellwidth;
    const piano = x <= this.pianoWidth;
    const velocity = y > this.canvas.height - this.velocityHeight;
    const noteNum = this.getNoteNumFromCoords(x, y);
    const [noteAtLocation, velocitiesAtLocation] = this.noteAt(x, y);
    const location = Math.floor(column * 128) - 2;
    return {
      noteAtLocation,
      velocitiesAtLocation,
      noteNum,
      location,
      piano,
      velocity,
      x,
      y,
    };
  }

  ticksToPixels(ticks) {
    return parseInt(ticks, 10) * (this.cellwidth / this.ticksPerColumn);
  }

  pixelsToTicks(pixels) {
    const pixelsPerTick = this.cellwidth / 128;
    const ticks = Math.floor(pixels / pixelsPerTick) - 2;
    return ticks < 0 ? 0 : ticks;
  }

  getNoteRow(noteNum) {
    return this.rows - parseInt(noteNum, 10) + this.bottomNote - 1;
  }

  drawNotesAtLocation(startTick, notes, velocity) {
    const coords = [];
    const x = this.ticksToPixels(startTick) - this.scrollX + this.pianoWidth;
    Object.keys(notes).forEach(noteNum => {
      const row = this.getNoteRow(noteNum);
      const width = this.ticksToPixels(parseInt(notes[noteNum].length, 10));
      const y = this.cellheight * row - this.scrollY + this.headerHeight;
      const height = this.cellheight;
      this.drawNote(
        x,
        y,
        width,
        height,
        notes[noteNum].isSelected,
        velocity ? notes[noteNum].velocity : null,
      );
      coords.push({ x, y, width, height, path: [startTick, noteNum] });
    });
    return coords;
  }

  getVelocityHeight(velocity) {
    return this.velocityHeight * this.velocityHeighPercent * (velocity / 100);
  }

  drawNote(x, y, width, height, isSelected, velocity) {
    this.ctx.fillStyle = isSelected ? colors.noteSelected : colors.note;
    this.ctx.strokeStyle = isSelected ? colors.border1 : colors.border2;
    if (velocity) {
      const volheight = this.getVelocityHeight(velocity);
      this.ctx.fillRect(x, this.canvas.height - volheight, 3, volheight);
    } else {
      this.ctx.fillRect(x, y, width, height);
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  drawNotes(velocity) {
    if (!velocity) {
      this.clear();
    }
    const noteCoords = Object.keys(this.notes).reduce((acc, startTick) => {
      return [
        ...acc,
        ...this.drawNotesAtLocation(startTick, this.notes[startTick], velocity),
      ];
    }, []);
    if (!velocity) this.noteCoords = noteCoords;
    return noteCoords;
  }

  getLinesPerColumn() {
    if (this.cellwidth < 5) return 16;
    if (this.cellwidth < 15) return 8;
    if (this.cellwidth < 30) return 4;
    if (this.cellwidth < 70) return 2;
    if (this.cellwidth < 120) return 1;
    return 0.5;
  }

  getNoteNumFromRow(row) {
    return this.rows - row + this.bottomNote - 1;
  }

  drawBars(drawEvery, color, lineWidth) {
    for (let column = 1; column <= this.columns; column += 1) {
      if (column % drawEvery === 0) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(
          column * this.cellwidth + this.pianoWidth - this.scrollX,
          0,
        );
        this.ctx.lineWidth = lineWidth || 1;
        this.ctx.lineTo(
          column * this.cellwidth + this.pianoWidth - this.scrollX,
          this.h,
        );
        this.ctx.stroke();
      }
    }
  }

  drawMeasuresGrid() {
    this.drawBars(2, colors.line);
    this.drawBars(4, colors.background);
  }

  drawChordGrid() {
    let startTick = 0;
    this.chords.forEach(chord => {
      const chordPixelLength = this.ticksToPixels(chord.length);
      for (let row = 0; row < this.rows; row += 1) {
        const y = row * this.cellheight + this.headerHeight;
        const x = startTick;
        this.ctx.beginPath();
        const rowNote = this.getNoteNumFromRow(row);
        const modulod =
          (rowNote - (chord.key % chord.scale.length)) % chord.scale.length;
        if (chord.scale[modulod]) {
          this.ctx.fillStyle = colors[chord.scale[modulod]] || colors.chord;
          const rectX = x - this.scrollX + this.pianoWidth;
          const rectY = y - this.scrollY;
          this.ctx.rect(rectX, rectY, chordPixelLength, this.cellheight);
          this.ctx.fill();
          if (rowNote % 12 === chord.key) {
            this.ctx.fillStyle = colors.border1;
            this.ctx.fillRect(
              rectX,
              rectY + this.cellheight - 3,
              chordPixelLength,
              3,
            );
          }
        }
      }
      startTick += chordPixelLength;
    });
  }

  drawChord(chord, rectX, idx, draggingChordIndex) {
    const chordPixelLength = this.ticksToPixels(chord.length);
    this.ctx.fillStyle =
      idx === draggingChordIndex ? colors.background : chordColors[chord.root];
    this.ctx.fillRect(rectX, 0, chordPixelLength, this.chordsHeight);
    this.ctx.fillStyle = colors.background;
    this.ctx.strokeRect(rectX, 0, chordPixelLength, this.chordsHeight);
    this.ctx.font = '18px Helvetica';
    this.ctx.textAlign = 'center';
    const chordName = `${chord.name} (${chord.romanNumeral})`;
    const textWidth = this.ctx.measureText(chordName).width;
    const name =
      chordPixelLength < textWidth + 100 ? chord.abreviation : chordName;
    this.ctx.fillText(
      name,
      rectX + chordPixelLength / 2,
      this.chordsHeight / 2 + 5,
    );
    return {
      ...chord,
      index: idx,
      coords: { x1: rectX, x2: rectX + chordPixelLength },
    };
  }

  drawChordHeader({
    draggingChordIndex,
    newX,
    reorderedChords,
    resize,
    timeSignature,
  }) {
    let startTick = 0;
    const withCoords = [];
    (reorderedChords || this.chords).forEach((chord, idx) => {
      let chordLengthDelta = 0;
      const rectX = startTick - this.scrollX + this.pianoWidth;
      if (resize && idx === draggingChordIndex) {
        const pixelDelta = newX - rectX;
        const tickDelta = this.snap(
          this.pixelsToTicks(Math.abs(pixelDelta)),
          timeSignature,
        );
        chordLengthDelta = pixelDelta < 0 ? -tickDelta : tickDelta;
      }
      const drawnChord = this.drawChord(
        {
          ...chord,
          length: chord.length + chordLengthDelta,
        },
        rectX,
        idx,
        resize ? null : draggingChordIndex,
      );
      withCoords.push(drawnChord);
      startTick += drawnChord.coords.x2 - drawnChord.coords.x1;
    });
    if (newX && !resize) {
      this.drawChord(withCoords[draggingChordIndex], newX, draggingChordIndex);
    }
    if (!reorderedChords && !resize) this.chords = withCoords;
    return withCoords;
  }

  drawGrid() {
    this.clear();
    this.ctx.fillStyle = colors.background;
    this.ctx.rect(0, 0, this.w, this.h);
    this.ctx.fill();
    this.drawChordGrid();
    this.drawMeasuresGrid();
  }

  drawHeadersAndFooters(opts = {}) {
    this.clear();
    this.ctx.fillStyle = colors.background;
    this.ctx.fillRect(0, 0, this.w, this.headerHeight);
    this.drawMeasuresHeader();
    const drawnChords = this.drawChordHeader(opts);
    this.drawVelocity();
    this.ctx.fillStyle = colors.scale;
    this.ctx.fillRect(0, 0, this.pianoWidth, this.headerHeight);
    return drawnChords;
  }

  drawMeasuresHeader() {
    this.ctx.fillStyle = colors.whiteKey;
    this.ctx.fillRect(
      this.pianoWidth,
      this.chordsHeight,
      this.w,
      this.barsHeight,
    );
  }

  drawVelocity() {
    this.ctx.fillStyle = colors.scale;
    this.ctx.fillRect(
      0,
      this.canvas.height - this.velocityHeight,
      this.pianoWidth,
      this.canvas.height,
    );
    this.ctx.fillStyle = colors.whiteKey;
    this.ctx.strokeStyle = colors.blackKey;
    this.ctx.fillRect(
      this.pianoWidth,
      this.canvas.height - this.velocityHeight,
      this.w,
      this.canvas.height,
    );
    this.ctx.strokeRect(
      this.pianoWidth,
      this.canvas.height - this.velocityHeight,
      this.w,
      this.canvas.height,
    );
    this.drawNotes(true);
  }

  drawPiano() {
    this.clear();
    for (let row = 0; row < this.rows; row += 1) {
      const y = row * this.cellheight;
      this.ctx.beginPath();
      switch (this.bottomNote - 1 - (row % 12)) {
        case 1:
        case 3:
        case 6:
        case 8:
        case 10:
          this.ctx.fillStyle = colors.blackKey;
          break;
        default:
          this.ctx.fillStyle = colors.whiteKey;
      }
      this.ctx.strokeStyle = colors.line;
      this.ctx.rect(
        0,
        y - this.scrollY + this.headerHeight,
        this.pianoWidth,
        this.cellheight,
      );
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  drawPlayHead(startTick) {
    const x = this.ticksToPixels(startTick);
    this.resizeCanvasToDisplaySize();
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = colors.playHead;
    this.ctx.lineTo(x, this.h);
    this.ctx.shadowBlur = 0;
    this.ctx.stroke();
  }
}
export default PianoRollCanvas;
