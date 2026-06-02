/**
 * Fetches user profile, statistics, calendar, and contest ranking from LeetCode GraphQL API.
 * @param {string} username LeetCode username
 * @returns {Promise<object>} Parsed dashboard data
 */
async function fetchLeetcodeData(username) {
  const endpoint = "https://leetcode.com/graphql";
  const headers = {
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  };

  const graphqlQuery = {
    query: `
      query leetcodeData($username: String!, $limit: Int!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          profile {
            ranking
            reputation
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          userCalendar {
            streak
            submissionCalendar
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }
    `,
    variables: { username, limit: 10 }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(graphqlQuery)
  });
  
  const responseData = await response.json();
  
  if (responseData.errors) {
    throw new Error(responseData.errors[0]?.message || "LeetCode GraphQL error");
  }

  const data = responseData?.data;
  if (!data || !data.matchedUser) {
    throw new Error(`LeetCode user "${username}" not found or profile is private.`);
  }

  const { allQuestionsCount, matchedUser, userContestRanking, recentAcSubmissionList } = data;
  const { profile, submitStats, userCalendar } = matchedUser;

  // Extract counts
  const totalEasy = allQuestionsCount.find(q => q.difficulty === "Easy")?.count || 0;
  const totalMedium = allQuestionsCount.find(q => q.difficulty === "Medium")?.count || 0;
  const totalHard = allQuestionsCount.find(q => q.difficulty === "Hard")?.count || 0;
  const totalAll = allQuestionsCount.find(q => q.difficulty === "All")?.count || 0;

  const acStats = submitStats.acSubmissionNum || [];
  const easySolved = acStats.find(q => q.difficulty === "Easy")?.count || 0;
  const mediumSolved = acStats.find(q => q.difficulty === "Medium")?.count || 0;
  const hardSolved = acStats.find(q => q.difficulty === "Hard")?.count || 0;
  const totalSolved = acStats.find(q => q.difficulty === "All")?.count || 0;

  // Acceptance Rate
  const totalStats = submitStats.totalSubmissionNum || [];
  const totalAcSubmissions = acStats.find(q => q.difficulty === "All")?.submissions || 0;
  const totalSubmissions = totalStats.find(q => q.difficulty === "All")?.submissions || 0;
  const acceptanceRate = totalSubmissions > 0 ? parseFloat(((totalAcSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

  // Streaks & Calendar
  const streak = userCalendar?.streak || 0;
  const maxStreak = streak; // Fallback to current streak since maxStreak is not in API schema
  
  // LeetCode's submission calendar is a stringified JSON like: '{"1685664000":2,"1685750400":1}'
  // We parse it and format it as a map of date -> submission count
  let submissionMap = {};
  if (userCalendar?.submissionCalendar) {
    try {
      const rawCal = JSON.parse(userCalendar.submissionCalendar);
      // Convert unix timestamps (seconds) to YYYY-MM-DD in UTC to avoid local timezone offsets shifts
      Object.entries(rawCal).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp, 10) * 1000).toISOString().split("T")[0];
        submissionMap[date] = count;
      });
    } catch (e) {
      console.warn("Failed to parse LeetCode submissionCalendar JSON:", e);
    }
  }

  // Format recent submissions
  const recentSubmissions = (recentAcSubmissionList || []).map(sub => ({
    title: sub.title,
    timestamp: parseInt(sub.timestamp, 10) * 1000 // Convert to ms
  }));

  // Contest Rating Details
  const contest = userContestRanking ? {
    attendedContests: userContestRanking.attendedContestsCount || 0,
    rating: Math.round(userContestRanking.rating || 0),
    globalRank: userContestRanking.globalRanking || 0,
    topPercentage: parseFloat((userContestRanking.topPercentage || 0).toFixed(2))
  } : null;

  return {
    username,
    ranking: profile?.ranking || 0,
    reputation: profile?.reputation || 0,
    solved: {
      total: totalSolved,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      totalEasy,
      totalMedium,
      totalHard,
      totalCount: totalAll
    },
    acceptanceRate,
    streak,
    maxStreak,
    submissionCalendar: submissionMap,
    contest,
    recentSubmissions
  };
}

module.exports = { fetchLeetcodeData };
