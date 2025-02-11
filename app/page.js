"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // Score states
  const [scoreDhruv, setScoreDhruv] = useState(0);
  const [scoreZainab, setScoreZainab] = useState(0);

  // Reason for the change
  const [reason, setReason] = useState("");

  // Custom amount for each player
  const [customDhruv, setCustomDhruv] = useState(1);
  const [customZainab, setCustomZainab] = useState(1);

  // History data from DB
  const [history, setHistory] = useState([]);

  // Fetch existing data on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // GET /api/score to load existing scoreboard history
  async function fetchHistory() {
    try {
      const res = await fetch("/api/score");
      const { data, error } = await res.json();
      if (error) {
        console.error("Error fetching score:", error);
        return;
      }
      setHistory(data);

      // Recompute totals
      let totalDhruv = 0;
      let totalZainab = 0;
      data.forEach((item) => {
        if (item.player === "A") totalDhruv += item.change;
        if (item.player === "B") totalZainab += item.change;
      });
      setScoreDhruv(totalDhruv);
      setScoreZainab(totalZainab);
    } catch (err) {
      console.error("Fetch history failed:", err);
    }
  }

  // Handle increment/decrement (and custom amounts)
  async function handleScoreChange(player, amount) {
    if (!reason.trim()) {
      alert("Reason is required.");
      return;
    }
    if (amount === 0) {
      alert("Please enter a non-zero amount.");
      return;
    }

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, change: amount, reason }),
      });
      const { data, error } = await res.json();
      if (error) {
        alert("Error updating score: " + error);
        return;
      }

      // data[0] is the new record
      const newRow = data[0];

      // Update local history
      setHistory((prev) => [newRow, ...prev]);

      // Update local scoreboard
      if (player === "A") {
        setScoreDhruv((prev) => prev + amount);
      } else {
        setScoreZainab((prev) => prev + amount);
      }

      // Clear reason
      setReason("");
    } catch (err) {
      console.error("Error in handleScoreChange:", err);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.scoreboardCard}>
        <h1 style={styles.title}>Scoreboard</h1>

        <div style={styles.playerContainer}>
          {/* Dhruv Section */}
          <div style={styles.playerCard}>
            <h2 style={styles.playerName}>Dhruv</h2>
            <div style={styles.scoreDisplay}>{scoreDhruv}</div>
            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={() => handleScoreChange("A", 1)}>
                add
              </button>
              <button style={styles.btn} onClick={() => handleScoreChange("A", -1)}>
                remove
              </button>
            </div>
            <p style={styles.label}>Custom Amount:</p>
            <input
              type="number"
              value={customDhruv}
              onChange={(e) => setCustomDhruv(parseInt(e.target.value) || 0)}
              style={styles.numInput}
            />
            <div style={styles.btnRow}>
              <button
                style={styles.btn}
                onClick={() => handleScoreChange("A", customDhruv)}
              >
                +{customDhruv}
              </button>
              <button
                style={styles.btn}
                onClick={() => handleScoreChange("A", -customDhruv)}
              >
                -{customDhruv}
              </button>
            </div>
          </div>

          {/* Zainab Section */}
          <div style={styles.playerCard}>
            <h2 style={styles.playerName}>Zainab</h2>
            <div style={styles.scoreDisplay}>{scoreZainab}</div>
            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={() => handleScoreChange("B", 1)}>
                add
              </button>
              <button style={styles.btn} onClick={() => handleScoreChange("B", -1)}>
                remove
              </button>
            </div>
            <p style={styles.label}>Custom Amount:</p>
            <input
              type="number"
              value={customZainab}
              onChange={(e) => setCustomZainab(parseInt(e.target.value) || 0)}
              style={styles.numInput}
            />
            <div style={styles.btnRow}>
              <button
                style={styles.btn}
                onClick={() => handleScoreChange("B", customZainab)}
              >
                +{customZainab}
              </button>
              <button
                style={styles.btn}
                onClick={() => handleScoreChange("B", -customZainab)}
              >
                -{customZainab}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.reasonRow}>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for score change (required)"
            style={styles.reasonInput}
          />
        </div>

        <div style={styles.history}>
          <h3 style={styles.historyTitle}>History</h3>
          {history.length === 0 && <p>No score changes yet.</p>}
          {history.map((item) => {
            const playerName = item.player === "A" ? "Dhruv" : "Zainab";
            return (
              <p key={item.id} style={styles.historyItem}>
                <strong>{playerName}</strong>
                {item.change > 0 ? " gained " : " lost "}
                {Math.abs(item.change)} point
                {Math.abs(item.change) > 1 ? "s" : ""}
                {" — Reason: "}
                {item.reason}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    // Full viewport height with a subtle gradient background
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f9fafb 0%, #e0e7ff 100%)",
    margin: 0,
    padding: 0,
  },
  scoreboardCard: {
    backgroundColor: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
    width: "90%",
    maxWidth: "700px",
    padding: "2rem",
    textAlign: "center",
  },
  title: {
    margin: 0,
    marginBottom: "1.5rem",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#333",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  playerContainer: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2rem",
  },
  playerCard: {
    backgroundColor: "#fdfdfd",
    borderRadius: "0.75rem",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.03)",
    padding: "1rem 1.5rem",
    flex: "1 1 200px",
    maxWidth: "300px",
  },
  playerName: {
    margin: "0.5rem 0",
    fontSize: "1.25rem",
    color: "#333",
  },
  scoreDisplay: {
    fontSize: "2rem",
    fontWeight: 600,
    margin: "0.5rem 0 1rem",
    color: "#1d4ed8", // a nice blue
  },
  btnRow: {
    display: "flex",
    justifyContent: "space-evenly",
    margin: "0.5rem 0",
  },
  btn: {
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s ease",
  },
  label: {
    margin: "0.75rem 0 0.25rem",
    fontWeight: 500,
    color: "#555",
  },
  numInput: {
    width: "80px",
    padding: "0.25rem",
    textAlign: "center",
    marginBottom: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "0.375rem",
  },
  reasonRow: {
    marginBottom: "2rem",
  },
  reasonInput: {
    width: "100%",
    maxWidth: "400px",
    padding: "0.5rem 1rem",
    border: "1px solid #ccc",
    borderRadius: "0.5rem",
    fontSize: "1rem",
  },
  history: {
    textAlign: "left",
    marginTop: "1rem",
  },
  historyTitle: {
    fontSize: "1.25rem",
    marginBottom: "1rem",
    color: "#333",
  },
  historyItem: {
    lineHeight: 1.6,
    margin: "0.25rem 0",
    color: "#444",
  },
};

// Add a hover style for buttons (inline event style)
styles.btn[':hover'] = {
  backgroundColor: "#4f46e5",
};
