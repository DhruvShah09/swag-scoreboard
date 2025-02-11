"use client";

import { useEffect, useState } from "react";

export default function Home() {
  // We’ll continue to keep two local states for scoreboard:
  const [scoreDhruv, setScoreDhruv] = useState(0);
  const [scoreZainab, setScoreZainab] = useState(0);

  const [reason, setReason] = useState("");
  // The history array comes from the DB and is an array of records:
  // { id, player, change, reason, created_at }
  const [history, setHistory] = useState([]);

  // On first render, fetch the existing data
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch all score changes from our API route
  async function fetchHistory() {
    try {
      const res = await fetch("/api/score"); // GET /api/score
      const { data, error } = await res.json();
      if (error) {
        console.error("Error fetching score:", error);
        return;
      }
      // data is an array of rows from "score_changes"
      setHistory(data);

      // Recompute the scores
      let totalDhruv = 0;
      let totalZainab = 0;

      data.forEach((item) => {
        if (item.player === "A") {
          totalDhruv += item.change;
        } else if (item.player === "B") {
          totalZainab += item.change;
        }
      });

      setScoreDhruv(totalDhruv);
      setScoreZainab(totalZainab);
    } catch (err) {
      console.error("Fetch history failed:", err);
    }
  }

  // Handle increment/decrement for Dhruv or Zainab
  async function handleScoreChange(player, delta) {
    if (!reason.trim()) {
      alert("Reason is required.");
      return;
    }

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, change: delta, reason }),
      });
      const { data, error } = await res.json();
      if (error) {
        alert("Error updating score: " + error);
        return;
      }

      // If successful, the new row is returned in data[0]
      const newRow = data[0];

      // Update local history
      setHistory((prev) => [newRow, ...prev]);

      // Update local scoreboard
      if (player === "A") {
        setScoreDhruv((prev) => prev + delta);
      } else {
        setScoreZainab((prev) => prev + delta);
      }

      // Clear reason
      setReason("");
    } catch (err) {
      console.error("Error in handleScoreChange:", err);
    }
  }

  return (
    <div style={styles.container}>
      <h1>Scoreboard</h1>

      <div style={styles.scoreContainer}>
        <div>
          <h2>Dhruv: {scoreDhruv}</h2>
          <button onClick={() => handleScoreChange("A", 1)}>+ Increment</button>
          <button onClick={() => handleScoreChange("A", -1)}>- Decrement</button>
        </div>

        <div>
          <h2>Zainab: {scoreZainab}</h2>
          <button onClick={() => handleScoreChange("B", 1)}>+ Increment</button>
          <button onClick={() => handleScoreChange("B", -1)}>- Decrement</button>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for score change (required)"
          style={styles.input}
        />
      </div>

      <div style={styles.history}>
        <h3>History</h3>
        {history.length === 0 && <p>No score changes yet.</p>}

        {history.map((item) => {
          // Convert item.player = "A" or "B" => user-friendly names
          const playerName = item.player === "A" ? "Dhruv" : "Zainab";

          return (
            <p key={item.id}>
              <strong>{playerName}</strong> 
              {item.change > 0 ? " gained " : " lost "}
              {Math.abs(item.change)} point
              {Math.abs(item.change) > 1 ? "s" : ""} &mdash; 
              Reason: {item.reason}
            </p>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: "2rem",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
  },
  scoreContainer: {
    display: "flex",
    justifyContent: "space-around",
    margin: "2rem 0",
  },
  input: {
    padding: "0.5rem",
    width: "80%",
    maxWidth: "300px",
    marginBottom: "1rem",
  },
  history: {
    marginTop: "2rem",
    textAlign: "left",
  },
};
