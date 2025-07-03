// CORS Proxy service for Codeforces API
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

// Test which proxy works
async function findWorkingProxy(url) {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        console.log('Working CORS proxy found:', proxy);
        return proxy;
      }
    } catch (error) {
      console.log('Proxy failed:', proxy, error.message);
    }
  }
  
  // If no proxy works, try direct (might work in some environments)
  return '';
}

// Cached working proxy
let workingProxy = null;

export async function fetchWithCORS(url) {
  try {
    // First try direct request
    console.log('Attempting direct request to:', url);
    const directResponse = await fetch(url);
    if (directResponse.ok) {
      console.log('Direct request succeeded');
      return directResponse;
    }
  } catch (error) {
    console.log('Direct request failed, trying CORS proxy...');
  }

  // Find working proxy if not cached
  if (!workingProxy) {
    workingProxy = await findWorkingProxy(url);
  }

  // Try with proxy
  const proxiedUrl = workingProxy + encodeURIComponent(url);
  console.log('Fetching with proxy:', proxiedUrl);
  
  const response = await fetch(proxiedUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}