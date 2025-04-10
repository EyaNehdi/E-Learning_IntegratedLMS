import "../css/Leader.css";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
function Leader() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [firstPlaceUser, setFirstPlaceUser] = useState(null);

  const awardFirstPlaceBadge = async () => {
    const badgeImageUrl = "/assets/images/firstPlaceBadge.png";

    try {
      const response = await axios.post(
        "http://localhost:5000/api/info/profile/badge",
        {
          badge: "Welcome to Trelix Badge 🏅",
          email: firstPlaceUser.email, // Send the user's email
          badgeImage: badgeImageUrl, // Send the badge image URL
        }
      );
      console.log("Badge awarded:", response.data);
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };

  useEffect(() => {
    // Fetch leaderboard
    axios.get("http://localhost:5000/api/quiz/leaderboard")
      .then(response => {
        setLeaderboard(response.data);

        // Find the user with the highest score
        const highestScoreUser = response.data.reduce((maxUser, user) => {
          return user.totalScore > maxUser.totalScore ? user : maxUser;
        }, response.data[0]);

        setFirstPlaceUser(highestScoreUser);

        // Award first place badge to the user with the highest score
        if (highestScoreUser) {
          awardFirstPlaceBadge(highestScoreUser.email); // Pass the email of the highest scorer
        }
      })
      .catch(error => {
        console.error("Error fetching leaderboard:", error);
      });

    // WebSocket to listen for leaderboard updates
    const socket = io("http://localhost:5000");

    socket.on("leaderboardUpdate", (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);

      // Re-evaluate the highest score user
      const highestScoreUser = updatedLeaderboard.reduce((maxUser, user) => {
        return user.totalScore > maxUser.totalScore ? user : maxUser;
      }, updatedLeaderboard[0]);

      setFirstPlaceUser(highestScoreUser);

      // Award first place badge if there's a new highest scorer
      if (highestScoreUser) {
        awardFirstPlaceBadge(highestScoreUser.email); // Pass the email of the highest scorer
      }
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
                        <img src={`http://localhost:5000${user.profilePhoto}`} alt="profile" className="leaderboard-profile-pic" />
                      )}
                      </td>
                      <td className="leaderboard-name">
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
