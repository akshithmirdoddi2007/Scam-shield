import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useState, useEffect } from 'react';
import { analyzeMessage } from './scamDetector';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  // SCAN STATISTICS
  const [scanStats, setScanStats] = useState(() => {
    try {
      const saved = localStorage.getItem('scamStats');
      return saved ? JSON.parse(saved) : {
        total: 0,
        suspicious: 0,
        high: 0,
        medium: 0,
        low: 0
      };
    } catch {
      return {
        total: 0,
        suspicious: 0,
        high: 0,
        medium: 0,
        low: 0
      };
    }
  });

  // SCAN HISTORY
  const [scanHistory, setScanHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('scanHistory') || '[]'
      );
    } catch {
      return [];
    }
  });

  // SAVE STATISTICS
  useEffect(() => {
    localStorage.setItem(
      'scamStats',
      JSON.stringify(scanStats)
    );
  }, [scanStats]);

  // SAVE HISTORY
  useEffect(() => {
    localStorage.setItem(
      'scanHistory',
      JSON.stringify(scanHistory)
    );
  }, [scanHistory]);

  // RISK PERCENTAGES
  const highPercent = scanStats.total
    ? (scanStats.high / scanStats.total) * 100
    : 0;

  const mediumPercent = scanStats.total
    ? (scanStats.medium / scanStats.total) * 100
    : 0;

  const lowPercent = scanStats.total
    ? (scanStats.low / scanStats.total) * 100
    : 0;

  // CHECK MESSAGE
  const checkMessage = () => {
    if (!message.trim()) {
      setResult({
        type: 'warning',
        title: 'Message Required',
        description: 'Please paste a message before checking.'
      });
      return;
    }

    try {
      const analysis = analyzeMessage(message);

      if (
        !analysis ||
        !['High', 'Medium', 'Low'].includes(analysis.riskLevel) ||
        !Array.isArray(analysis.findings)
      ) {
        throw new Error('Invalid analysis response');
      }

      // UPDATE STATISTICS
      setScanStats(prev => ({
        total: prev.total + 1,
        suspicious: prev.suspicious +
          (analysis.isSuspicious ? 1 : 0),
        high: prev.high +
          (analysis.riskLevel === 'High' ? 1 : 0),
        medium: prev.medium +
          (analysis.riskLevel === 'Medium' ? 1 : 0),
        low: prev.low +
          (analysis.riskLevel === 'Low' ? 1 : 0)
      }));

      // UPDATE HISTORY
      setScanHistory(prev => [
        {
          message: message.trim().slice(0, 60),
          riskLevel: analysis.riskLevel,
          riskScore: analysis.riskScore,
          date: new Date().toLocaleString()
        },
        ...prev
      ].slice(0, 10));

      // DISPLAY RESULT
      setResult({
        type: analysis.riskLevel.toLowerCase(),
        title: `${analysis.riskLevel} Risk — ${analysis.riskScore}/100`,
        description: analysis.isSuspicious
          ? analysis.findings.map(item =>
              `${item.category}: ${item.explanation}`
            ).join('\n\n')
          : 'No matching warning patterns were detected. This does not guarantee that the message is safe.',
        findings: analysis.findings
      });

    } catch (error) {
      console.error('Analysis Error:', error);

      setResult({
        type: 'warning',
        title: 'Analysis Error',
        description: 'Unable to analyze this message. Please check your scamDetector.js file.'
      });
    }
  };

  // CLEAR HISTORY
  const clearHistory = () => {
    setScanHistory([]);
  };

  // RESET ANALYTICS
  const resetAnalytics = () => {
    setScanStats({
      total: 0,
      suspicious: 0,
      high: 0,
      medium: 0,
      low: 0
    });

    setScanHistory([]);
    setResult(null);
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">🛡️</span>
          SCAM<span>SHIELD</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#detector">Scam Detector</a>
          <a href="#analytics">Analytics</a>
          <a href="#awareness">Awareness</a>
          <a href="#tips">Safety Tips</a>
        </div>

        <a href="#detector" className="nav-button">
          Check a Message ↗
        </a>
      </nav>

      {/* ANALYTICS DASHBOARD */}
      <section className="analytics-section" id="analytics">

        <div className="analytics-header">
          <span className="section-tag">
            🛡️ SECURITY OVERVIEW
          </span>

          <h2>Scam Shield Analytics</h2>
          <p>Monitor your message scans and security insights.</p>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <span>📊</span>
            <h3>{scanStats.total}</h3>
            <p>Total Messages Checked</p>
          </div>

          <div className="stat-card">
            <span>🚨</span>
            <h3>{scanStats.suspicious}</h3>
            <p>Suspicious Messages</p>
          </div>

          <div className="stat-card high-card">
            <span>🔴</span>
            <h3>{scanStats.high}</h3>
            <p>High Risk</p>
          </div>

          <div className="stat-card medium-card">
            <span>🟡</span>
            <h3>{scanStats.medium}</h3>
            <p>Medium Risk</p>
          </div>

          <div className="stat-card low-card">
            <span>🟢</span>
            <h3>{scanStats.low}</h3>
            <p>Low Risk</p>
          </div>

        </div>

        {/* RISK DISTRIBUTION */}
        <div className="analytics-panel">

          <h3>Risk Distribution</h3>

          <div className="chart-container">

            <div
              className="donut-chart"
              style={{
                background: scanStats.total
                  ? `conic-gradient(
                      #ef526b 0% ${highPercent}%,
                      #d69e36 ${highPercent}% ${highPercent + mediumPercent}%,
                      #278b65 ${highPercent + mediumPercent}% 100%
                    )`
                  : '#e5e7eb'
              }}
            >

              <div className="donut-inner">
                <strong>{scanStats.total}</strong>
                <span>Total Scans</span>
              </div>

            </div>

          </div>

          {[
            {
              name: 'High Risk',
              value: scanStats.high,
              color: '#ef526b'
            },
            {
              name: 'Medium Risk',
              value: scanStats.medium,
              color: '#d69e36'
            },
            {
              name: 'Low Risk',
              value: scanStats.low,
              color: '#278b65'
            }
          ].map(item => (
            <div className="risk-row" key={item.name}>

              <div className="risk-label">
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>

              <div className="risk-track">
                <div
                  className="risk-fill"
                  style={{
                    width: `${
                      scanStats.total
                        ? (item.value / scanStats.total) * 100
                        : 0
                    }%`,
                    background: item.color
                  }}
                />
              </div>

            </div>
          ))}

        </div>

        {/* RECENT SCAN HISTORY */}
        <div className="analytics-panel">

          <h3>🕒 Recent Scan History</h3>

          {scanHistory.length === 0 ? (
            <p className="empty-history">
              No scans yet. Check your first message to see activity here!
            </p>
          ) : (

            <div className="history-list">

              {scanHistory.map((scan, index) => (
                <div
                  className="history-item"
                  key={`${scan.date}-${index}`}
                >

                  <div>
                    <strong>{scan.message}</strong>
                    <p>{scan.date}</p>
                  </div>

                  <span
                    className={`history-risk ${scan.riskLevel.toLowerCase()}`}
                  >
                    {scan.riskLevel} · {scan.riskScore}/100
                  </span>

                </div>
              ))}

            </div>

          )}

          <button
            className="analyze-button"
            onClick={clearHistory}
          >
            Clear History
          </button>

          <button
            className="analyze-button"
            onClick={resetAnalytics}
          >
            Reset All Analytics
          </button>

        </div>

      </section>

      {/* HERO SECTION */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="eyebrow">
            <span className="pulse"></span>
            YOUR DIGITAL SAFETY PARTNER
          </div>

          <h1>
            Don't Let Scammers
            <br />
            <span>Catch You Off Guard.</span>
          </h1>

          <p>
            One wrong click can put your digital safety at risk.
            Learn to identify scam messages, recognize fraudulent
            calls and protect yourself online.
          </p>

          <div className="hero-buttons">

            <a href="#detector" className="primary-button">
              <span>🛡️</span> Check a Message
            </a>

            <a href="#awareness" className="secondary-button">
              Explore Scams →
            </a>

          </div>

          <div className="hero-note">
            <span>✓</span> Stay Alert
            <span>✓</span> Think Before You Click
            <span>✓</span> Stay Protected
          </div>

        </div>

        <div className="hero-visual">

          <div className="glow"></div>

          <div className="shield-card">

            <div className="shield-symbol">🛡️</div>

            <div className="shield-status">
              PROTECTION STARTS WITH YOU
            </div>

            <h2>Stay One Step Ahead.</h2>

            <p>Awareness is your strongest defense.</p>

            <div className="shield-line"></div>

            <div className="shield-bottom">
              <span>SCAM SHIELD</span>
              <span>● DIGITAL SAFETY</span>
            </div>

          </div>

          <div className="floating-card card-one">
            <span>⚠️</span> Think Before You Click
          </div>

          <div className="floating-card card-two">
            <span>🔒</span> Protect Your Identity
          </div>

        </div>

      </section>

      {/* MESSAGE DETECTOR */}
      <section className="detector-section" id="detector">

        <div className="section-heading">

          <span className="section-tag">
            SMART MESSAGE CHECKER
          </span>

          <h2>
            Is That Message <span>Really Safe?</span>
          </h2>

          <p>
            Have you received a suspicious SMS, WhatsApp message
            or email? Paste it below to check for common warning signs.
          </p>

        </div>

        <div className="detector-box">

          <div className="detector-top">

            <div>
              <span className="detector-icon">🔍</span>
              <h3>Scam Message Detector</h3>
            </div>

            <span className="basic-badge">
              BASIC CHECKER
            </span>

          </div>

          <textarea
            value={message}
            onChange={e => {
              setMessage(e.target.value);
              setResult(null);
            }}
            placeholder="Paste your suspicious message here..."
            maxLength={5000}
          />

          <div className="detector-footer">

            <span>
              Never include OTPs, passwords or banking details.
            </span>

            <span>{message.length}/5000</span>

          </div>

          <button
            className="analyze-button"
            onClick={checkMessage}
          >
            Analyze Message <span>→</span>
          </button>

          {result && (
            <div className={`result-box ${result.type}`}>
              <h3>{result.title}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>
                {result.description}
              </p>
            </div>
          )}

          <div className="privacy-note">
            🔒 This basic checker processes your text in your browser.
            It does not send it to a server.
          </div>

        </div>

        <p className="disclaimer">
          Disclaimer: This is an educational keyword-based checker,
          not a verified scam detection service. Results are not
          proof that a message is safe or fraudulent.
        </p>

      </section>

      {/* AWARENESS SECTION */}
      <section className="awareness-section" id="awareness">

        <div className="section-heading">

          <span className="section-tag">
            KNOW THE THREATS
          </span>

          <h2>
            Scams You Should <span>Know About.</span>
          </h2>

          <p>
            Learn how scammers operate so you can recognize
            suspicious activity before it causes harm.
          </p>

        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">📩</div>
            <h3>SMS & Phishing Scams</h3>
            <p>
              Fake messages that trick people into clicking
              suspicious links or sharing personal information.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Fraudulent Calls</h3>
            <p>
              Callers pretending to be bank employees,
              government officials or customer support agents.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>UPI & Payment Scams</h3>
            <p>
              Fake payment requests and deceptive transactions
              designed to steal your money.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Job Scams</h3>
            <p>
              Fake job offers that demand registration fees
              or promise unrealistic earnings.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Lottery & Prize Scams</h3>
            <p>
              Fake winnings and prize notifications used
              to trick people into paying money.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏦</div>ss
            <h3>Banking Scams</h3>
            <p>
              Impersonation attempts that target your
              banking credentials and financial information.
            </p>
            <a href="#tips">Learn more →</a>
          </div>

        </div>

      </section>

      {/* SAFETY TIPS */}
      <section className="tips-section" id="tips">

        <div className="tips-content">

          <span className="section-tag">
            STAY CYBER SMART
          </span>

          <h2>
            Your Safety Starts With <span>Small Steps.</span>
          </h2>

          <div className="tip">
            <span>01</span>
            <div>
              <h3>Never Share Your OTP</h3>
              <p>Keep OTPs, PINs and passwords private.</p>
            </div>
          </div>

          <div className="tip">
            <span>02</span>
            <div>
              <h3>Verify Before You Trust</h3>
              <p>
                Contact organizations through their official channels.
              </p>
            </div>
          </div>

          <div className="tip">
            <span>03</span>
            <div>
              <h3>Avoid Suspicious Links</h3>
              <p>
                Don't open unexpected links or attachments.
              </p>
            </div>
          </div>

          <div className="tip">
            <span>04</span>
            <div>
              <h3>Report Cybercrime</h3>
              <p>
                Report suspicious activity to the appropriate authorities.
              </p>
            </div>
          </div>

        </div>

        <div className="tips-visual">

          <div className="tips-shield">🔐</div>

          <h3>
            Your Data.<br />
            Your Identity.<br />
            <span>Your Protection.</span>
          </h3>

          <p>
            Think smart. Stay safe. Help others stay safe too.
          </p>

        </div>

      </section>

      {/* REPORT SECTION */}
      <section className="report-section">

        <div>

          <span className="section-tag">
            NEED HELP?
          </span>

          <h2>Encountered a Cyber Scam?</h2>

          <p>
            If you are in India, report cybercrime through the
            official government portal or call 1930 for
            assistance with financial cyber fraud.
          </p>

        </div>

        <a
          href="https://cybercrime.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="primary-button"
        >
          Report Cybercrime ↗
        </a>

      </section>

      {/* FOOTER */}
      <footer>

        <a href="#home" className="logo">
          🛡️ SCAM<span>SHIELD</span>
        </a>

        <p>
          Stay Alert. Stay Protected. Stay Scam-Free.
        </p>

        <div className="footer-bottom">
          © 2026 Scam Shield. Built for a safer digital world.
        </div>

      </footer>

    </div>
  );
}

export default App;