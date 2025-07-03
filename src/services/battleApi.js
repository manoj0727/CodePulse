// Real-time Codeforces Battle API
import { fetchWithCORS } from './corsProxy';

export class CodeforcesRealTimeBattle {
  constructor(player1, player2, problemId) {
    this.player1 = player1;
    this.player2 = player2;
    this.problemId = problemId;
    this.startTime = Date.now();
    this.pollingInterval = null;
    this.submissionCache = new Set();
  }

  // Start monitoring submissions
  startMonitoring(onUpdate) {
    this.pollingInterval = setInterval(() => {
      this.checkSubmissions(onUpdate);
    }, 1000); // Check every second
    
    // Initial check
    this.checkSubmissions(onUpdate);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  // Check submissions for both players
  async checkSubmissions(onUpdate) {
    try {
      const [player1Subs, player2Subs] = await Promise.all([
        this.fetchUserSubmissions(this.player1),
        this.fetchUserSubmissions(this.player2)
      ]);

      // Process player 1 submissions
      const player1Status = this.processSubmissions(player1Subs, this.player1);
      
      // Process player 2 submissions
      const player2Status = this.processSubmissions(player2Subs, this.player2);

      // Call update callback
      onUpdate({
        player1: player1Status,
        player2: player2Status,
        elapsed: Math.floor((Date.now() - this.startTime) / 1000)
      });

    } catch (error) {
      console.error('Error checking submissions:', error);
    }
  }

  // Fetch user submissions from Codeforces
  async fetchUserSubmissions(handle) {
    const url = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10`;
    const response = await fetchWithCORS(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Failed to fetch submissions for ${handle}`);
    }
    
    return data.result;
  }

  // Process submissions for the current problem
  processSubmissions(submissions, handle) {
    const relevantSubmissions = submissions.filter(sub => {
      // Check if submission is for our problem
      const subProblemId = `${sub.problem.contestId}${sub.problem.index}`;
      return subProblemId === this.problemId && 
             sub.creationTimeSeconds * 1000 >= this.startTime;
    });

    if (relevantSubmissions.length === 0) {
      return { status: 'waiting', handle };
    }

    // Sort by time (newest first)
    relevantSubmissions.sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
    const latestSubmission = relevantSubmissions[0];

    // Track submission ID to avoid duplicates
    const submissionId = `${handle}-${latestSubmission.id}`;
    const isNew = !this.submissionCache.has(submissionId);
    if (isNew) {
      this.submissionCache.add(submissionId);
    }

    // Determine status
    let status = 'waiting';
    if (latestSubmission.verdict === 'OK') {
      status = 'accepted';
    } else if (latestSubmission.verdict === 'TESTING') {
      status = 'testing';
    } else if (latestSubmission.verdict) {
      status = 'wrong';
    } else {
      status = 'submitted';
    }

    return {
      handle,
      status,
      submission: latestSubmission,
      isNew,
      time: latestSubmission.creationTimeSeconds * 1000,
      language: latestSubmission.programmingLanguage,
      verdict: latestSubmission.verdict,
      passedTests: latestSubmission.passedTestCount || 0
    };
  }
}

// Get random problem based on difficulty
export const getRandomProblem = async (difficulty = 'medium') => {
  const ratingRanges = {
    easy: [800, 1200],
    medium: [1200, 1600],
    hard: [1600, 2000],
    expert: [2000, 2400]
  };

  const [minRating, maxRating] = ratingRanges[difficulty];

  try {
    const response = await fetchWithCORS('https://codeforces.com/api/problemset.problems');
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error('Failed to fetch problems');
    }

    // Filter problems by rating and ensure they're from contests
    const eligibleProblems = data.result.problems.filter(problem => 
      problem.rating >= minRating && 
      problem.rating <= maxRating && 
      problem.contestId &&
      !problem.tags.includes('*special') // Exclude special problems
    );

    if (eligibleProblems.length === 0) {
      throw new Error('No problems found for the selected difficulty');
    }

    // Select random problem
    const randomIndex = Math.floor(Math.random() * eligibleProblems.length);
    const selectedProblem = eligibleProblems[randomIndex];

    return {
      ...selectedProblem,
      problemId: `${selectedProblem.contestId}${selectedProblem.index}`,
      url: `https://codeforces.com/contest/${selectedProblem.contestId}/problem/${selectedProblem.index}`
    };
  } catch (error) {
    console.error('Error fetching problem:', error);
    throw error;
  }
};

// Verify user exists on Codeforces
export const verifyCodeforcesUser = async (handle) => {
  try {
    const url = `https://codeforces.com/api/user.info?handles=${handle}`;
    const response = await fetchWithCORS(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      return { exists: false, error: 'User not found' };
    }

    const user = data.result[0];
    return {
      exists: true,
      user: {
        handle: user.handle,
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'newbie',
        avatar: user.avatar
      }
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
};