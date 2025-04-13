import "../css/Footer.css";
function Footer() {
  return (
    <footer className="footer bg-dark py-2">
      <div className="container">
        <div className="row m-4 justify-content-between gap-5">
          <div className="col-lg-3 col-sm-6">
            <div className="footer-widget about-footer mt-5">
              <div className="f-logo">
                <a href="index-2.html">
                  <img src="assets/images/trelix_blanc.png" alt="Logo" />
                </a>
              </div>
              <a
                href="tel:298228289"
                className="display-4 "
                style={{ color: "#007bff", textDecoration: "none" }}
              >
                (+216) 71 888 999
              </a>
              <ul className="mt-4">
                <li className="d-flex align-items-center">
                  <span
                    style={{ color: "inherit", transition: "color 0.3s" }}
                    onMouseOver={(e) => (e.target.style.color = "#007bff")}
                    onMouseOut={(e) => (e.target.style.color = "inherit")}
                  >
                    <i className="feather-icon icon-mail" />
                  </span>
                  <a
                    href="#"
                    style={{ color: "inherit", transition: "color 0.3s" }}
                    onMouseOver={(e) => (e.target.style.color = "inherit")}
                    onMouseOut={(e) => (e.target.style.color = "inherit")}
                  >
                    <span>Support@Trelix.tn</span>
                  </a>
                </li>
                <li
                  className="d-flex align-items-center"
                  style={{ color: "inherit", transition: "color 0.3s" }}
                  onMouseOver={(e) => (e.target.style.color = "#007bff")}
                  onMouseOut={(e) => (e.target.style.color = "inherit")}
                >
                  <span
                    style={{ color: "inherit", transition: "color 0.3s" }}
                    onMouseOver={(e) => (e.target.style.color = "#007bff")}
                    onMouseOut={(e) => (e.target.style.color = "inherit")}
                  >
                    <i className="feather-icon icon-map-pin" />
                  </span>
                  Esprit School of Engineering , El Ghazela
                </li>
              </ul>
            </div>
          </div>
          {/*  Widget End */}
          <div className="col-lg-2 offset-lg-1 col-sm-6">
            <div className="footer-widget mt-5">
              <h3 className="widget-title text-white">Our Company</h3>
              <ul>
                <li>
                  <a href="about.html">About Us</a>
                </li>
                <li>
                  <a href="#">Instructors</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Services</a>
                </li>
                <li>
                  <a href="contact.html">Contact us</a>
                </li>
              </ul>
            </div>
          </div>
          {/*  Widget End */}
          <div className="col-lg-2 col-sm-6">
            <div className="footer-widget mt-5">
              <h3 className="widget-title text-white">Support</h3>
              <ul>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Community Forum</a>
                </li>
                <li>
                  <a href="#">Help</a>
                </li>
              </ul>
            </div>
          </div>
          {/*  Widget End */}
        </div>
        <div className="row footer-bottom">
          <div className="col-lg-6 col-sm-6 order-2 order-sm-1">
            <p className="m-0 text-mute">
              © 2025 Created by{" "}
              <a style={{ color: "#007bff" }} href="#">
                DevStorm
              </a>
              . All Rights Reserved.
            </p>
          </div>
          <div className="col-lg-6 col-sm-6 order-1 order-sm-2">
            <div className="social-share-alt text-lg-end text-mute">
              <a href="#">
                <img src="assets/images/icons/fb-w.png" alt="socialMedia_icon"/>
              </a>
              <a href="#">
                <img src="assets/images/icons/tw-w.png" alt="socialMedia_icon"/>
              </a>
              <a href="#">
                <img src="assets/images/icons/ins-w.png" alt="socialMedia_icon"/>
              </a>
              <a href="#">
                <img src="assets/images/icons/linkedin-w.png" alt="socialMedia_icon"/>
              </a>
              <a href="https://github.com/EyaNehdi/E-Learning_IntegratedLMS">
                <img src="assets/images/icons/github-mark-white.png" alt="socialMedia_icon"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
