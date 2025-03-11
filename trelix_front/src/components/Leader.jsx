import "./css/Leader.css";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

function Leader() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/quiz/leaderboard")
      .then(response => {
        setLeaderboard(response.data);
      })
      .catch(error => {
        console.error("Error fetching leaderboard:", error);
      });

    const socket = io("http://localhost:5000");

    socket.on("leaderboardUpdate", (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    });

    return () => {
      socket.off("leaderboardUpdate");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="leaderboard-container">
      <main className="leaderboard-main">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">Ranking Leaderboard</h1>
        </div>
        <div className="leaderboard-content">
          <div className="leaderboard-ribbon" />
          <table className="leaderboard-table">
            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((user, index) => (
                  <tr key={user._id} className="leaderboard-row">
                    <td className="leaderboard-rank">{index + 1}</td>
                    <td className="leaderboard-name">
                      {user.profilePhoto && (
                        <img src={user.profilePhoto} alt="profile" className="leaderboard-profile-pic" />
                      )}
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="leaderboard-score">{user.totalScore.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="leaderboard-empty">No users with scores yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Leader;
