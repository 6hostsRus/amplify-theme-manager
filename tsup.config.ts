import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'dev/DevThemePanel.v3': 'src/dev/DevThemePanel.v3.tsx',
    'icons/manager': 'src/icons/manager.tsx',
    'icons/presets': 'src/icons/presets.tsx',
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm'],
  target: 'es2020',
  external: ['react', 'react-dom', '@aws-amplify/ui-react', 'react-icons'],
});
