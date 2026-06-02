import { useEffect, useState, useMemo } from "react";
import API from "../api/api";
import "../styles/github.css";

export default function GitHub({ profile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const username = profile?.githubUsername || "Gowtham754";
  const settings = profile?.githubSettings || {
    enabled: true,
    heatmapEnabled: true,
    statsEnabled: true,
    recentEnabled: true,
    chartsEnabled: true
  };

  const fetchData = (isManual = false) => {
    setLoading(true);
    setError("");
    setWarning("");
    
    const url = isManual ? "/api/profile/github/refresh" : "/api/profile/github";
    const method = isManual ? "post" : "get";
    const headers = isManual ? { Authorization: localStorage.getItem("token") } : {};

    API[method](url, {}, { headers })
      .then((res) => {
        const responseData = res.data?.data || res.data;
        setData(responseData);
        if (res.data?.warning) {
          setWarning(res.data.warning);
        }
      })
      .catch((err) => {
        console.error("GitHub fetch error:", err);
        setError(err.response?.data?.message || "Failed to load GitHub data. Verify username or connection.");
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

  // Generate date cells for the contribution calendar
  const heatmapWeeks = useMemo(() => {
    if (!data?.heatmap || data.heatmap.length === 0) return [];
    
    // Sort the heatmap days chronologically to ensure they are not scrambled
    const sortedDays = [...data.heatmap].sort((a, b) => a.date.localeCompare(b.date));
    
    const weeks = [];
    let currentWeek = [];
    
    // Pad the beginning of the first week so the first row corresponds to Sunday
    if (sortedDays.length > 0) {
      const parts = sortedDays[0].date.split("-");
      const firstDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    sortedDays.forEach((dayCell) => {
      // Convert date string YYYY-MM-DD to date object
      const parts = dayCell.date.split("-");
      const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      
      currentWeek.push({
        date: dateObj,
        dateStr: dayCell.date,
        level: dayCell.level,
        count: dayCell.count
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [data, loading]);

  // SVG Donut Chart Slices Math
  const donutSlices = useMemo(() => {
    if (!data?.languages || data.languages.length === 0) return [];
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16
    let accumulatedPercentage = 0;

    // Use top 5 languages, group the rest as "Others"
    const displayLanguages = [];
    let otherPercentage = 0;
    let otherCount = 0;

    data.languages.forEach((lang, idx) => {
      if (idx < 5) {
        displayLanguages.push({ ...lang });
      } else {
        otherPercentage += lang.percentage;
        otherCount += lang.count;
      }
    });

    if (otherPercentage > 0) {
      displayLanguages.push({
        name: "Others",
        count: otherCount,
        percentage: otherPercentage
      });
    }

    // Color Palette for languages (Harmonious premium colors)
    const colorPalette = [
      "#38bdf8", // Sky Blue (Javascript/TS)
      "#f59e0b", // Amber (HTML/CSS)
      "#10b981", // Emerald (Python/Go)
      "#ef4444", // Red (Ruby/C++)
      "#8b5cf6", // Purple (Java/C#)
      "#64748b"  // Slate (Others)
    ];

    return displayLanguages.map((lang, idx) => {
      const percentage = lang.percentage;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;
      const rotationAngle = (accumulatedPercentage / 100) * 360 - 90; // Rotate to start from top
      accumulatedPercentage += percentage;

      return {
        name: lang.name,
        percentage,
        count: lang.count,
        strokeDasharray: `${circumference}`,
        strokeDashoffset,
        transform: `rotate(${rotationAngle} 70 70)`,
        color: colorPalette[idx % colorPalette.length]
      };
    });
  }, [data]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getHeatmapColorClass = (level) => {
    return `github-level-${level}`;
  };

  if (!settings.enabled) return null;

  // Render Loader
  if (loading) {
    return (
      <section className="github-section" id="github">
        <div className="github-container">
          <div className="section-header">
            <span>GITHUB ANALYTICS</span>
            <div className="section-underline"></div>
          </div>
          
          <div className="github-loader-grid">
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
      <section className="github-section" id="github">
        <div className="github-container">
          <div className="section-header">
            <span>GITHUB ANALYTICS</span>
            <div className="section-underline"></div>
          </div>
          <div className="github-error-card">
            <h4>Oops! Couldn't load GitHub data</h4>
            <p>{error}</p>
            <button className="github-btn-retry" onClick={() => fetchData()}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="github-section" id="github">
      <div className="github-container">
        
        {/* HEADER */}
        <div className="github-title-row">
          <div className="section-header">
            <span>GITHUB / Gowtham754</span>
            <div className="section-underline"></div>
          </div>
          {warning && (
            <div className="cache-warning" title={warning}>
              ⚠️ Offline Mode (Showing Stale Data)
            </div>
          )}
        </div>

        <div className="github-grid github-grid-clean">
          
          {/* WIDGET 1: CONTRIBUTION HEATMAP */}
          {settings.heatmapEnabled && data?.heatmap && (
            <div className="github-card heatmap-card">
              <div className="card-header">
                <h3>Contributions Calendar</h3>
                <span className="user-contributions">{data.contributionsThisYear?.toLocaleString() || 0} contributions this year</span>
              </div>
              
              <div className="heatmap-scroll-container">
                <div className="heatmap-grid-wrapper">
                  
                  <div className="heatmap-body">
                    <div className="heatmap-grid">
                      {heatmapWeeks.map((week, wIndex) => (
                        <div className="heatmap-week-column" key={wIndex}>
                          {week.map((day, dIndex) => {
                            if (!day) return <div className="heatmap-day-cell empty" key={dIndex}></div>;
                            const colorClass = getHeatmapColorClass(day.level);
                            return (
                              <div 
                                className={`heatmap-day-cell ${colorClass}`} 
                                key={dIndex}
                              >
                                <div className="heatmap-tooltip">
                                  <strong>{day.count} contribution{day.count !== 1 ? "s" : ""}</strong>
                                  <span>{formatDate(day.date)}</span>
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
                    <div className="legend-cell github-level-0"></div>
                    <div className="legend-cell github-level-1"></div>
                    <div className="legend-cell github-level-2"></div>
                    <div className="legend-cell github-level-3"></div>
                    <div className="legend-cell github-level-4"></div>
                    <span>More</span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* WIDGET 2: TOP REPOSITORIES */}
          {data?.topRepos && data.topRepos.length > 0 && (
            <div className="github-repos-wrapper">
              <div className="repos-header-row">
                <h3>Top Repositories</h3>
              </div>
              
              <div className="repos-grid">
                {data.topRepos.map((repo, idx) => (
                  <a 
                    className="github-card repo-card" 
                    href={repo.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    key={idx}
                  >
                    <div className="repo-top">
                      <h4>{repo.name}</h4>
                      <span className="repo-lang-tag">{repo.language || "Plain"}</span>
                    </div>
                    <p>{repo.description || "No description provided."}</p>
                    <div className="repo-badges">
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
