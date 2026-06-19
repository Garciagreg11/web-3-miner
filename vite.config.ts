import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,         // Exposes the server to your Windows host
    open: false,
    strictPort: true,
    // 👇 ADD THIS WATCH BLOCK TO FORCE LINUX FILE PERMISSIONS TO WORK
    watch: {
      usePolling: true, // Manually polls for file changes so your UI actually updates
    },
    hmr: {
      clientPort: 5173, // Forces the live WebSocket connection to stay open across the WSL network boundary
    }
  }
})
