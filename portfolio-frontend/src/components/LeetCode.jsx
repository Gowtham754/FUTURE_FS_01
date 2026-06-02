import { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import "../styles/leetcode.css";

export default function LeetCode({ profile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const username = profile?.leetcodeUsername || "Gowtham-N";
  const settings = profile?.leetcodeSettings || {
    enabled: true,
    heatmapEnabled: true,
    statsEnabled: true,
    recentEnabled: true
  };

  const fetchData = (isManual = false) => {
    setLoading(true);
    setError("");
    setWarning("");
    
    const url = isManual ? "/api/profile/leetcode/refresh" : "/api/profile/leetcode";
    const method = isManual ? "post" : "get";
    const headers = isManual ? { Authorization: localStorage.getItem("token") } : {};

    API[method](url, {}, { headers })
      .then((res) => {
        // Handle direct refresh or retrieval
        const responseData = res.data?.data || res.data;
        setData(responseData);
        if (res.data?.warning) {
          setWarning(res.data.warning);
        }
      })
      .catch((err) => {
        console.error("LeetCode fetch error:", err);
        setError(err.response?.data?.message || "Failed to load LeetCode data. Please verify the username or connection.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (settings.enabled) {
      fetchData();
    }
  }, [settings.enabled, username]);

  // Generate date cells for the activity heatmap (last 365 days)
  const heatmapWeeks = useMemo(() => {
    if (!data?.submissionCalendar) return [];
    
    const days = [];
    const today = new Date();
    // Safely go back exactly 1 year without integer overflow bugs
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Align start to the nearest previous Sunday
    const startDayOfWeek = start.getDay();
    start.setDate(start.getDate() - startDayOfWeek);
    
    // Copy date object to iterate
    const current = new Date(start);
    current.setHours(12, 0, 0, 0); // Set to noon to prevent timezone shifts
    
    const todayNoon = new Date(today);
    todayNoon.setHours(12, 0, 0, 0);
    
    while (current <= todayNoon) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Group into 53 weeks (columns) of 7 days (rows)
    const weeks = [];
    let currentWeek = [];
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      // pad the last week with nulls to make it 7 elements
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [data, loading]);

  // Generate dynamic month labels based on the columns
  const monthLabels = useMemo(() => {
    const labels = [];
    let prevMonth = -1;
    
    heatmapWeeks.forEach((week, wIdx) => {
      // Find if any day in this week has a new month different from prevMonth
      const newMonthDay = week.find(day => day !== null && day.getMonth() !== prevMonth);
      if (newMonthDay) {
        const month = newMonthDay.getMonth();
        const lastLabel = labels[labels.length - 1];
        // Prevent overlapping: only add if it's the first label, or at least 3 columns apart
        if (!lastLabel || (wIdx - lastLabel.colIdx >= 3)) {
          labels.push({
            name: newMonthDay.toLocaleDateString("en-US", { month: "short" }),
            colIdx: wIdx
          });
          prevMonth = month;
        }
      }
    });
    
    return labels;
  }, [heatmapWeeks]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Helper to get LeetCode date string YYYY-MM-DD
  const getDateString = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const getHeatmapColorClass = (count) => {
    if (count === 0) return "level-0";
    if (count >= 1 && count <= 2) return "level-1";
    if (count >= 3 && count <= 4) return "level-2";
    if (count >= 5 && count <= 7) return "level-3";
    return "level-4";
  };

  if (!settings.enabled) return null;

  // Render Loader
  if (loading) {
    return (
      <section className="leetcode-section" id="leetcode">
        <div className="leetcode-container">
          <div className="section-header">
            <span>LEETCODE DASHBOARD</span>
            <div className="section-underline"></div>
          </div>
          
          <div className="leetcode-loader-grid">
            <div className="skeleton skeleton-heatmap"></div>
            <div className="skeleton-stats-grid">
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render Error
  if (error) {
    return (
      <section className="leetcode-section" id="leetcode">
        <div className="leetcode-container">
          <div className="section-header">
            <span>LEETCODE DASHBOARD</span>
            <div className="section-underline"></div>
          </div>
          <div className="leetcode-error-card">
            <h4>Oops! Couldn't load LeetCode data</h4>
            <p>{error}</p>
            <button className="leetcode-btn-retry" onClick={() => fetchData()}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Render Dashboard
  return (
    <section className="leetcode-section" id="leetcode">
      <div className="leetcode-container">
        
        {/* HEADER */}
        <div className="leetcode-title-row">
          <div className="section-header">
            <span>LEETCODE / Gowtham-N</span>
            <div className="section-underline"></div>
          </div>
          {warning && (
            <div className="cache-warning" title={warning}>
              ⚠️ Offline Mode (Showing Stale Data)
            </div>
          )}
        </div>

        <div className="leetcode-grid leetcode-grid-clean">
          
          {/* WIDGET 1: HEATMAP */}
          {settings.heatmapEnabled && data?.submissionCalendar && (
            <div className="leetcode-card heatmap-card">
              <div className="card-header">
                <h3>Submission Calendar</h3>
                <span className="user-reputation">Rank: #{data.ranking?.toLocaleString() || "N/A"}</span>
              </div>
              
              <div className="heatmap-scroll-container">
                <div className="heatmap-grid-wrapper">
                  {/* Months labels (Dynamic) */}
                  <div className="heatmap-months" style={{ position: "relative", height: "20px", marginBottom: "8px" }}>
                    {monthLabels.map((lbl, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          position: "absolute", 
                          left: `${lbl.colIdx * 13.5}px`
                        }}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>

                  <div className="heatmap-body">
                    {/* Days of week labels */}
                    <div className="heatmap-days-labels">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

                    <div className="heatmap-grid">
                      {heatmapWeeks.map((week, wIndex) => (
                        <div className="heatmap-week-column" key={wIndex}>
                          {week.map((day, dIndex) => {
                            if (!day) return <div className="heatmap-day-cell empty" key={dIndex}></div>;
                            const dateStr = getDateString(day);
                            const count = data.submissionCalendar[dateStr] || 0;
                            const colorClass = getHeatmapColorClass(count);
                            return (
                              <div 
                                className={`heatmap-day-cell ${colorClass}`} 
                                key={dIndex}
                              >
                                <div className="heatmap-tooltip">
                                  <strong>{count} submission{count !== 1 ? "s" : ""}</strong>
                                  <span>{formatDate(day)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Heatmap Legend */}
                  <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="legend-cell level-0"></div>
                    <div className="legend-cell level-1"></div>
                    <div className="legend-cell level-2"></div>
                    <div className="legend-cell level-3"></div>
                    <div className="legend-cell level-4"></div>
                    <span>More</span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* WIDGET 2: STATS CARDS */}
          {settings.statsEnabled && data?.solved && (
            <>
              {/* Solved Progress Card */}
              <div className="leetcode-card solved-card">
                <div className="card-header">
                  <h3>Problems Solved</h3>
                  <div className="solved-count">
                    <span className="big-solved">{data.solved.total}</span>
                    <span className="total-slash">/ {data.solved.totalCount}</span>
                  </div>
                </div>

                <div className="progress-bars-container">
                  <div className="progress-bar-row easy">
                    <div className="progress-labels">
                      <span>Easy</span>
                      <strong>{data.solved.easy} / {data.solved.totalEasy}</strong>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(data.solved.easy / (data.solved.totalEasy || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="progress-bar-row medium">
                    <div className="progress-labels">
                      <span>Medium</span>
                      <strong>{data.solved.medium} / {data.solved.totalMedium}</strong>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(data.solved.medium / (data.solved.totalMedium || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="progress-bar-row hard">
                    <div className="progress-labels">
                      <span>Hard</span>
                      <strong>{data.solved.hard} / {data.solved.totalHard}</strong>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(data.solved.hard / (data.solved.totalHard || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaks & Performance */}
              <div className="leetcode-stats-row">
                
                <div className="leetcode-card small-stats-card">
                  <div className="card-emoji">🔥</div>
                  <div className="small-stats-info">
                    <h4>Current Streak</h4>
                    <p>{data.streak} Days</p>
                  </div>
                </div>

                <div className="leetcode-card small-stats-card">
                  <div className="card-emoji">🏆</div>
                  <div className="small-stats-info">
                    <h4>Longest Streak</h4>
                    <p>{data.maxStreak} Days</p>
                  </div>
                </div>

                <div className="leetcode-card small-stats-card">
                  <div className="card-emoji">🎯</div>
                  <div className="small-stats-info">
                    <h4>Acceptance Rate</h4>
                    <p>{data.acceptanceRate}%</p>
                  </div>
                </div>

                {data.contest ? (
                  <div className="leetcode-card small-stats-card rating-card">
                    <div className="card-emoji">⚡</div>
                    <div className="small-stats-info">
                      <h4>Contest Rating</h4>
                      <p>{data.contest.rating}</p>
                      <span className="percentile-label">Top {data.contest.topPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="leetcode-card small-stats-card rating-card disabled-rating">
                    <div className="card-emoji">💤</div>
                    <div className="small-stats-info">
                      <h4>Contest Rating</h4>
                      <p>Unrated</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
