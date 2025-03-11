import "./css/Leader.css";
import { useEffect,useState } from "react";
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
// Correct socket connection (only to the base URL)
const socket = io("http://localhost:5000");
    
// Listen for real-time updates - updated to handle full leaderboard
socket.on("leaderboardUpdate", (updatedLeaderboard) => {
  setLeaderboard(updatedLeaderboard);
});

// Clean up socket connection when component unmounts
return () => {
  socket.off("leaderboardUpdate");
  socket.disconnect();
};

}, []);
  return (
    <div>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500&display=swap" rel="stylesheet" />
    <main>
      <div id="header">
        <h1>Ranking Leaderboard</h1>
      </div>
      <div id="leaderboard">
        <div className="ribbon" />
        <table>
        <tbody>
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <tr key={user._id}>
                <td className="number">{index + 1}</td>
                <td className="name">
                  {user.profilePhoto ? <img src={user.profilePhoto} alt="profile" className="profile-pic" /> : null}
                  {user.firstName} {user.lastName}
                </td>
                <td className="points">{user.totalScore.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No users with scores yet.</td>
            </tr>
          )}
        </tbody>
            </table>
      </div>
    </main>
  </div>
  
  )
}

export default Leader
