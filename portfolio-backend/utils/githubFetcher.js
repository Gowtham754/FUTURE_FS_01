/**
 * Parses the HTML contributions calendar from GitHub user profile page.
 * @param {string} username GitHub username
 * @returns {Promise<object>} Contributions total and day-by-day heatmap data
 */
async function scrapeGithubContributions(username) {
  try {
    const url = `https://github.com/users/${username}/contributions`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch calendar HTML: ${res.status}`);
    }
    
    const html = await res.text();
    
    // Parse total contributions
    // Look for text like "1,234 contributions in the last year"
    let totalContributions = 0;
    const totalMatch = html.match(/([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i);
    if (totalMatch) {
      totalContributions = parseInt(totalMatch[1].replace(/,/g, ""), 10);
    }
    
    // Parse day elements
    const days = [];
    const tdRegex = /<td[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
    
    let match;
    while ((match = tdRegex.exec(html)) !== null) {
      const tagContent = match[0];
      const dateMatch = tagContent.match(/data-date="(\d{4}-\d{2}-\d{2})"/);
      const levelMatch = tagContent.match(/data-level="(\d)"/);
      const idMatch = tagContent.match(/id="([^"]*)"/);
      
      if (dateMatch && levelMatch) {
        days.push({
          date: dateMatch[1],
          level: parseInt(levelMatch[1], 10),
          id: idMatch ? idMatch[1] : null,
          count: 0 // Will populate from tooltips
        });
      }
    }
    
    // Parse tooltips
    // <tool-tip for="contribution-day-component-xxx">1 contribution on November 20, 2023</tool-tip>
    const tooltips = new Map();
    const tooltipRegex = /<tool-tip[^>]*for="([^"]*)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
    let tMatch;
    while ((tMatch = tooltipRegex.exec(html)) !== null) {
      const id = tMatch[1];
      const text = tMatch[2].trim();
      tooltips.set(id, text);
    }
    
    // Match tooltips to days and extract exact count
    for (let day of days) {
      if (day.id && tooltips.has(day.id)) {
        const text = tooltips.get(day.id);
        if (text.startsWith("No contributions")) {
          day.count = 0;
        } else {
          const countMatch = text.match(/^([\d,]+)\s+contribution/i);
          if (countMatch) {
            day.count = parseInt(countMatch[1].replace(/,/g, ""), 10);
          } else {
            // Fallback estimation based on level
            day.count = day.level === 0 ? 0 : day.level * 2 - 1;
          }
        }
      } else {
        // Fallback estimation based on level
        day.count = day.level === 0 ? 0 : day.level * 2 - 1;
      }
      // Remove temporary ID field before storing
      delete day.id;
    }
    
    return {
      totalContributions,
      days
    };
  } catch (err) {
    console.error("Error scraping GitHub contributions calendar:", err.message);
    return { totalContributions: 0, days: [] };
  }
}

/**
 * Gathers user profile, repositories, events, and search metrics from GitHub API and scraper.
 * @param {string} username GitHub username
 * @param {string|null} token Optional personal access token (PAT)
 * @returns {Promise<object>} Compiled GitHub statistics
 */
async function fetchGithubData(username, token = null) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  // 1. Fetch profile info
  const profileUrl = `https://api.github.com/users/${username}`;
  const profileRes = await fetch(profileUrl, { headers });
  if (!profileRes.ok) {
    let errMsg = profileRes.statusText;
    try {
      const errorData = await profileRes.json();
      errMsg = errorData.message || errMsg;
    } catch (_) {}
    
    if (profileRes.status === 401) {
      throw new Error(`GitHub API: Unauthorized (invalid token). Details: ${errMsg}`);
    } else if (profileRes.status === 403) {
      throw new Error(`GitHub API: Rate limit exceeded or blocked. Details: ${errMsg}`);
    } else if (profileRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found.`);
    } else {
      throw new Error(`GitHub API returned status ${profileRes.status}: ${errMsg}`);
    }
  }
  const profileData = await profileRes.json();

  // 2. Fetch repos (max 100 for portfolio profiles)
  const reposUrl = `https://api.github.com/users/${username}/repos?per_page=100`;
  const reposRes = await fetch(reposUrl, { headers });
  const reposData = reposRes.ok ? (await reposRes.json()) : [];

  let stars = 0;
  let forks = 0;
  const languagesMap = {};
  
  reposData.forEach(repo => {
    stars += repo.stargazers_count || 0;
    forks += repo.forks_count || 0;
    if (repo.language) {
      languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
    }
  });

  // Top repositories (sorted by stars, max 6)
  const topRepos = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map(repo => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      url: repo.html_url
    }));

  // Language distribution (format for pie/doughnut chart)
  const totalReposWithLanguage = Object.values(languagesMap).reduce((a, b) => a + b, 0);
  const languages = Object.entries(languagesMap)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalReposWithLanguage > 0 ? Math.round((count / totalReposWithLanguage) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Fetch recent events
  const eventsUrl = `https://api.github.com/users/${username}/events/public?per_page=15`;
  let events = [];
  try {
    const eventsRes = await fetch(eventsUrl, { headers });
    if (eventsRes.ok) {
      const rawEvents = await eventsRes.json();
      events = (rawEvents || [])
        .filter(event => ["PushEvent", "PullRequestEvent", "IssuesEvent", "CreateEvent"].includes(event.type))
        .map(event => {
          let details = "";
          if (event.type === "PushEvent") {
            const commits = event.payload?.commits || [];
            details = commits.length > 0 ? commits[0].message : "Pushed commits";
          } else if (event.type === "PullRequestEvent") {
            details = `${event.payload?.action} pull request: ${event.payload?.pull_request?.title || ""}`;
          } else if (event.type === "IssuesEvent") {
            details = `${event.payload?.action} issue: ${event.payload?.issue?.title || ""}`;
          } else if (event.type === "CreateEvent") {
            details = `Created ${event.payload?.ref_type || "repository"}`;
          }
          
          return {
            id: event.id,
            type: event.type,
            repo: event.repo?.name,
            details,
            timestamp: new Date(event.created_at).getTime()
          };
        })
        .slice(0, 5);
    }
  } catch (err) {
    console.error("Error fetching GitHub events:", err.message);
  }

  // 4. Fetch search counts (PRs, issues, commits) with fallback if rate limited
  let pullRequests = 0;
  let issues = 0;
  let commits = 0;

  try {
    const prUrl = `https://api.github.com/search/issues?q=author:${username}+type:pr`;
    const prRes = await fetch(prUrl, { headers });
    if (prRes.ok) {
      const prData = await prRes.json();
      pullRequests = prData.total_count || 0;
    }
  } catch (e) {
    console.warn("GitHub PR search rate limited or failed:", e.message);
  }

  try {
    const issueUrl = `https://api.github.com/search/issues?q=author:${username}+type:issue`;
    const issueRes = await fetch(issueUrl, { headers });
    if (issueRes.ok) {
      const issueData = await issueRes.json();
      issues = issueData.total_count || 0;
    }
  } catch (e) {
    console.warn("GitHub Issue search rate limited or failed:", e.message);
  }

  try {
    const commitUrl = `https://api.github.com/search/commits?q=author:${username}`;
    const commitHeaders = { ...headers, Accept: "application/vnd.github.cloak-preview" };
    const commitRes = await fetch(commitUrl, { headers: commitHeaders });
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      commits = commitData.total_count || 0;
    }
  } catch (e) {
    console.warn("GitHub Commit search rate limited or failed:", e.message);
  }

  // 5. Scrape contribution calendar
  const scraperData = await scrapeGithubContributions(username);

  return {
    username,
    name: profileData.name || username,
    avatar: profileData.avatar_url,
    followers: profileData.followers,
    following: profileData.following,
    publicRepos: profileData.public_repos,
    stars,
    forks,
    contributionsThisYear: scraperData.totalContributions,
    pullRequests,
    issues,
    commits,
    heatmap: scraperData.days,
    languages,
    topRepos,
    recentActivity: events
  };
}

module.exports = { fetchGithubData };
