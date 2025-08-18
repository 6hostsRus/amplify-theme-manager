import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
     root: path.resolve(__dirname, 'example/src'),
     plugins: [react()],
});
