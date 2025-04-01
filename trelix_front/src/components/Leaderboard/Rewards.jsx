import "../css/Rewards.css";
function Rewards() {
    const First = "/assets/images/firstPlaceBadge.png";
const Ten = "/assets/images/scoreTenBadge.png";
  return (
    <div className="rewards">
      <h2>Rewards</h2>
      <p>Keep playing everyday in order to win </p>
      <img src={First} alt='badge first place' />
      <p>First Place Badge</p>
      <br/>
        <img src={Ten} alt='badge Ten Score' />
        <p>Score Ten Badge</p>
        <br/>
    
    </div>
  )
}

export default Rewards
