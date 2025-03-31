// src/components/Results.js
import React from 'react';

function Results({ data }) {
  console.log('Results data:', data); // Debug log
  return (
    <div>
      <h2>Your Analysis</h2>
      <p>Profile Score: {data.profileScore}/100</p>
      <p>Recruiter Readiness Score: {data.readinessScore}/100</p>
      <h3>Insights:</h3>
      <ul>
        {data.insights.map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}

export default Results;