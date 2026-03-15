'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  type PieceState,
  type Cluster,
  generatePuzzleGrid,
  deriveClusters,
  isAtCorrectPosition,
} from '@/lib/jigsawUtils'
import { CELL_SIZE } from '@/lib/jigsawShapes'

// ─── Room code generation ────────────────────────────────────────────────────

const WORDS = [
  'PINE', 'DUSK', 'WOLF', 'FERN', 'BARK', 'MOSS', 'LAKE', 'HAZE',
  'MIST', 'DOVE', 'SAGE', 'WREN', 'REED', 'VALE', 'GLEN', 'DALE',
  'COVE', 'NEST', 'PELT', 'TIDE', 'GALE', 'DAWN', 'LARK', 'SEAL',
  'BRIM', 'CURL', 'FOAM', 'HEMP', 'JADE', 'KNOT', 'LIME', 'OPAL',
]

function generateRoomCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)]
  const num = Math.floor(Math.random() * 90 + 10) // 10–99
  return `${word}${num}`
}

// ─── Image grid derivation (same as solo page) ──────────────────────────────

const TARGET_PIECES = 100
const PUZZLE_IMAGE_SRC = '/images/jigsaw/jigsaw_image.png'

function deriveGrid(imgW: number, imgH: number) {
  const aspect = imgW / imgH
  const rows = Math.round(Math.sqrt(TARGET_PIECES / aspect))
  const cols = Math.round(rows * aspect)
  return { cols, rows }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RoomData {
  roomCode: string
  cols: number
  rows: number
  isComplete: boolean
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRoom() {
  /**
   * Create a new room: derive grid from image, generate pieces, insert into Supabase.
   * Returns the room code, or null on failure.
   */
  const createRoom = useCallback(async (): Promise<string | null> => {
    if (!supabase) return null

    // Load image to derive grid dimensions
    const { cols, rows } = await new Promise<{ cols: number; rows: number }>(
      (resolve) => {
        const img = new Image()
        img.src = PUZZLE_IMAGE_SRC
        img.onload = () => resolve(deriveGrid(img.naturalWidth, img.naturalHeight))
      },
    )

    const roomCode = generateRoomCode()

    // Insert room
    const { error: roomError } = await supabase
      .from('jigsaw_rooms')
      .insert({ room_code: roomCode, cols, rows })

    if (roomError) {
      console.error('Failed to create room:', roomError)
      return null
    }

    // Generate puzzle and insert pieces
    const { pieces } = generatePuzzleGrid(cols, rows)

    const pieceRows = pieces.map((p) => ({
      room_code: roomCode,
      piece_id: p.id,
      x: p.x,
      y: p.y,
      cluster_id: p.clusterId,
      shape_id: p.shapeId,
      col: p.col,
      row: p.row,
    }))

    const { error: piecesError } = await supabase
      .from('jigsaw_pieces')
      .insert(pieceRows)

    if (piecesError) {
      console.error('Failed to insert pieces:', piecesError)
      return null
    }

    return roomCode
  }, [])

  /**
   * Join an existing room — verify it exists and return metadata.
   */
  const joinRoom = useCallback(
    async (code: string): Promise<RoomData | null> => {
      if (!supabase) return null

      const { data, error } = await supabase
        .from('jigsaw_rooms')
        .select('room_code, cols, rows, is_complete')
        .eq('room_code', code.toUpperCase())
        .single()

      if (error || !data) return null

      return {
        roomCode: data.room_code,
        cols: data.cols,
        rows: data.rows,
        isComplete: data.is_complete,
      }
    },
    [],
  )

  /**
   * Load all pieces for a room from Supabase and reconstruct PieceState[] + Cluster[].
   */
  const loadPieces = useCallback(
    async (
      code: string,
    ): Promise<{ pieces: PieceState[]; clusters: Cluster[] } | null> => {
      if (!supabase) return null

      const { data, error } = await supabase
        .from('jigsaw_pieces')
        .select('*')
        .eq('room_code', code)

      if (error || !data) return null

      const pieces: PieceState[] = data.map((row: Record<string, unknown>) => {
        const p: PieceState = {
          id: row.piece_id as string,
          col: row.col as number,
          row: row.row as number,
          x: row.x as number,
          y: row.y as number,
          shapeId: row.shape_id as string,
          clusterId: row.cluster_id as string,
          locked: false,
        }
        p.locked = isAtCorrectPosition(p, 0.5)
        return p
      })

      const clusters = deriveClusters(pieces)

      return { pieces, clusters }
    },
    [],
  )

  /**
   * Mark a room as complete.
   */
  const markComplete = useCallback(async (code: string) => {
    if (!supabase) return
    await supabase
      .from('jigsaw_rooms')
      .update({ is_complete: true })
      .eq('room_code', code)
  }, [])

  return { createRoom, joinRoom, loadPieces, markComplete }
}
