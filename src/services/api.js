import { fetchWithCORS } from './corsProxy';

// GitHub API service
export const fetchGitHubData = async (username) => {
  try {
    // Check rate limit first
    const rateLimitResponse = await fetch('https://api.github.com/rate_limit');
    const rateLimit = await rateLimitResponse.json();
    
    if (rateLimit.rate && rateLimit.rate.remaining === 0) {
      const resetTime = new Date(rateLimit.rate.reset * 1000);
      throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetTime.toLocaleTimeString()}`);
    }

    // Fetch user profile with authentication header if available
    const headers = {};
    // You can add a GitHub token here for higher rate limits
    // headers['Authorization'] = 'token YOUR_GITHUB_TOKEN';
    
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (userResponse.status === 404) {
      throw new Error('GitHub user not found');
    } else if (userResponse.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    } else if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }
    const userData = await userResponse.json();

    // Fetch user repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const reposData = await reposResponse.json();

    // Calculate statistics
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);
    const languages = {};
    
    reposData.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Get recent activity
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    const eventsData = await eventsResponse.json();
    
    // Count commits from push events
    const recentCommits = eventsData
      .filter(event => event.type === 'PushEvent')
      .reduce((sum, event) => sum + (event.payload.commits?.length || 0), 0);
    
    // Analyze activity by type
    const activityByType = {};
    const contributionsByDay = {};
    
    eventsData.forEach(event => {
      activityByType[event.type] = (activityByType[event.type] || 0) + 1;
      
      const date = new Date(event.created_at);
      const dayKey = date.toISOString().split('T')[0];
      contributionsByDay[dayKey] = (contributionsByDay[dayKey] || 0) + 1;
    });
    
    // Calculate repository statistics
    const repoStats = {
      totalSize: reposData.reduce((sum, repo) => sum + (repo.size || 0), 0),
      openIssues: reposData.reduce((sum, repo) => sum + repo.open_issues_count, 0),
      totalWatchers: reposData.reduce((sum, repo) => sum + repo.watchers_count, 0),
      forkedRepos: reposData.filter(repo => repo.fork).length,
      originalRepos: reposData.filter(repo => !repo.fork).length
    };
    
    // Language statistics with more detail
    const languageStats = {};
    let totalLanguageCount = 0;
    
    reposData.forEach(repo => {
      if (repo.language) {
        languageStats[repo.language] = {
          count: (languageStats[repo.language]?.count || 0) + 1,
          stars: (languageStats[repo.language]?.stars || 0) + repo.stargazers_count,
          forks: (languageStats[repo.language]?.forks || 0) + repo.forks_count
        };
        totalLanguageCount++;
      }
    });

    return {
      success: true,
      data: {
        username: userData.login,
        name: userData.name,
        bio: userData.bio,
        company: userData.company,
        location: userData.location,
        email: userData.email,
        blog: userData.blog,
        publicRepos: userData.public_repos,
        publicGists: userData.public_gists,
        followers: userData.followers,
        following: userData.following,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        avatarUrl: userData.avatar_url,
        hireable: userData.hireable,
        totalStars,
        totalForks,
        languages: Object.entries(languages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([lang, count]) => ({ language: lang, count })),
        recentCommits,
        topRepos: reposData
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 5)
          .map(repo => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url
          })),
        repoStats,
        languageStats,
        activityByType,
        contributionsByDay,
        totalLanguageCount
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Codeforces API service
export const fetchCodeforcesData = async (handle) => {
  try {
    console.log('Fetching Codeforces data for handle:', handle);
    
    // Fetch user info using CORS proxy
    const userResponse = await fetchWithCORS(`https://codeforces.com/api/user.info?handles=${handle}`);
    const userData = await userResponse.json();
    console.log('User data received:', userData);
    
    if (userData.status !== 'OK') {
      throw new Error('Codeforces user not found');
    }

    const user = userData.result[0];

    // Fetch user rating history
    console.log('Fetching rating history...');
    const ratingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`;
    const ratingResponse = await fetchWithCORS(ratingUrl);
    const ratingData = await ratingResponse.json();
    console.log('Rating data received:', ratingData.status);

    // Fetch user submissions
    console.log('Fetching submissions...');
    const submissionsUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=500`;
    const submissionsResponse = await fetchWithCORS(submissionsUrl);
    const submissionsData = await submissionsResponse.json();
    console.log('Submissions data received:', submissionsData.status, 'Count:', submissionsData.result?.length);

    if (submissionsData.status !== 'OK') {
      throw new Error('Failed to fetch submissions');
    }

    // Calculate statistics
    const submissions = submissionsData.result;
    const solvedProblems = new Set();
    const attemptedProblems = new Set();
    const languageCount = {};
    const verdictCount = {
      OK: 0,
      WRONG_ANSWER: 0,
      TIME_LIMIT_EXCEEDED: 0,
      MEMORY_LIMIT_EXCEEDED: 0,
      RUNTIME_ERROR: 0,
      COMPILATION_ERROR: 0
    };
    const problemsByRating = {};
    const problemsByTag = {};
    const submissionsByMonth = {};
    const solvedByDifficulty = {};

    submissions.forEach(sub => {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
      attemptedProblems.add(problemId);
      
      if (sub.verdict === 'OK') {
        solvedProblems.add(problemId);
        verdictCount.OK++;
        
        // Track problems by rating
        if (sub.problem.rating) {
          const rating = sub.problem.rating;
          if (!problemsByRating[rating]) {
            problemsByRating[rating] = 0;
          }
          problemsByRating[rating]++;
          
          // Group by difficulty
          let difficulty;
          if (rating < 1200) difficulty = 'Easy';
          else if (rating < 1600) difficulty = 'Medium';
          else if (rating < 2000) difficulty = 'Hard';
          else difficulty = 'Expert';
          
          solvedByDifficulty[difficulty] = (solvedByDifficulty[difficulty] || 0) + 1;
        }
        
        // Track problems by tags
        if (sub.problem.tags) {
          sub.problem.tags.forEach(tag => {
            problemsByTag[tag] = (problemsByTag[tag] || 0) + 1;
          });
        }
      } else if (verdictCount.hasOwnProperty(sub.verdict)) {
        verdictCount[sub.verdict]++;
      }

      if (sub.programmingLanguage) {
        languageCount[sub.programmingLanguage] = (languageCount[sub.programmingLanguage] || 0) + 1;
      }
      
      // Track submissions by month
      const date = new Date(sub.creationTimeSeconds * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      submissionsByMonth[monthKey] = (submissionsByMonth[monthKey] || 0) + 1;
    });

    // Get problem ratings
    const problemRatings = submissions
      .filter(sub => sub.verdict === 'OK' && sub.problem.rating)
      .map(sub => sub.problem.rating);

    const avgProblemRating = problemRatings.length > 0
      ? Math.round(problemRatings.reduce((a, b) => a + b, 0) / problemRatings.length)
      : 0;
      
    // Sort tags by count
    const topTags = Object.entries(problemsByTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      success: true,
      data: {
        handle: user.handle,
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'newbie',
        maxRank: user.maxRank || 'newbie',
        contribution: user.contribution || 0,
        friendOfCount: user.friendOfCount || 0,
        registrationTime: user.registrationTimeSeconds,
        lastOnlineTime: user.lastOnlineTimeSeconds,
        avatar: user.avatar,
        titlePhoto: user.titlePhoto,
        country: user.country,
        city: user.city,
        organization: user.organization,
        solvedCount: solvedProblems.size,
        attemptedCount: attemptedProblems.size,
        submissionCount: submissions.length,
        acceptanceRate: submissions.length > 0 
          ? Math.round((verdictCount.OK / submissions.length) * 100) 
          : 0,
        avgProblemRating,
        languages: Object.entries(languageCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([lang, count]) => ({ language: lang, count })),
        verdictStats: verdictCount,
        ratingHistory: ratingData.status === 'OK' ? ratingData.result : [],
        recentContests: ratingData.status === 'OK' 
          ? ratingData.result.slice(-5).reverse() 
          : [],
        problemsByRating,
        solvedByDifficulty,
        topTags,
        submissionsByMonth
      }
    };
  } catch (error) {
    console.error('Error in fetchCodeforcesData:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Calculate overall profile score
export const calculateProfileScore = (githubData, codeforcesData) => {
  let score = 0;
  let insights = [];

  // GitHub scoring (50 points max)
  if (githubData && githubData.success) {
    const gh = githubData.data;
    
    // Repository score (15 points)
    const repoScore = Math.min(15, gh.publicRepos * 0.5);
    score += repoScore;
    if (gh.publicRepos < 10) {
      insights.push('Create more GitHub repositories to showcase your projects');
    }

    // Stars and forks score (10 points)
    const starsScore = Math.min(5, gh.totalStars * 0.1);
    const forksScore = Math.min(5, gh.totalForks * 0.2);
    score += starsScore + forksScore;
    if (gh.totalStars < 50) {
      insights.push('Work on making your repositories more popular by improving documentation');
    }

    // Activity score (10 points)
    const activityScore = Math.min(10, gh.recentCommits * 0.1);
    score += activityScore;
    if (gh.recentCommits < 50) {
      insights.push('Increase your GitHub activity with more frequent commits');
    }

    // Community score (10 points)
    const communityScore = Math.min(10, (gh.followers * 0.1) + (gh.following * 0.05));
    score += communityScore;
    if (gh.followers < 20) {
      insights.push('Engage more with the GitHub community to gain followers');
    }

    // Profile completeness (5 points)
    let profileScore = 0;
    if (gh.bio) profileScore += 1;
    if (gh.location) profileScore += 1;
    if (gh.company) profileScore += 1;
    if (gh.blog) profileScore += 1;
    if (gh.hireable) profileScore += 1;
    score += profileScore;
    if (profileScore < 5) {
      insights.push('Complete your GitHub profile with bio, location, and other details');
    }
  } else {
    insights.push('Invalid GitHub username or API error');
  }

  // Codeforces scoring (50 points max)
  if (codeforcesData && codeforcesData.success) {
    const cf = codeforcesData.data;

    // Rating score (20 points)
    const ratingScore = Math.min(20, (cf.rating / 100) * 2);
    score += ratingScore;
    if (cf.rating < 1200) {
      insights.push('Improve your Codeforces rating by solving more problems');
    }

    // Problem solving score (15 points)
    const problemScore = Math.min(15, cf.solvedCount * 0.05);
    score += problemScore;
    if (cf.solvedCount < 100) {
      insights.push('Solve more problems on Codeforces to improve your profile');
    }

    // Consistency score (10 points)
    const consistencyScore = Math.min(10, cf.acceptanceRate * 0.1);
    score += consistencyScore;
    if (cf.acceptanceRate < 50) {
      insights.push('Work on improving your solution accuracy');
    }

    // Contest participation (5 points)
    const contestScore = Math.min(5, cf.recentContests.length);
    score += contestScore;
    if (cf.recentContests.length < 5) {
      insights.push('Participate in more Codeforces contests');
    }
  } else {
    insights.push('Invalid Codeforces handle or API error');
  }

  return {
    profileScore: Math.round(score),
    readinessScore: Math.round(score * 1.2), // Adjusted for recruiter perspective
    insights
  };
};