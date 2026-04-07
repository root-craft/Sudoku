const GRID_SIZE = 9;
const BOX_SIZE = 3;
const CELL_COUNT = 81;

function getRow(idx) {
  return Math.floor(idx / GRID_SIZE);
}

function getCol(idx) {
  return idx % GRID_SIZE;
}

function getBox(idx) {
  return Math.floor(getRow(idx) / BOX_SIZE) * BOX_SIZE + Math.floor(getCol(idx) / BOX_SIZE);
}

function getBoxStart(box) {
  const boxRow = Math.floor(box / BOX_SIZE);
  const boxCol = box % BOX_SIZE;
  return boxRow * GRID_SIZE * BOX_SIZE + boxCol * BOX_SIZE;
}

function getBoxIndices(box) {
  const start = getBoxStart(box);
  const indices = [];
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      indices.push(start + r * GRID_SIZE + c);
    }
  }
  return indices;
}

function getRowIndices(row) {
  const start = row * GRID_SIZE;
  return Array.from({ length: GRID_SIZE }, (_, i) => start + i);
}

function getColIndices(col) {
  return Array.from({ length: GRID_SIZE }, (_, i) => i * GRID_SIZE + col);
}

function getPeers(idx) {
  const peers = new Set();
  const row = getRow(idx);
  const col = getCol(idx);
  const box = getBox(idx);

  for (let i = 0; i < GRID_SIZE; i++) {
    peers.add(row * GRID_SIZE + i);
    peers.add(i * GRID_SIZE + col);
  }

  const boxStart = getBoxStart(box);
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      peers.add(boxStart + r * GRID_SIZE + c);
    }
  }

  peers.delete(idx);
  return peers;
}

const precomputedPeers = [];
for (let i = 0; i < CELL_COUNT; i++) {
  precomputedPeers.push([...getPeers(i)]);
}

export {
  GRID_SIZE,
  BOX_SIZE,
  CELL_COUNT,
  getRow,
  getCol,
  getBox,
  getBoxStart,
  getBoxIndices,
  getRowIndices,
  getColIndices,
  getPeers,
  precomputedPeers
};