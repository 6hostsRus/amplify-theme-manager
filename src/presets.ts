export type ThemePreset = { name: string; description?: string; patch: Record<string, any>; };

export const PRESETS: ThemePreset[] = [
  { name: 'None', description: 'No-op', patch: {} },
  {
    name: 'Brand / Purple',
    description: 'Sets brand primary + font to purple',
    patch: {
      name: 'brand-purple',
      tokens: {
        colors: {
          brand: { primary: { value: '#6d28d9' }, secondary: { value: '#a78bfa' } },
          font: { primary: { value: '{colors.brand.primary}' } },
          border: { primary: { value: '{colors.brand.secondary}' } }
        }
      }
    }
  },
  {
    name: 'High Contrast Dark',
    description: 'Dark override with boosted contrast',
    patch: {
      overrides: [{
        colorMode: 'dark',
        tokens: {
          colors: {
            background: { primary: { value: '#0b0f19' } },
            font: { primary: { value: '#f8fafc' } },
            border: { primary: { value: '#cbd5e1' } }
          }
        }
      }]
    }
  },
  {
    name: 'Warm / Sand',
    description: 'Warm neutral palette',
    patch: {
      tokens: {
        colors: {
          neutral: {
            10: { value: '#faf5e7' },
            40: { value: '#e7dbbd' },
            80: { value: '#7b6a44' },
            100: { value: '#3b2f18' }
          },
          background: { primary: { value: '{colors.neutral.10}' } },
          font: { primary: { value: '{colors.neutral.100}' } }
        }
      }
    }
  }
];

export function findPresetByName(name: string): ThemePreset | undefined {
  return PRESETS.find((p) => p.name === name);
}
