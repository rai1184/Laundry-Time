import React, { useMemo, useState } from "react";
import "./design.css";

const initialMachines = [
  { id: "W-101", type: "Washer", floor: "1st floor", status: "Available", queue: 0 },
  { id: "W-102", type: "Washer", floor: "1st floor", status: "In use", remaining: 18, queue: 2 },
  { id: "W-103", type: "Washer", floor: "1st floor", status: "Available", queue: 1 },
  { id: "W-104", type: "Washer", floor: "1st floor", status: "Maintenance", queue: 0 },
  { id: "D-101", type: "Dryer", floor: "1st floor", status: "Available", queue: 0 },
  { id: "D-102", type: "Dryer", floor: "1st floor", status: "In use", remaining: 7, queue: 1 },
  { id: "D-103", type: "Dryer", floor: "1st floor", status: "Available", queue: 0 },
  { id: "D-104", type: "Dryer", floor: "1st floor", status: "In use", remaining: 31, queue: 0 },
];

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    washer: <><circle cx="12" cy="13" r="6.5" /><path d="M4.5 8h15M8 4h.01M11 4h.01M4 20h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    history: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1 .9-1.8 1.2-1.8 2.7M12 17h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    sparkles: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function MachineCard({ machine, onAction }) {
  const inUse = machine.status === "In use";
  const maintenance = machine.status === "Maintenance";

  return (
    <article className={`machine-card${inUse ? " machine-card-active" : ""}`}>
      <div className="machine-card-top">
        <div className={`machine-icon ${machine.type.toLowerCase()}`}>
          <Icon name="washer" size={22} />
        </div>
        <span className={`status-pill ${machine.status.toLowerCase().replace(" ", "-")}`}>
          <span className="status-dot" />
          {machine.status}
        </span>
      </div>
      <div className="machine-title-row">
        <div>
          <p className="machine-kind">{machine.type}</p>
          <h3>{machine.id}</h3>
        </div>
        <span className="machine-floor">{machine.floor}</span>
      </div>
      <div className="machine-card-bottom">
        {inUse ? (
          <div className="machine-time">
            <Icon name="clock" size={16} />
            <span><strong>{machine.remaining} min</strong> left</span>
          </div>
        ) : maintenance ? (
          <span className="machine-note">Temporarily unavailable</span>
        ) : machine.queue > 0 ? (
          <span className="machine-note">{machine.queue} {machine.queue === 1 ? "person" : "people"} waiting</span>
        ) : (
          <span className="machine-note">Ready for a fresh load</span>
        )}
        <button
          className={`machine-action${inUse ? " action-quiet" : ""}`}
          disabled={maintenance}
          onClick={() => onAction(machine.id)}
          aria-label={inUse ? `Join queue for ${machine.id}` : `Start a cycle on ${machine.id}`}
          title={maintenance ? "This machine is being serviced" : undefined}
        >
          {maintenance ? "Unavailable" : inUse ? "Join queue" : "Start cycle"}
          {!maintenance && <Icon name={inUse ? "plus" : "chevron"} size={16} />}
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [machines, setMachines] = useState(initialMachines);
  const [filter, setFilter] = useState("All machines");
  const [notice, setNotice] = useState("");

  const filteredMachines = useMemo(() => {
    if (filter === "Washers") return machines.filter((machine) => machine.type === "Washer");
    if (filter === "Dryers") return machines.filter((machine) => machine.type === "Dryer");
    return machines;
  }, [filter, machines]);

  const availableCount = machines.filter((machine) => machine.status === "Available").length;
  const runningCount = machines.filter((machine) => machine.status === "In use").length;
  const queueCount = machines.reduce((total, machine) => total + machine.queue, 0);

  function handleMachineAction(machineId) {
    const selected = machines.find((machine) => machine.id === machineId);
    if (!selected) return;

    if (selected.status === "In use") {
      setMachines((current) => current.map((machine) =>
        machine.id === machineId ? { ...machine, queue: machine.queue + 1 } : machine
      ));
      setNotice(`You’ve joined the queue for ${machineId}.`);
      return;
    }

    setMachines((current) => current.map((machine) =>
      machine.id === machineId
        ? { ...machine, status: "In use", remaining: machine.type === "Washer" ? 38 : 45 }
        : machine
    ));
    setNotice(`Your ${machineId} cycle is ready to go.`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="Spin home">
          <span className="brand-mark"><Icon name="washer" size={24} /></span>
          <span>spin<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item selected" href="#dashboard"><Icon name="grid" />Overview</a>
          <a className="nav-item" href="#machines"><Icon name="washer" />Machines</a>
          <a className="nav-item" href="#activity"><Icon name="history" />My activity</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon"><Icon name="sparkles" size={18} /></span>
            <p className="tip-title">Laundry day, made easy.</p>
            <p className="tip-copy">Check availability before you head down.</p>
          </div>
          <a className="nav-item help-link" href="#help"><Icon name="help" />Help &amp; support</a>
          <div className="profile">
            <div className="avatar">JD</div>
            <div className="profile-copy"><strong>Jamie Davis</strong><span>Maple Hall · Room 204</span></div>
            <button className="profile-menu" aria-label="Profile options">···</button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumbs"><span>Maple Hall</span><Icon name="chevron" size={15} /><strong>Laundry room</strong></div>
          <div className="topbar-actions">
            <span className="room-status"><span className="live-dot" />Room is open</span>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" size={19} /><span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">THURSDAY, OCTOBER 22</p>
              <h1>Good morning, Jamie <span className="wave">✳</span></h1>
              <p className="welcome-copy">A little less waiting, a little more living.</p>
            </div>
            <button className="location-select"><span className="location-pin">⌖</span>Maple Hall <span className="select-caret">⌄</span></button>
          </section>

          <section className="summary-grid" aria-label="Laundry room summary">
            <article className="summary-card">
              <span className="summary-icon available-icon"><Icon name="check" size={18} /></span>
              <div className="summary-label">Ready to use</div>
              <div className="summary-value">{availableCount}<span className="summary-unit"> machines</span></div>
              <span className="summary-foot"><span className="summary-live-dot" />Available right now</span>
            </article>
            <article className="summary-card">
              <span className="summary-icon running-icon"><Icon name="clock" size={18} /></span>
              <div className="summary-label">Currently running</div>
              <div className="summary-value">{runningCount}<span className="summary-unit"> machines</span></div>
              <span className="summary-foot">Live cycle estimates</span>
            </article>
            <article className="summary-card">
              <span className="summary-icon queue-icon"><Icon name="history" size={18} /></span>
              <div className="summary-label">People in line</div>
              <div className="summary-value">{queueCount}<span className="summary-unit"> waiting</span></div>
              <span className="summary-foot">Across all machines</span>
            </article>
          </section>

          <section className="machines-section" id="machines">
            <div className="section-heading">
              <div>
                <div className="heading-title-wrap"><h2>Machines</h2><span className="machine-count">{machines.length}</span></div>
                <p className="section-subtitle">Find your perfect machine and get on with your day.</p>
              </div>
              <div className="filter-tabs" role="tablist" aria-label="Filter machines">
                {["All machines", "Washers", "Dryers"].map((option) => (
                  <button
                    key={option}
                    className={`filter-tab${filter === option ? " active" : ""}`}
                    role="tab"
                    aria-selected={filter === option}
                    onClick={() => setFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="machine-grid">
              {filteredMachines.map((machine) => (
                <MachineCard key={machine.id} machine={machine} onAction={handleMachineAction} />
              ))}
            </div>
            <div className="refresh-note"><span className="refresh-indicator" />Sample room data · machine actions are preview-only</div>
          </section>

          <section className="activity-banner" id="activity">
            <span className="banner-icon"><Icon name="sparkles" size={21} /></span>
            <div><strong>Make the most of your laundry time</strong><p>We’ll let you know when your machine is almost done.</p></div>
            <button onClick={() => setNotice("Alerts will be available when this room is connected to the laundry service.")}>Set up alerts <Icon name="chevron" size={16} /></button>
          </section>
        </div>
      </main>
      {notice && (
        <div className="toast" role="status">
          <span className="toast-check"><Icon name="check" size={15} /></span>
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </div>
  );
}