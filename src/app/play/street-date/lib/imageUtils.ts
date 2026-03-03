// src/app/play/street-date/lib/imageUtils.ts
// Street Date — IGDB cover image URL helper

/**
 * Build a high-res IGDB cover URL from an image_id.
 * Uses `t_cover_big_2x` (264 x 374 @2x) for crisp display.
 *
 * @see https://api-docs.igdb.com/#images
 */
export function igdbCoverUrl(imageId: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${imageId}.jpg`
}
