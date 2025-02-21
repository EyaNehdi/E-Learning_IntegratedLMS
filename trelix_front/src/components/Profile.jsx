import Aside from './Aside';
import Footer from './Footer';
import Header from './Header';
function Profile() {
                      return (
<div>
  {/* Mirrored from html.theme-village.com/eduxo/student-profile.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:24 GMT */}
  <meta charSet="utf-8" />
  <meta httpEquiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="description" content="An ideal tempalte for online education, e-Learning, Course School, Online School, Kindergarten, Classic LMS, University, Language Academy, Coaching, Online Course, Single Course, and Course marketplace." />
  <meta name="keywords" content="bootstrap 5, online course, education, creative, gulp, business, minimal, modern, course, one page, responsive, saas, e-Learning, seo, startup, html5, site template" />
  <meta name="author" content="theme-village" />
  <title>Trelix</title>
  <link rel="apple-touch-icon" href="images/favicon.png" />
  <link rel="shortcut icon" href="images/favicon.ico" />
  <link rel="stylesheet" href="css/feather.css" />
  <link rel="stylesheet" href="css/nice-select2.css" />
  <link href="css/glightbox.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="css/swiper-bundle.min.css" />
  {/* Style css */}

  {/*[if lt IE 9]>
    
    
    <![endif]*/}
  {/* Preloader */}
  <div id="preloader">
    <div className="preloader">
      <span />
      <span />
    </div>
  </div>

  <Header/>


  {/* Header End */}
  <div className="dashbaord-promo position-relative" />
  {/* Dashboard Cover Start */}
  <div className="dashbaord-cover bg-shade sec-padding">
    <div className="container">
      <div className="row">
        <div className="col-lg-12 position-relative">
          <div className="dash-cover-bg rounded-3" style={{backgroundImage: 'url("assets/images/student_bg.jpg")'}} />
          <div className="dash-cover-info d-sm-flex justify-content-between align-items-center">
            <div className="ava-wrap d-flex align-items-center">
              <div className="avatar me-3 rounded-circle"><img width={150} src="assets/images/avatar.png" className="rounded-circle" alt="Avatar" /></div>
              <div className="ava-info">
                <h4 className="display-5 text-white mb-0">Maria Carey Mc.</h4>
                <div className="ava-meta text-white mt-1">
                  <span><i className="feather-icon icon-book" /> 6 Courses Enrolled </span>
                  <span><i className="feather-icon icon-award" />3 cerficates</span>
                </div>
              </div>
            </div>
            <a href="courses.html" className="btn btn-sm btn-info rounded-5"><i className="feather-icon icon-plus me-2" />Join New
              Course</a>
          </div>
        </div>
      </div>
      {/* Dashboard Inner Start */}
      <div className="row mt-5">
        <div className="col-lg-3">

       <Aside/>

        </div>
        <div className="col-lg-9 ps-lg-4">
          <section className="dashboard-sec">
            <h3 className="widget-title mb-4">My Profile</h3>
            <div className="profile-info border rounded-3">
              <ul>
                <li><span>UserName</span>admin</li>
                <li><span>Email</span><a href="../cdn-cgi/l/email-protection.html" className="__cf_email__" data-cfemail="91f0f5fcf8fffbfef4d1f6fcf0f8fdbff2fefc">[email&nbsp;protected]</a></li>
                <li><span>First Name</span>Maria </li>
                <li><span>Last Name</span>Macoy</li>
                <li><span>Phone Number</span>+770 413 92 562</li>
                <li><span>Skill/Occupation</span>Full Stack Developer</li>
                <li><span>Registration Date</span>Septembor 29, 2024 8:30 am</li>
                <li><span>Biography</span>My name is Tariq, and I am a seasoned Front End and WordPress
                  Developer with extensive experience since 2015. I possess
                  a diverse skill set that includes proficiency in WordPress, HTML, CSS, Sass, Bootstrap,
                  React, JavaScript, jQuery</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
<Footer/>
  <div className="back-top"><i className="feather-icon icon-chevron-up" /></div>

</div>
                      );
}
export default Profile;
