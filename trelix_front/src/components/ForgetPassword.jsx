
function ForgetPassword() {
                      return (
                                          <div>
 <section className="signup-sec full-screen">
  <div className="container">
    <div className="row align-items-center">
      <div className="col-xl-5 col-md-5">
        <div className="signup-thumb">
          <img className="img-fluid" src="assets/images/shape-bg.png" alt="Sign Up" />
        </div>
      </div>
      <div className="col-xl-7 col-md-7">
        <div className="login-form">
          <h1 className="display-3 text-center mb-5">Forget Password</h1>
          <form action="#">
            <div className="form-group position-relative">
              <span><i className="feather-icon icon-mail" /></span>
              <input type="email" placeholder="Your Email" required />
            </div>
           
            <button 
  className="btn btn-primary w-100" 
  style={{ 
    padding: "15px", // Augmente la hauteur du bouton
    fontSize: "18px", // Augmente la taille du texte
    borderRadius: "8px" // Arrondi les bords
  }}
>
send
</button>
          
          </form>
        </div>
      </div>
    </div>
  </div>
</section>


</div>

                      );
}
export default ForgetPassword;