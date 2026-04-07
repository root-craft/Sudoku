export class Cell {
  constructor(index) {
    this.index = index;
    this.value = 0;
    this.notes = new Set();
    this.isGiven = false;
  }

  setValue(value) {
    this.value = value;
    if (value !== 0) {
      this.notes.clear();
    }
  }

  addNote(num) {
    if (this.value === 0) {
      this.notes.add(num);
    }
  }

  removeNote(num) {
    this.notes.delete(num);
  }

  clearNotes() {
    this.notes.clear();
  }

  clear() {
    this.value = 0;
    this.notes.clear();
  }

  isEmpty() {
    return this.value === 0;
  }

  hasNote(num) {
    return this.notes.has(num);
  }
}