'use client'

import { CustomPicker, type InjectedColorProps } from 'react-color'
/* eslint-disable @typescript-eslint/no-explicit-any */
// react-color's common component types are incomplete — the runtime API
// accepts hsl/hsv/onChange props that aren't in @types/react-color.
import { Saturation, Hue, EditableInput } from 'react-color/lib/components/common'
import type { HSLColor } from 'react-color'

const SaturationAny = Saturation as any
const HueAny = Hue as any
const EditableInputAny = EditableInput as any

const PRESETS = [
  '#E74C3C', '#E84393', '#E67E22', '#F1C40F',
  '#2ECC71', '#1ABC9C', '#3498DB', '#9B59B6',
  '#2C3E50', '#7F8C8D', '#D35400', '#C0392B',
  '#27AE60', '#2980B9', '#8E44AD', '#F39C12',
]

/** Convert HSL (0-1 for s/l) to HSV (0-100 for s/v) for the Saturation component */
function hslToHsv(hsl: HSLColor): { h: number; s: number; v: number } {
  const h = hsl.h
  const s = hsl.s
  const l = hsl.l
  const v = l + s * Math.min(l, 1 - l)
  const sv = v === 0 ? 0 : 2 * (1 - l / v)
  return { h, s: sv * 100, v: v * 100 }
}

function ColorPickerInner(props: InjectedColorProps) {
  const { hex, hsl, onChange } = props
  const hsv = hsl ? hslToHsv(hsl) : { h: 0, s: 0, v: 100 }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Saturation/Brightness box */}
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height: 120 }}>
        <SaturationAny hsl={hsl} hsv={hsv} onChange={onChange} />
      </div>

      {/* Preset circles */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange!(color)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: color,
              borderColor: hex?.toUpperCase() === color ? '#3D2E1A' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Hue slider */}
      <div className="relative w-full rounded-full overflow-hidden" style={{ height: 12 }}>
        <HueAny hsl={hsl} onChange={onChange} direction="horizontal" />
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#8B7355] font-mono">#</span>
        <div className="flex-1">
          <EditableInputAny
            label=""
            value={hex?.replace('#', '')}
            onChange={(data: Record<string, string>) => {
              const val = (data[''] || data.hex || '').replace('#', '')
              if (/^[0-9a-fA-F]{6}$/.test(val)) {
                onChange!(`#${val}`)
              }
            }}
            style={{
              input: {
                width: '100%',
                border: '1px solid #D4C5A9',
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#3D2E1A',
                outline: 'none',
                background: 'white',
              },
            }}
          />
        </div>
        <span
          className="w-6 h-6 rounded-md border border-[#D4C5A9] shrink-0"
          style={{ background: hex }}
        />
      </div>
    </div>
  )
}

export default CustomPicker(ColorPickerInner)
