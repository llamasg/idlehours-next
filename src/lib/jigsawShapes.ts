type EdgeType = 'F' | 'T' | 'B'

export interface PieceShape {
  id: string
  src: string
  rotation: 0 | 90 | 180 | 270
  top: EdgeType
  right: EdgeType
  bottom: EdgeType
  left: EdgeType
}

export const CELL_SIZE = 70

/** Return the complement of an edge: T↔B, F stays F */
export function complement(edge: EdgeType): EdgeType {
  if (edge === 'T') return 'B'
  if (edge === 'B') return 'T'
  return 'F'
}

// ---------------------------------------------------------------------------
// Build all rotated variants from the 9 base SVG files, then deduplicate.
// ---------------------------------------------------------------------------

type Edges = [EdgeType, EdgeType, EdgeType, EdgeType] // [top, right, bottom, left]

interface BasePiece {
  file: string
  edges: Edges
}

const BASE_PIECES: BasePiece[] = [
  { file: 'F_T_B_T', edges: ['F', 'T', 'B', 'T'] },
  { file: 'F_F_B_T', edges: ['F', 'F', 'B', 'T'] },
  { file: 'B_T_B_T', edges: ['B', 'T', 'B', 'T'] },
  { file: 'T_B_T_T', edges: ['T', 'B', 'T', 'T'] },
  { file: 'B_B_T_T', edges: ['B', 'B', 'T', 'T'] },
  { file: 'B_B_F_B', edges: ['B', 'B', 'F', 'B'] },
  { file: 'F_F_B_B', edges: ['F', 'F', 'B', 'B'] },
  { file: 'B_B_B_B', edges: ['B', 'B', 'B', 'B'] },
  { file: 'T_T_T_T', edges: ['T', 'T', 'T', 'T'] },
]

const ROTATIONS = [0, 90, 180, 270] as const

/**
 * Rotate edges 90° clockwise: left→top, top→right, right→bottom, bottom→left
 */
function rotate90([top, right, bottom, left]: Edges): Edges {
  return [left, top, right, bottom]
}

function rotateN(edges: Edges, steps: number): Edges {
  let result = edges
  for (let i = 0; i < steps; i++) {
    result = rotate90(result)
  }
  return result
}

function edgeKey(edges: Edges): string {
  return edges.join('_')
}

// Generate all unique variants
const seen = new Set<string>()
const allShapes: PieceShape[] = []

for (const base of BASE_PIECES) {
  for (let i = 0; i < ROTATIONS.length; i++) {
    const rotation = ROTATIONS[i]
    const edges = rotateN(base.edges, i)
    const key = edgeKey(edges)

    if (seen.has(key)) continue
    seen.add(key)

    allShapes.push({
      id: `${key}_r${rotation}`,
      src: `/images/jigsaw/${base.file}.svg`,
      rotation,
      top: edges[0],
      right: edges[1],
      bottom: edges[2],
      left: edges[3],
    })
  }
}

/** Every unique piece-shape variant (base shapes × rotations, deduplicated). */
export const PIECE_SHAPES: PieceShape[] = allShapes

/** Find the first shape matching the given edge combination, or undefined. */
function findShape(
  top: EdgeType,
  right: EdgeType,
  bottom: EdgeType,
  left: EdgeType,
): PieceShape | undefined {
  return PIECE_SHAPES.find(
    (s) => s.top === top && s.right === right && s.bottom === bottom && s.left === left,
  )
}
