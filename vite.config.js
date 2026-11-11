import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fetchAndParseYouTubeFeed } from './api/youtube-sync.js';

function localApiPlugin() {
  return {
    name: 'local-youtube-sync-api',
    configureServer(server) {
      server.middlewares.use('/api/youtube-sync', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const channelId = urlObj.searchParams.get('channelId') || '';
          const channelUrl = urlObj.searchParams.get('channelUrl') || '';
          const payload = await fetchAndParseYouTubeFeed({ channelId, channelUrl });
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify(payload));
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 502;
          res.end(JSON.stringify({ success: false, error: err?.message || 'Sync error' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
});
