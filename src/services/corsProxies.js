// CORS proxy services for handling cross-origin requests
// These proxies help bypass CORS restrictions when calling external APIs from the browser

export const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/'
];

// Function to try multiple CORS proxies
export const fetchWithCORS = async (url, proxies = CORS_PROXIES) => {
  const errors = [];
  
  for (const proxy of proxies) {
    try {
      console.log(`Trying proxy: ${proxy}`);
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched data using proxy:', proxy);
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed with proxy ${proxy}:`, error.message);
      errors.push({ proxy, error: error.message });
    }
  }
  
  // If all proxies failed, throw an error with details
  throw new Error(`All CORS proxies failed. Details: ${JSON.stringify(errors)}`);
};

// Alternative: Use a self-hosted proxy (instructions for backend setup)
export const PROXY_SETUP_INSTRUCTIONS = `
To avoid CORS issues completely, you can set up your own backend proxy:

1. Create a simple Express.js server:
   npm install express cors axios

2. Create server.js:
   const express = require('express');
   const cors = require('cors');
   const axios = require('axios');
   const app = express();
   
   app.use(cors());
   app.use(express.json());
   
   app.get('/api/codeforces/*', async (req, res) => {
     try {
       const path = req.params[0];
       const response = await axios.get(\`https://codeforces.com/api/\${path}\`, {
         params: req.query
       });
       res.json(response.data);
     } catch (error) {
       res.status(error.response?.status || 500).json({
         error: error.message
       });
     }
   });
   
   app.listen(3001, () => {
     console.log('Proxy server running on http://localhost:3001');
   });

3. Update package.json to add proxy:
   "proxy": "http://localhost:3001"

4. Update the API calls to use relative URLs:
   /api/codeforces/user.info?handles=handle
`;