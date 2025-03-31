// src/pages/Home.js
import React, { useState } from 'react';
import InputForm from '../components/InputForm';
import Results from '../components/Results';

function Home() {
  const [results, setResults] = useState(null);

  const handleAnalyze = (data) => {
    console.log('Analyze clicked with:', data); // Debug log
    setResults({
      profileScore: 75,
      readinessScore: 82,
      insights: ['Increase GitHub contributions.', 'Solve more Codeforces problems.']
    });
  };

  console.log('Current results:', results); // Debug log

  return (
    <div>
      <h1>Digital Profile Analyzer</h1>
      <InputForm onAnalyze={handleAnalyze} />
      {results ? <Results data={results} /> : <p>No results yet</p>}
    </div>
  );
}

export default Home;