import theme from '../../theme';

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
    this.w = width * zoomXAmount * canvasWidthMultiple - pianoWidth;
    this.h = height * zoomYAmount * canvasHeightMultiple;
    this.pianoWidth = pianoWidth;
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
    this.snapToGrid = snapToGrid;
    this.chords = chords;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawSelection({ x1, y1, x2, y2 }) {
    this.clear();
    this.ctx.fillStyle = 'rgba(0, 1, 127, 0.1';
    this.ctx.strokeStyle = theme.titles;
    this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  getNoteCoords(location, noteNum, length) {
    const x1 = this.ticksToPixels(location) + this.pianoWidth - this.scrollX;
    const x2 = x1 + this.ticksToPixels(length);
    const y1 = (this.topNote - noteNum) * this.cellheight - this.scrollY;
    const y2 = y1 + this.cellheight;
    return { x1, y1, x2, y2 };
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
    let hoveredNote;
    if (this.noteCoords) {
      this.noteCoords.forEach(coord => {
        if (
          x > coord.x &&
          x < coord.x + coord.width &&
          y > coord.y &&
          y < coord.y + coord.height
        ) {
          const [startTick, noteNum] = coord.path;
          hoveredNote = {
            ...this.notes[startTick][noteNum],
            startTick,
            noteNum,
            xOffsetTicks: this.pixelsToTicks(x - coord.x),
          };
        }
      });
    }
    return hoveredNote;
  }

  getRow(x, y) {
    return Math.floor((y + this.scrollY) / this.cellheight);
  }

  getNoteNumFromCoords(x, y) {
    const row = this.getRow(x, y);
    const note = this.rows - row + this.bottomNote - 1;
    return note;
  }

  at(x, y) {
    const column = (x + this.scrollX - this.pianoWidth) / this.cellwidth;
    const noteNum = this.getNoteNumFromCoords(x, y);
    const noteClickedOn = this.noteAt(x, y);
    return {
      noteClickedOn,
      noteNum,
      piano: x <= this.pianoWidth,
      newNote: {
        noteNum,
        startTick: Math.floor(column * 128) - 2,
        length: 128,
        velocity: 42,
      },
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

  drawNotesAtLocation(startTick, notes) {
    const coords = [];
    const x = this.ticksToPixels(startTick) - this.scrollX + this.pianoWidth;
    Object.keys(notes).forEach(noteNum => {
      const row = this.getNoteRow(noteNum);
      const width = this.ticksToPixels(parseInt(notes[noteNum].length, 10));
      const y = this.cellheight * row - this.scrollY;
      const height = this.cellheight;
      this.drawNote(x, y, width, height, notes[noteNum].isSelected);
      coords.push({ x, y, width, height, path: [startTick, noteNum] });
    });
    return coords;
  }

  drawNote(x, y, width, height, isSelected) {
    this.ctx.fillStyle = isSelected ? 'purple' : 'red';
    this.ctx.strokeStyle = theme.selected;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeRect(x, y, width, height);
  }

  drawNotes() {
    this.clear();
    const noteCoords = Object.keys(this.notes).reduce((acc, startTick) => {
      return [
        ...acc,
        ...this.drawNotesAtLocation(startTick, this.notes[startTick]),
      ];
    }, []);
    this.noteCoords = noteCoords;
    return this.noteCoords;
  }

  getLinesPerColumn() {
    if (this.cellwidth < 5) return 16;
    if (this.cellwidth < 15) return 8;
    if (this.cellwidth < 30) return 4;
    if (this.cellwidth < 70) return 2;
    if (this.cellwidth < 120) return 1;
    return 0.5;
  }

  drawGrid() {
    this.clear();
    const linesPerColumn = this.getLinesPerColumn();
    for (let row = 0; row < this.rows; row += 1) {
      const y = row * this.cellheight;
      for (let column = 0; column < this.columns; column += linesPerColumn) {
        const x = column * this.cellwidth;
        this.ctx.beginPath();
        if (row % 2) {
          this.ctx.fillStyle = theme.sections;
        } else {
          this.ctx.fillStyle = theme.background;
        }
        this.ctx.strokeStyle = theme.selected;
        this.ctx.rect(
          x - this.scrollX + this.pianoWidth,
          y - this.scrollY,
          this.cellwidth * linesPerColumn,
          this.cellheight,
        );
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
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
          this.ctx.fillStyle = theme.selected;
          break;
        default:
          this.ctx.fillStyle = theme.paragraph;
      }
      this.ctx.strokeStyle = theme.background;
      this.ctx.rect(0, y - this.scrollY, this.pianoWidth, this.cellheight);
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
    this.ctx.strokeStyle = theme.action;
    this.ctx.lineTo(x, this.h);
    this.ctx.shadowBlur = 0;
    this.ctx.stroke();
  }
}
export default PianoRollCanvas;
