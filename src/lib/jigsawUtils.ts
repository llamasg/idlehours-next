import {
  type PieceShape,
  CELL_SIZE,
  PIECE_SHAPES,
  complement,
} from './jigsawShapes'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PieceState {
  id: string // e.g. "piece_3_2" (col_row)
  col: number
  row: number
  x: number // current world position
  y: number
  shapeId: string // references PieceShape.id from jigsawShapes.ts
  clusterId: string // which cluster this piece belongs to
  locked: boolean // true when snapped to correct absolute grid position
}

export interface Cluster {
  id: string
  pieceIds: string[]
}

export interface SnapResult {
  targetPieceId: string
  snapX: number
  snapY: number
}

// ---------------------------------------------------------------------------
// assignShapes
// ---------------------------------------------------------------------------

/**
 * Pick a random element from an array.
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Greedy shape assignment with edge-aware constraints.
 *
 * Our SVG set requires:
 *   – Right-edge cells (right=F) need left=B  → col=cols-2 must emit right=T
 *   – Bottom-edge cells (bottom=F) need top=B → row=rows-2 must emit bottom=T
 *
 * We enforce these as hard constraints on the penultimate column/row and
 * retry the whole grid (cheap — O(n)) if any cell has zero candidates.
 */
function tryAssign(
  cols: number,
  rows: number,
): Map<string, PieceShape> | null {
  const map = new Map<string, PieceShape>()

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const above = row > 0 ? map.get(`${col}_${row - 1}`) : undefined
      const leftPiece = col > 0 ? map.get(`${col - 1}_${row}`) : undefined

      const requiredTop = row === 0 ? 'F' : complement(above!.bottom)
      const requiredLeft = col === 0 ? 'F' : complement(leftPiece!.right)
      const needFlatBottom = row === rows - 1
      const needFlatRight = col === cols - 1

      let candidates = PIECE_SHAPES.filter(
        (s) =>
          s.top === requiredTop &&
          s.left === requiredLeft &&
          (needFlatBottom ? s.bottom === 'F' : s.bottom !== 'F') &&
          (needFlatRight ? s.right === 'F' : s.right !== 'F'),
      )

      // Penultimate column: force right=T so next col (right edge) gets left=B
      if (col === cols - 2 && !needFlatRight) {
        const forced = candidates.filter((s) => s.right === 'T')
        if (forced.length > 0) candidates = forced
      }

      // Penultimate row: force bottom=T so next row (bottom edge) gets top=B
      if (row === rows - 2 && !needFlatBottom) {
        const forced = candidates.filter((s) => s.bottom === 'T')
        if (forced.length > 0) candidates = forced
      }

      if (candidates.length === 0) return null // dead end — retry whole grid

      map.set(`${col}_${row}`, pickRandom(candidates))
    }
  }

  return map
}

/**
 * Assigns a PieceShape to each grid cell satisfying edge complement rules.
 * Uses greedy assignment with fast full-grid retries (each attempt is O(n)).
 */
export function assignShapes(
  cols: number,
  rows: number,
): Map<string, PieceShape> {
  for (let attempt = 0; attempt < 500; attempt++) {
    const result = tryAssign(cols, rows)
    if (result) return result
  }
  throw new Error('Cannot assign shapes — not enough SVG variants')
}

// ---------------------------------------------------------------------------
// generatePuzzleGrid
// ---------------------------------------------------------------------------

/**
 * Creates the initial puzzle state with randomly scattered pieces,
 * each in its own cluster.
 */
export function generatePuzzleGrid(
  cols: number,
  rows: number,
): { pieces: PieceState[]; clusters: Cluster[] } {
  const shapeMap = assignShapes(cols, rows)
  const pieces: PieceState[] = []
  const clusters: Cluster[] = []

  const totalPieces = cols * rows
  // Scatter pieces densely — like tipped out of a box
  const scatterW = cols * CELL_SIZE * 2.5
  const scatterH = rows * CELL_SIZE * 2.5
  // Offset scatter area to the right of the target zone
  const offsetX = cols * CELL_SIZE + 200

  let index = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `piece_${col}_${row}`
      const clusterId = `cluster_${col}_${row}`
      const shape = shapeMap.get(`${col}_${row}`)!

      // Random position within the scatter area
      const x = offsetX + Math.random() * scatterW
      const y = Math.random() * scatterH

      pieces.push({
        id,
        col,
        row,
        x,
        y,
        shapeId: shape.id,
        clusterId,
        locked: false,
      })

      clusters.push({
        id: clusterId,
        pieceIds: [id],
      })

      index++
    }
  }

  return { pieces, clusters }
}

// ---------------------------------------------------------------------------
// getNeighbourCoords
// ---------------------------------------------------------------------------

/**
 * Returns up to 4 adjacent grid coordinates (no bounds filtering — callers
 * should filter based on their grid dimensions).
 */
export function getNeighbourCoords(
  col: number,
  row: number,
): Array<{ col: number; row: number }> {
  return [
    { col: col - 1, row },
    { col: col + 1, row },
    { col, row: row - 1 },
    { col, row: row + 1 },
  ]
}

// ---------------------------------------------------------------------------
// checkSnap
// ---------------------------------------------------------------------------

/**
 * Checks whether the dragged piece is close enough to snap to a neighbouring
 * piece. Returns the first valid snap, or null.
 */
export function checkSnap(
  draggedPiece: PieceState,
  allPieces: PieceState[],
  cols: number,
  rows: number,
  threshold: number = 20,
): SnapResult | null {
  const neighbours = getNeighbourCoords(draggedPiece.col, draggedPiece.row)

  for (const n of neighbours) {
    if (n.col < 0 || n.col >= cols || n.row < 0 || n.row >= rows) continue

    const neighbourPiece = allPieces.find(
      (p) => p.col === n.col && p.row === n.row,
    )
    if (!neighbourPiece) continue

    // Where the dragged piece should be relative to this neighbour
    const expectedX =
      neighbourPiece.x + (draggedPiece.col - neighbourPiece.col) * CELL_SIZE
    const expectedY =
      neighbourPiece.y + (draggedPiece.row - neighbourPiece.row) * CELL_SIZE

    const dx = draggedPiece.x - expectedX
    const dy = draggedPiece.y - expectedY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < threshold) {
      return {
        targetPieceId: neighbourPiece.id,
        snapX: expectedX,
        snapY: expectedY,
      }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// mergeClusters
// ---------------------------------------------------------------------------

/**
 * Merges the clusters containing pieceA and pieceB into one.
 * Returns updated clusters and pieces arrays (immutable — new references).
 */
export function mergeClusters(
  clusters: Cluster[],
  pieces: PieceState[],
  pieceAId: string,
  pieceBId: string,
): { clusters: Cluster[]; pieces: PieceState[] } {
  const clusterA = clusters.find((c) => c.pieceIds.includes(pieceAId))
  const clusterB = clusters.find((c) => c.pieceIds.includes(pieceBId))

  if (!clusterA || !clusterB) return { clusters, pieces }
  if (clusterA.id === clusterB.id) return { clusters, pieces }

  const mergedCluster: Cluster = {
    id: clusterA.id,
    pieceIds: [...clusterA.pieceIds, ...clusterB.pieceIds],
  }

  const affectedIds = new Set(mergedCluster.pieceIds)

  const newClusters = clusters
    .filter((c) => c.id !== clusterA.id && c.id !== clusterB.id)
    .concat(mergedCluster)

  const newPieces = pieces.map((p) =>
    affectedIds.has(p.id) ? { ...p, clusterId: mergedCluster.id } : p,
  )

  return { clusters: newClusters, pieces: newPieces }
}

// ---------------------------------------------------------------------------
// movePiecesInCluster
// ---------------------------------------------------------------------------

/**
 * Moves all pieces in the given cluster by (deltaX, deltaY).
 * Locked pieces are skipped (they cannot move).
 * Returns a new pieces array.
 */
export function movePiecesInCluster(
  pieces: PieceState[],
  clusterId: string,
  deltaX: number,
  deltaY: number,
): PieceState[] {
  return pieces.map((p) =>
    p.clusterId === clusterId && !p.locked
      ? { ...p, x: p.x + deltaX, y: p.y + deltaY }
      : p,
  )
}

// ---------------------------------------------------------------------------
// isPuzzleComplete
// ---------------------------------------------------------------------------

/**
 * Returns true when every piece is locked to its correct grid position.
 */
export function isPuzzleComplete(
  pieces: PieceState[],
): boolean {
  return pieces.length > 0 && pieces.every(p => p.locked)
}

// ---------------------------------------------------------------------------
// getClusterPieceIds
// ---------------------------------------------------------------------------

/**
 * Returns all piece IDs in the same cluster as the given piece.
 */
export function getClusterPieceIds(
  pieces: PieceState[],
  pieceId: string,
): string[] {
  const piece = pieces.find((p) => p.id === pieceId)
  if (!piece) return []
  return pieces
    .filter((p) => p.clusterId === piece.clusterId)
    .map((p) => p.id)
}

// ---------------------------------------------------------------------------
// isAtCorrectPosition
// ---------------------------------------------------------------------------

/**
 * Returns true if the piece is within threshold of its correct absolute
 * grid position (col * CELL_SIZE, row * CELL_SIZE).
 */
export function isAtCorrectPosition(
  piece: PieceState,
  threshold: number = 20,
): boolean {
  const correctX = piece.col * CELL_SIZE
  const correctY = piece.row * CELL_SIZE
  const dx = Math.abs(piece.x - correctX)
  const dy = Math.abs(piece.y - correctY)
  return dx < threshold && dy < threshold
}

// ---------------------------------------------------------------------------
// deriveClusters
// ---------------------------------------------------------------------------

/**
 * Rebuilds the Cluster[] array from pieces by grouping on clusterId.
 * Useful when receiving remote piece updates where only piece data is synced.
 */
export function deriveClusters(pieces: PieceState[]): Cluster[] {
  const map = new Map<string, string[]>()
  for (const p of pieces) {
    const arr = map.get(p.clusterId) || []
    arr.push(p.id)
    map.set(p.clusterId, arr)
  }
  return Array.from(map.entries()).map(([id, pieceIds]) => ({ id, pieceIds }))
}
