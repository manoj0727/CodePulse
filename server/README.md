# Codeforces Tournament Server

This is the backend server for the real-time Codeforces tournament system.

## Setup Instructions

### 1. Install Dependencies

Navigate to the server directory and install required packages:

```bash
cd server
npm install
```

### 2. Start the Server

Run the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on port 3001 by default.

### 3. Configure Frontend

In your React app, make sure the tournament service points to the correct server URL:

- Default: `http://localhost:3001` (development)
- Production: Set environment variables:
  - `REACT_APP_TOURNAMENT_API` - API endpoint
  - `REACT_APP_TOURNAMENT_WS` - WebSocket endpoint

### 4. Features

- **Real-time Updates**: WebSocket connection for live tournament updates
- **Codeforces Integration**: Fetches user data and checks submissions via CF API
- **Automatic Winner Detection**: Polls CF API every 10 seconds during matches
- **Tournament Management**: Handles bracket progression automatically

### 5. How It Works

1. **Create Tournament**: Generates unique 6-character code
2. **Join Tournament**: Players register with CF handles (verified via API)
3. **Match System**: 
   - Assigns random CF problems to each match
   - Checks submissions every 10 seconds
   - First player to get "Accepted" wins
4. **Real-time Updates**: All participants see live updates via WebSocket

### 6. API Endpoints

- `POST /api/tournament/create` - Create new tournament
- `POST /api/tournament/join` - Join existing tournament
- `GET /api/tournament/:id` - Get tournament status
- `POST /api/tournament/check-submissions` - Check match submissions

### 7. Deployment

For production deployment:

1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start tournament-server.js
   ```

2. Set up reverse proxy (nginx example):
   ```nginx
   location /api {
     proxy_pass http://localhost:3001;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

3. Enable CORS for your frontend domain in production

### 8. Environment Variables

- `PORT` - Server port (default: 3001)

### 9. Notes

- Tournament data is stored in memory (use Redis/database for production)
- CF API has rate limits - be mindful of polling frequency
- WebSocket connections automatically reconnect on disconnect