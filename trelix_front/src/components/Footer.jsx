function Footer() {
                      return (
<footer className="footer bg-dark">
<div className="container">
  <div className="row">
    <div className="col-lg-3 col-sm-6">
      <div className="footer-widget about-footer">
        <div className="f-logo">
          <a href="index-2.html"><img src="assets/images/f-logo.png" alt="Logo" /></a>
        </div>
        <a href="tel:298228289" className="display-4 cta-link text-secondary">+88 029 345 702</a>
        <ul className="mt-4">
          <li className="d-flex align-items-center">
            <span><i className="feather-icon icon-mail" /></span>
            <a href="../cdn-cgi/l/email-protection.html#5f363139301f26302a2d3b30323e3631713c3032"><span className="__cf_email__" data-cfemail="0e676068614e77617b7c6a61636f6760206d6163">[email&nbsp;protected]</span></a>
          </li>
          <li className="d-flex align-items-center">
            <span><i className="feather-icon icon-map-pin" /></span>
            55 Green Street, New York
          </li>
        </ul>
      </div>
    </div>
    {/*  Widget End */}
    <div className="col-lg-2 offset-lg-1 col-sm-6">
      <div className="footer-widget">
        <h3 className="widget-title text-white">Company</h3>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="#">Instructors</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="contact.html">Contact us</a></li>
        </ul>
      </div>
    </div>
    {/*  Widget End */}
    <div className="col-lg-2 col-sm-6">
      <div className="footer-widget">
        <h3 className="widget-title text-white">Categories</h3>
        <ul>
          <li><a href="#">Ui/Ux Design</a></li>
          <li><a href="#">Web Development</a></li>
          <li><a href="#">Data Sciences</a></li>
          <li><a href="#">Art &amp; Design</a></li>
          <li><a href="contact.html">Digital Marketing</a></li>
        </ul>
      </div>
    </div>
    {/*  Widget End */}
    <div className="col-lg-4 ps-xxl-5 col-sm-6">
      <div className="footer-widget post-widget">
        <h3 className="widget-title text-white">Latest From Blogs</h3>
        <div className="recent-posts">
          <div className="d-flex recent-entry">
            <div className="entry-thumb">
              <a href="single-post.html"><img src="assets/images/post1.jpg" alt="Post" /></a>
            </div>
            <div className="entry-content ms-3">
              <h4 className="display-6 text-info"><a href="single-post.html">Education Turns Filthy Mind Into Open Mind</a></h4>
              <div className="entry-meta">
                <span><i className="feather-icon icon-calendar" />29 Jun 2024</span>
                <span><i className="feather-icon icon-clock" />4 Min Read</span>
              </div>
            </div>
          </div>
          <div className="d-flex recent-entry">
            <div className="entry-thumb">
              <a href="single-post.html"><img src="assets/images/post2.jpg" alt="Post" /></a>
            </div>
            <div className="entry-content ms-3">
              <h4 className="display-6 text-info"><a href="single-post.html">Education Turns Filthy Mind Into Open Mind</a></h4>
              <div className="entry-meta">
                <span><i className="feather-icon icon-calendar" />29 Jun 2024</span>
                <span><i className="feather-icon icon-clock" />4 Min Read</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/*  Widget End */}
  </div>
  <div className="row footer-bottom">
    <div className="col-lg-6 col-sm-6 order-2 order-sm-1">
      <p className="m-0 text-mute">© 2024 Design by <a className="text-secondary" href="https://www.theme-village.com/">Themevillage</a>. All Rights Reserved.</p>
    </div>
    <div className="col-lg-6 col-sm-6 order-1 order-sm-2">
      <div className="social-share-alt text-lg-end text-mute">
        <a href="#"><img src="assets/images/icons/fb-w.png" alt /></a>
        <a href="#"><img src="assets/images/icons/tw-w.png" alt /></a>
        <a href="#"><img src="assets/images/icons/ins-w.png" alt /></a>
        <a href="#"><img src="assets/images/icons/linkedin-w.png" alt /></a>
      </div>
    </div>
  </div>
</div>
</footer>
                      );
}
export default Footer;