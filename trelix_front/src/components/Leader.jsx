import "./css/Leader.css";
function Leader() {
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
          <tbody><tr>
              <td className="number">1</td>
              <td className="name">Lee Taeyong</td>
              <td className="points">
                258.244 <img className="gold-medal" src="https://github.com/malunaridev/Challenges-iCodeThis/blob/master/4-leaderboard/assets/gold-medal.png?raw=true" alt="gold medal" />
              </td>
            </tr>
            <tr>
              <td className="number">2</td>
              <td className="name">Mark Lee</td>
              <td className="points">258.242</td>
            </tr>
            <tr>
              <td className="number">3</td>
              <td className="name">Xiao Dejun</td>
              <td className="points">258.223</td>
            </tr>
            <tr>
              <td className="number">4</td>
              <td className="name">Qian Kun</td>
              <td className="points">258.212</td>
            </tr>
            <tr>
              <td className="number">5</td>
              <td className="name">Johnny Suh</td>
              <td className="points">258.208</td>
            </tr>
          </tbody></table>
        <div id="buttons">
          <button className="exit">Exit</button>
          
        </div>
      </div>
    </main>
  </div>
  
  )
}

export default Leader
