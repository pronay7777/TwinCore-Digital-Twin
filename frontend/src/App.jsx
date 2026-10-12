
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  BatteryCharging,
  Thermometer,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Gauge,
  RefreshCw,
} from "lucide-react";
import "./App.css";

function App() {
  const [data, setData] = useState({
    temperature: 32.4,
    voltage: 48.6,
    current: 4.2,
    charge: 82,
  });

  const [running, setRunning] = useState(true);
  const [savedHistory, setSavedHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  
  
  useEffect(() => {
    if (!running) return;

    const fetchTelemetry = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/telemetry"
        );

        setData({
          temperature: response.data.temperature,
          voltage: response.data.voltage,
          current: response.data.current,
          charge: response.data.charge,
          status: response.data.status,
        });

        setHistory((previous) => [
          ...previous,
          {
            time: new Date().toLocaleTimeString(),
            temperature: response.data.temperature,
            voltage: response.data.voltage,
            current: response.data.current,
          },
        ].slice(-20));

      } catch (error) {
        console.error("Telemetry error:", error.message);
      }
    };

    fetchTelemetry();
    const timer = setInterval(fetchTelemetry, 2000);

    return () => clearInterval(timer);
  }, [running]);

  const fetchSavedHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/telemetry/history"
      );

      setSavedHistory(response.data);
    } catch (error) {
      console.error("History fetch error:", error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedHistory();
  }, []);

  const [history, setHistory] = useState([]);



  const cards = [
    {
      title: "Battery Temperature",
      value: data.temperature,
      unit: "°C",
      icon: Thermometer,
      color: "orange",
    },
    {
      title: "Battery Voltage",
      value: data.voltage,
      unit: "V",
      icon: Zap,
      color: "blue",
    },
    {
      title: "Current",
      value: data.current,
      unit: "A",
      icon: Activity,
      color: "purple",
    },
    {
      title: "State of Charge",
      value: data.charge,
      unit: "%",
      icon: BatteryCharging,
      color: "green",
    },
  ];

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <BatteryCharging size={30} />
          <div>
            <h2>TwinCore</h2>
            <span>Digital Twin Platform</span>
          </div>
        </div>

        <p className="menu-label">WORKSPACE</p>
        <div className="nav-item active">
          <Gauge size={19} /> Dashboard
        </div>
        <div className="nav-item">
          <Activity size={19} /> Live Analytics
        </div>
        <div className="nav-item">
          <ShieldCheck size={19} /> System Health
        </div>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          Simulation engine ready
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">DIGITAL TWIN / OVERVIEW</p>
            <h1>Battery Monitoring</h1>
            <p className="subtitle">
              Monitor, simulate and understand your battery system.
            </p>
          </div>

          <button
            className="run-button"
            onClick={() => setRunning(!running)}
          >
            <RefreshCw size={17} />
            {running ? "Pause simulation" : "Resume simulation"}
          </button>
        </header>

        <div className="notice">
          <Activity size={18} />
          <span>
            <strong>Simulation mode:</strong> Values are generated locally
            for demonstration, not measured from a real battery.
          </span>
          <span className="live-badge">
            <span className="status-dot" />
            {running ? "RUNNING" : "PAUSED"}
          </span>
        </div>

        <div className="section-heading">
          <div>
            <h2>System telemetry</h2>
            <p>48 V battery pack · Simulated sensor readings</p>
          </div>
          <span className="updated">Refreshes every 2 seconds</span>
        </div>

        <div className="metrics-grid">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="metric-card" key={card.title}>
                <div className="metric-top">
                  <span>{card.title}</span>
                  <div className={`metric-icon ${card.color}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <div className="metric-value">
                  {card.value}
                  <span>{card.unit}</span>
                </div>

                <div className="metric-footer">
                  <span className="status-dot" />
                  Simulation reading
                </div>
              </article>
            );
          })}
        </div>

        
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Live telemetry analytics</h2>
              <p>Latest 20 readings from the Python simulation</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29364b" />
                <XAxis
                  dataKey="time"
                  stroke="#8997ac"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#8997ac" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#111a2b",
                    border: "1px solid #243047",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#fb923c"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  name="Voltage (V)"
                  stroke="#60a5fa"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>


        <div className="lower-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>Battery condition</h2>
                <p>Current simulated state</p>
              </div>
              <ShieldCheck color="#34d399" size={24} />
            </div>

            
            <div className="health-score">
              <span className={data.temperature >= 40 ? "warning-text" : "good"}>
                {data.temperature >= 40 ? "Warning" : "Healthy"}
              </span>

              <strong>
                {data.temperature >= 40
                  ? "High temperature detected"
                  : "Normal simulated operation"}
              </strong>
            </div>


            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${data.charge}%` }}
              />
            </div>

            <div className="progress-labels">
              <span>Remaining charge</span>
              <strong>{data.charge}%</strong>
            </div>

            <div className="detail-row">
              <span>Battery configuration</span>
              <strong>48 V nominal</strong>
            </div>
            <div className="detail-row">
              <span>Simulation status</span>
              <strong className="good">Operational</strong>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>System alerts</h2>
                <p>Threshold-based demonstration</p>
              </div>
              <AlertTriangle color="#fbbf24" size={24} />
            </div>

            
            {data.temperature >= 40 ? (
                <div className="alert-item warning">
                  <AlertTriangle size={19} />
                  <div>
                    <strong>High temperature detected</strong>
                    <p>
                      Current simulated temperature: {data.temperature} °C.
                      Check the simulation and cooling assumptions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="alert-item success">
                  <ShieldCheck size={19} />
                  <div>
                    <strong>No active temperature alerts</strong>
                    <p>Temperature remains below 40 °C.</p>
                  </div>
                </div>
              )}

            <div className="detail-row">
              <span>Monitoring</span>
              <strong>Temperature</strong>
            </div>
            <div className="detail-row">
              <span>Alert threshold</span>
              <strong>40 °C</strong>
            </div>
          </article>
        </div>

        
        <article className="panel history-panel">
          <div className="panel-heading">
            <div>
              <h2>Stored telemetry history</h2>
              <p>Readings saved in your MySQL database</p>
            </div>

            
            <div className="history-actions">
              <button
                className="run-button"
                onClick={fetchSavedHistory}
                disabled={historyLoading}
              >
                {historyLoading ? "Loading..." : "Refresh history"}
              </button>

              <button
                className="run-button"
                onClick={() =>
                  window.open(
                    "http://127.0.0.1:8000/api/telemetry/export",
                    "_blank"
                  )
                }
              >
                Export CSV
              </button>
            </div>


            <button
              className="run-button"
              onClick={() =>
                window.open(
                  "http://127.0.0.1:8000/api/telemetry/export",
                  "_blank"
                )
              }
            >
              Export CSV
            </button>
          </div>

          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Temperature</th>
                  <th>Voltage</th>
                  <th>Current</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Recorded at</th>
                </tr>
              </thead>

              <tbody>
                {savedHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.temperature} °C</td>
                    <td>{row.voltage} V</td>
                    <td>{row.current} A</td>
                    <td>{row.charge}%</td>
                    <td>{row.status}</td>
                    <td>
                      {row.recorded_at
                        ? new Date(row.recorded_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {savedHistory.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      No saved readings found. Generate telemetry and refresh.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>


        <footer>
          TwinCore · Digital Twin with Python · Educational prototype
        </footer>
      </section>
    </main>
  );
}

export default App;
