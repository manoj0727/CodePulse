// src/components/InputForm.js
import React, { useState } from 'react';

function InputForm({ onAnalyze }) {
  const [github, setGithub] = useState('');
  const [codeforces, setCodeforces] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { github, codeforces }); // Debug log
    onAnalyze({ github, codeforces });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>GitHub Username: </label>
        <input
          type="text"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Codeforces Handle: </label>
        <input
          type="text"
          value={codeforces}
          onChange={(e) => setCodeforces(e.target.value)}
          required
        />
      </div>
      <button type="submit">Analyze</button>
    </form>
  );
}

export default InputForm;