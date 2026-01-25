import React, { useState, useEffect } from 'react';
import './pages-css/PhaseStats.css';
import { getUserPhaseStats } from '../utils/phasedata.js';

const PhaseStats = () => {
  const username = localStorage.getItem("currentUser");
  const [stats, setStats] = useState(null);
  const [activePhase, setActivePhase] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getUserPhaseStats(username);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [username]);

  if (loading) {
    return <div className="loading-container"><div className="loader"></div></div>;
  }

  if (!stats) {
    return <div className="loading-container"><p className="no-data-message">No stats found for this user.</p></div>;
  }

  const getWinRate = () => stats.total_games > 0 ? ((stats.wins / stats.total_games) * 100).toFixed(1) : 0;
  const formatNumber = (num) => typeof num === 'number' ? Math.round(num * 10) / 10 : num;

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return '#4CAF50'; // Green
    if (accuracy >= 80) return '#2196F3'; // Blue
    if (accuracy >= 70) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  const renderOverview = () => (
    <div className="phase-overview">
      <div className="accuracy-grid">
        {['opening', 'middlegame', 'endgame'].map(phase => (
          <div className="accuracy-card" key={phase}>
            <div className="accuracy-label">{phase}</div>
            <div className="accuracy-value" style={{ color: getAccuracyColor(stats[`${phase}_accuracy`]) }}>
              {formatNumber(stats[`${phase}_accuracy`])}%
            </div>
            <div className="accuracy-bar">
              <div 
                className="accuracy-fill" 
                style={{width: `${stats[`${phase}_accuracy`]}%`, backgroundColor: getAccuracyColor(stats[`${phase}_accuracy`])}}
              ></div>
            </div>
            <div className="accuracy-stats">
              <span>{stats[`${phase}_blunders`]} Blunders</span>
              <span>{stats[`${phase}_unforced_errors`]} Unforced Errors</span>
            </div>
          </div>
        ))}
      </div>

      <div className="performance-comparison">
        <div className="comparison-chart">
          <div className="chart-title">Tendency Comparison</div>
          <div className="bars-container">
            {[
              { label: 'Advantage Conversion', value: stats.middlegame_advantage_conversion_accuracy, color: '#4CAF50' },
              { label: 'Defense', value: stats.middlegame_defensive_hold_accuracy, color: '#F44336' },
              { label: 'Quiet Positions', value: stats.middlegame_equal_position_accuracy, color: '#2196F3' },
              { label: 'Initiative', value: stats.middlegame_initiative_score, color: '#FFC107' },
            ].map(item => (
              <div key={item.label} className="bar-row">
                <div className="bar-label">{item.label}</div>
                <div className="bar-track">
                  <div 
                    className="bar-fill"
                    style={{width: `${item.value}%`, backgroundColor: item.color}}
                  ></div>
                </div>
                <div className="bar-value">{formatNumber(item.value)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="error-analysis">
          <div className="chart-title">Error Distribution</div>
          <div className="error-grid">
            {['opening', 'middlegame', 'endgame'].map(phase => (
              <div className="error-item" key={phase}>
                <div className="error-phase">{phase}</div>
                <div className="error-count">{stats[`${phase}_blunders`] + stats[`${phase}_mistakes`]}</div>
                <div className="error-label">Total Errors</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhaseDetails = (phase) => {
    const p = (key) => `${phase}_${key}`;
    const data = {
      accuracy: stats[p('accuracy')],
      grade: stats[p('avg_grade')],
      moves: stats[p('total_moves')],
      blunders: stats[p('blunders')],
      mistakes: stats[p('mistakes')],
      unforced_errors: stats[p('unforced_errors')],
      excellent: stats[p('excellent')],
      special: stats[p('development_moves')] ?? stats[p('tactical_moves')] ?? stats[p('technique_score')],
      specialLabel: phase === 'opening' ? 'Dev. Moves' : phase === 'middlegame' ? 'Tactical Moves' : 'Conversion %',
      initiative: stats[p('initiative_score')],
      adv_conversion: stats[p('advantage_conversion_accuracy')],
      defense: stats[p('defensive_hold_accuracy')],
      equal_pos: stats[p('equal_position_accuracy')],
    };

    return (
      <div className="phase-details">
        <div className="phase-header">
          <h3>{phase.charAt(0).toUpperCase() + phase.slice(1)} Analysis</h3>
          <div className="phase-accuracy">
            <span className="accuracy-number" style={{ color: getAccuracyColor(data.accuracy) }}>
              {formatNumber(data.accuracy)}%
            </span>
            <span className="accuracy-text">Average Accuracy</span>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card"><div className="metric-value">{formatNumber(data.grade)}</div><div className="metric-label">Avg Grade</div></div>
          <div className="metric-card"><div className="metric-value">{data.moves.toLocaleString()}</div><div className="metric-label">Total Moves</div></div>
          <div className="metric-card"><div className="metric-value">{data.excellent}</div><div className="metric-label">Excellent</div></div>
          {phase !== 'endgame' && (<div className="metric-card"><div className="metric-value">{data.special}</div><div className="metric-label">{data.specialLabel}</div></div>)}
          <div className="metric-card error"><div className="metric-value">{data.blunders}</div><div className="metric-label">Blunders</div></div>
          <div className="metric-card warning"><div className="metric-value">{data.unforced_errors}</div><div className="metric-label">Unforced Errors</div></div>
        </div>

        <div className="analysis-insights">
          <div className="insight-card">
            <div className="insight-title">Initiative Score</div>
            <div className="insight-value" style={{color: '#FFC107'}}>{formatNumber(data.initiative)}%</div>
            <div className="insight-desc">How often you create threats.</div>
          </div>
          <div className="insight-card">
            <div className="insight-title">Advantage Conversion</div>
            <div className="insight-value" style={{color: '#4CAF50'}}>{formatNumber(data.adv_conversion)}%</div>
            <div className="insight-desc">Your accuracy when you're ahead.</div>
          </div>
          <div className="insight-card">
            <div className="insight-title">Defensive Hold Rate</div>
            <div className="insight-value" style={{color: '#F44336'}}>{formatNumber(data.defense)}%</div>
            <div className="insight-desc">Your accuracy when you're behind.</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="phase-stats-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Phase Performance Analysis</h1>
          <p>A comprehensive breakdown of your chess performance across all game phases.</p>
          <div className="summary-cards">
            <div className="summary-card"><div className="summary-value">{stats.total_games}</div><div className="summary-label">Total Games</div></div>
            <div className="summary-card"><div className="summary-value">{getWinRate()}%</div><div className="summary-label">Win Rate</div></div>
            <div className="summary-card"><div className="summary-value">{formatNumber(stats.avg_game_length)}</div><div className="summary-label">Avg. Length</div></div>
            <div className="summary-card"><div className="summary-value">{stats.wins}W-{stats.losses}L-{stats.draws}D</div><div className="summary-label">Record</div></div>
          </div>
        </div>
      </div>

      <div className="phase-navigation">
        <nav className="nav-tabs">
          {['overview', 'opening', 'middlegame', 'endgame'].map(tab => (
            <button key={tab.id} className={`nav-tab ${activePhase === tab ? 'active' : ''}`} onClick={() => setActivePhase(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="page-content">
        {activePhase === 'overview' ? renderOverview() : renderPhaseDetails(activePhase)}
      </div>
    </div>
  );
};

export default PhaseStats;
