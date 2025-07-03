# Testing the Real-Time Codeforces Tournament System

## 1. Server Setup

The tournament server is now running on port 3001. Keep it running in one terminal.

## 2. Frontend Setup

In another terminal, start the React app:
```bash
cd /Users/manojkumawat/github/digital-profile-analyzer
npm start
```

## 3. Testing the Tournament Flow

### Step 1: Create a Tournament
1. Navigate to http://localhost:3000/tournament
2. Click "Create Tournament"
3. You'll receive a 6-character tournament code (e.g., "ABC123")
4. Share this code with 3 friends

### Step 2: Join Tournament (4 players needed)
1. Each player navigates to http://localhost:3000/tournament
2. Enter the tournament code
3. Enter their name and Codeforces handle
4. Click "Join Tournament"

**Test Codeforces Handles** (use real ones for testing):
- tourist
- Benq
- Um_nik
- Petr

### Step 3: Tournament Bracket
Once 4 players join:
1. The bracket automatically generates
2. Two semifinal matches are created
3. Each match gets a random Codeforces problem

### Step 4: Playing a Match
1. Click "Start Match" on your match
2. You'll see the Codeforces problem details
3. Solve the problem on Codeforces.com
4. The system checks submissions every 10 seconds
5. First player to get "Accepted" wins

### Step 5: Tournament Progression
- Winners advance to finals
- Losers play consolation matches
- The tournament continues until there's a champion

## 4. Features to Test

1. **Real-time Updates**: All players see updates instantly
2. **CF API Integration**: Verifies handles and checks submissions
3. **Auto Winner Detection**: Automatically detects AC submissions
4. **Bracket Visualization**: Interactive bracket with match states
5. **Error Handling**: Invalid handles, full tournaments, etc.

## 5. Troubleshooting

### Server Not Starting
- Check if port 3001 is already in use
- Run: `lsof -i :3001` to check

### WebSocket Connection Issues
- Ensure both frontend and backend are running
- Check browser console for errors
- Server logs will show connection status

### Codeforces API Issues
- CF API has rate limits (300 requests/minute)
- Some handles might be invalid
- Check server logs for API errors

## 6. Quick Test (Single Machine)

You can test with 4 browser tabs:
1. Open 4 incognito/private windows
2. Create tournament in first window
3. Join with different names/handles in other 3
4. Simulate matches by submitting to CF problems

## 7. Production Deployment

For production:
1. Deploy server to a cloud platform (Heroku, AWS, etc.)
2. Update `REACT_APP_TOURNAMENT_API` and `REACT_APP_TOURNAMENT_WS` env vars
3. Use a database instead of in-memory storage
4. Add authentication and security measures