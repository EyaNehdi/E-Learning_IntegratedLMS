import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import  { useEffect, useState } from "react";
import axios from "axios";
function Index() {
    const [categories, setCategories] = useState([]);
    const [countStudent, setCountStudent] = useState(0);
    const [countInstructor,setCountInstructor] = useState(0);
    const [countCourses,setCountCourses] = useState(0);
    const [instructorsMeet,setInstructorsMeet] = useState([]);
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await axios.get("http://localhost:5000/courses/categories");
          setCategories(res.data);
        } catch (err) {
          console.error("Erreur lors du fetch des catégories:", err);
        }
      };
  
      fetchCategories();
    }, []);

    useEffect(() => {
      const fetchStudents = async () =>{
        try {
          const res = await axios.get('http://localhost:5000/api/admin/count/student') ;// adapt path if needed
          setCountStudent(res.data.count); // assuming the response has a count property
        }
        catch(err){
          console.error("Error fetching student count:", err);
        }
      };
      const fetchInstructors = async () =>{
        try {
          const res = await axios.get('http://localhost:5000/api/admin/count/instructor') ;// adapt path if needed
          setCountInstructor(res.data.count); // assuming the response has a count property
        }
        catch(err){
          console.error("Error fetching instructor count:", err);
        }
      };
      const fetchCoursesNumber = async () =>{
        try {
          const res = await axios.get('http://localhost:5000/course/count/courses') ;// adapt path if needed
          setCountCourses(res.data.count); // assuming the response has a count property
        }
        catch(err){
          console.error("Error fetching instructor count:", err);
        }
      };
      const MeetOurInstructors = async () =>{
        try {
          const res = await axios.get('http://localhost:5000/api/admin/instructors'); // adapt if needed
        setInstructorsMeet(res.data);
      } catch (err) {
        console.error("Error fetching instructors:", err);
      }
      };
      fetchStudents();
      fetchInstructors();
      fetchCoursesNumber();
      MeetOurInstructors();
      
    }, []);

                      return (
<div>
  {/* Mirrored from html.theme-village.com/eduxo/ by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:25:31 GMT */}
  <meta charSet="utf-8" />
  <meta httpEquiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="description" content="An ideal tempalte for online education, e-Learning, Course School, Online School, Kindergarten, Classic LMS, University, Language Academy, Coaching, Online Course, Single Course, and Course marketplace." />
  <meta name="keywords" content="bootstrap 5, online course, education, creative, gulp, business, minimal, modern, course, one page, responsive, saas, e-Learning, seo, startup, html5, site template" />
  <meta name="author" content="theme-village" />
  <title>Trelix - Smart Learning management system</title>
  <link rel="apple-touch-icon" href="assets/images/favicon.png" />
  <link rel="shortcut icon" href="assets/images/favicon.ico" />
  <link rel="stylesheet" href="assets/css/feather.css" />
  <link rel="stylesheet" href="assets/css/nice-select2.css" />
  <link href="assets/css/glightbox.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/swiper-bundle.min.css" />
  {/* Style css */}


  {/* Header  */}
  
<Header/>



  {/* Banner Section Start */}
  <section className="banner-sec position-relative overflow-hidden">
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="d-md-flex align-items-center banner-content">
            <div className="img-meta d-none d-md-block position-absolute">
              <img src="assets/images/icons/shape1.png" alt />
            </div>
            <h1 className="display-1 fw-bold">Education is the Way to <span className="color">Success</span></h1>
            <div className="banner-info">
              <p className="display-5">Education is a key to success and freedom from all the forces is a power and makes a person powerful</p>
              <a href="#" className="btn btn-primary shadow mt-3 rounded-5">Get Started on your first course</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="banner-bottom d-md-flex position-relative">
      <div className="banner-bg">
        <img src="assets/images/banner.jpg" alt="Banner" />
      </div>
      <div className="banner-stat bg-secondary p-4">
        <div className="d-flex single-stat">
          <div className="icon-lg rounded-circle">
            <img src="assets/images/icons/graduation-cap.png" alt="graduate" />
          </div>
          <div className="stat-info text-info ms-4">
            {/* Student count */}
            <div className="display-3"><span data-purecounter-start={0} data-purecounter-end={8754} className="purecounter">{countStudent}</span>+</div>
            <p>Students Enrolled</p>
          </div>
        </div>
        <div className="d-flex single-stat">
          <div className="icon-lg rounded-circle">
            <img src="assets/images/icons/graduate.png" alt />
          </div>
          <div className="stat-info text-info ms-4">
            {/* Instructor count */}
            <div className="display-3"><span data-purecounter-start={0} data-purecounter-end={245} className="purecounter">{countInstructor}</span>+</div>
            <p>Certified Teachers</p>
          </div>
        </div>
        <div className="d-flex single-stat">
          <div className="icon-lg rounded-circle">
            <img src="assets/images/icons/open-book.png" alt />
          </div>
          <div className="stat-info text-info ms-4">
            {/* Course count */}
            <div className="display-3"><span data-purecounter-start={0} data-purecounter-end={15} className="purecounter">{countCourses}</span>+</div>
            <p> Courses</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* Banner Section End */}
   {/* Categories Section Start */}
   <section className="categories-sec sec-padding position-relative">
      <div className="container">
        <img src="assets/images/icons/dots1.png" alt="Dot 1" className="anim-img" />
        <div className="text-center sec-intro">
          <h2 className="sec-title">
            Find Your <span className="color">Category</span>
          </h2>
        </div>
        <div className="row g-4">
          {categories.map((cat, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <a href="courses.html" className="category-entry d-flex bg-info p-3 p-xl-4 align-items-center">
                <span className="icon-lg rounded-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
                    {/* icône fixe ou tu peux l'associer dynamiquement si tu veux */}
                    <path d="M5.44 8.32a3.844..." />
                  </svg>
                </span>
                <div className="cat-info">
                  <h4 className="display-5">{cat.categorie}</h4>
                  <small>{cat.totalCourses} Total Courses</small>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
    {/* Categories Section End */}
        {/* CTA Section Start */}
        <section
          className="cta-1 overly"
          style={{
            background:
              'url("assets/images/cta-bg.jpg") no-repeat center center / cover',
          }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-sm-8 col-lg-7">
                <div className="consul-txt">
                  <span className="badge-lg bg-info text-primary rounded-5">
                    Conception and Development
                  </span>
                  <h2 className="sec-title text-info">
                    Checkout how this platform has been developped by{" "}
                    <span className="color">DevStorm</span>
                  </h2>
                </div>
              </div>
              <div className="col-sm-4 col-lg-3 offset-lg-2">
                <div className="consul-video text-center">
                  <div className="video-block position-relative">
                    <div className="waves wave-1" />
                    <div className="waves wave-2" />
                    <div className="waves wave-3" />
                    <a
                      className="cover-video"
                      href="https://github.com/EyaNehdi/E-Learning_IntegratedLMS"
                    >
                      <img
                        src="assets/images/icons/play.png"
                        alt="asset_link_alt"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section End */}
  {/* About Section Start */}
  <section className="about-sec sec-padding position-relative overflow-hidden">
    <div className="anim-img anim-right"><img src="assets/images/icons/shape-plate.png" alt /></div>
    <div className="container">
      <div className="row">
        <div className="col-xl-6 col-md-8">
          <div className="about-media overly">
            <div className="category-entry active d-flex p-3 p-xl-4 align-items-center">
              <span className="icon-lg rounded-circle">
                <img src="assets/images/icons/graduate.png" alt />
              </span>
              <div className="cat-info ms-4">
                <h3 className="display-3"><span data-purecounter-start={0} data-purecounter-end={8871} className="purecounter">{countStudent}</span>+</h3>
                <small>Enrolled Students</small>
              </div>
            </div>
            <div className="d-flex align-items-baseline justify-content-between">
              <img className="img-fluid me-3" src="assets/images/about-lg.jpg" alt="About Image" />
              <img className="img-fluid d-none d-sm-block" src="assets/images/about-sm.jpg" alt="About Image" />
            </div>
          </div>
        </div>
        <div className="col-xl-5 offset-xl-1 col-md-8">
          <div className="about-txt">
            <span className="badge-lg bg-primary rounded-5">About Us</span>
            <h2 className="sec-title">We Makes a Door to <span className="color">Bright Future</span></h2>
            <div className="about-lists mt-5">
              <div className="d-flex about-item">
                <span className="icon icon-sm bg-light rounded-circle"><img src="assets/images/icons/pencil.png" alt="pencil" /></span>
                <div className="ms-3">
                  <h3 className="display-5">Education is Power</h3>
                  <p>The cost of ignorance exceed that of education teaches us how to achieve success</p>
                </div>
              </div>
              <div className="d-flex about-item">
                <span className="icon icon-sm bg-light rounded-circle"><img src="assets/images/icons/bulb.png" alt="pencil" /></span>
                <div className="ms-3">
                  <h3 className="display-5">Knowledge for Life</h3>
                  <p>Education is smart enough to change the human mind positively your Door to The Future</p>
                </div>
              </div>
              <a href="about.html" className="btn btn-primary shadow rounded-5">Learn More us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* About Section End */}
  {/* Course Section Start */}
  <div className="course-sec sec-padding">
    <div className="container">
      <div className="d-flex justify-content-between align-items-top">
        <div className="sec-intro">

          <h2 className="sec-title mb-4">Our Popular <span className="color">Courses</span></h2>
        </div>
        <div className="custom-nav d-flex gap-3 align-items-center">
          {/* navigation */}
          <div className="button-next icon-sm text-info"><i className="feather-icon icon-arrow-left" /></div>
          <div className="button-prev icon-sm text-info"><i className="feather-icon icon-arrow-right" /></div>
        </div>
      </div>
    </div>
    <div className="swiper course-slider">
      <div className="swiper-wrapper py-5">
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course6.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>12,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course5.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>12,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course4.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>2,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course3.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>4,510 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course2.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>280 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$80.00<del>$105.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course1.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>5,280 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course2.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">Comprehensive Introduction to Programming</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>3,280 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course6.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Mark Joe</a></span>
                <span>12,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course5.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>5,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course4.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>12,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
        <div className="swiper-slide">
          <div className="course-entry-3 card rounded-2 bg-white border">
            <div className="card-media position-relative">
              <a href="single-course.html"><img className="card-img-top" src="assets/images/course3.jpg" alt="Course" /></a>
            </div>
            <div className="card-body">
              <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <img src="assets/images/icons/star.png" alt />
                  <strong>4.7</strong>
                  <span className="rating-count">(2k reviews)</span>
                </div>
                <span><i className="feather-icon icon-video me-2" />25 hours 22m</span>
                <span className="lead"><a href="#" className="text-reset"><i className="feather-icon icon-bookmark" /></a></span>
              </div>
              <h3 className="sub-title mb-0">
                <a href="single-course.html">React JS Zero to Mastery Front End Essentails.</a>
              </h3>
              <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                <span>By: <a href="profile.html" className="text-reset">Brad Traversy</a></span>
                <span>22,580 Students</span>
              </div>
              <p>Learn JavaScript fundamentals then build a React website from scratch.</p>
              <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                <div className="price">$20.00<del>$35.00</del></div>
                <a href="#">Enroll Now <i className="feather-icon icon-arrow-right" /></a>
              </div>
            </div>
          </div>
          {/* Course Entry End */}
        </div>
        {/* Slide Item End */}
      </div>
      {/* wrapper end */}
    </div>
  </div>
  {/* Course Section End */}
  {/* Review Section Start */}
  <section className="review-sec">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-xl-6 order-2 order-md-1 col-md-7">
          <div className="swiper review-slider">
            <div className="quote-icon icon-lg bg-secondary rounded-circle mb-md-4 mb-3"><img src="assets/images/icons/left-quote.png" alt="Quote" /></div>
            {/* Additional required wrapper */}
            <div className="swiper-wrapper">
              {/* Slides */}
              <div className="swiper-slide">
                <div className="review-entry">
                  <p>
                    Education is the most powerful tool to change the world One thing that can’t be taken from you. A mind is a terrible thing to waste. Education is a key to success and freedom
                    from all the forces to learn
                  </p>
                  <div className="d-sm-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img className="rounded-circle" width={56} src="assets/images/avatar.png" alt="Avater" />
                      <div className="avatar-txt ms-3">
                        <h5 className="display-5 m-0">Luisa Mary</h5>
                        <small className="text-mute">Technology Facilitator</small>
                      </div>
                    </div>
                    <div className="ratings">
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star-half.png" alt />
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="review-entry">
                  <p>
                    We love to purse a best education platform for all. Ipsam quos omnis nisi repudiandae, deleniti eum cupiditate qui tempore animi quaerat modi in possimus consequatur, commodi
                    Lorem ipsum dolor sit amet.
                  </p>
                  <div className="d-sm-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img className="rounded-circle" width={56} src="assets/images/avatar2.png" alt="Avater" />
                      <div className="avatar-txt ms-3">
                        <h5 className="display-5 m-0">Robert Mugabe</h5>
                        <small className="text-mute">Technology Facilitator</small>
                      </div>
                    </div>
                    <div className="ratings">
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star-half.png" alt />
                    </div>
                  </div>
                </div>
              </div>
              <div className="swiper-slide">
                <div className="review-entry">
                  <p>
                    Education is the most powerful tool to change the world One thing that can’t be taken from you. A mind is a terrible thing to waste. Education is a key to success and freedom
                    from all the forces to learn
                  </p>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img className="rounded-circle" width={56} src="assets/images/avatar3.png" alt="Avater" />
                      <div className="avatar-txt ms-3">
                        <h5 className="display-5 m-0">Tariqul Islam</h5>
                        <small className="text-mute">Technology Facilitator</small>
                      </div>
                    </div>
                    <div className="ratings">
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star.png" alt />
                      <img src="assets/images/icons/star-half.png" alt />
                    </div>
                  </div>
                </div>
              </div>
              {/* Slide End */}
            </div>
          </div>
        </div>
        <div className="col-xl-6 order-l order-md-2 col-md-5">
          <figure className="review-img">
            <img className="img-fluid" src="assets/images/review-bg.jpg" alt="Review Banner" />
          </figure>
        </div>
      </div>
    </div>
  </section>
  {/* Review Section End */}
  {/* Meet our Instructors */}
  <section className="team-sec bg-shade sec-padding position-relative">
      <span className="anim-img anim-right">
        <img src="assets/images/icons/instructor-shape.png" alt="Instructor" />
      </span>
      <div className="container">
        <div className="text-center sec-intro">
          <h2 className="sec-title">
            Meet Our <span className="color">Instructors</span>
          </h2>
        </div>
        <div className="row justify-content-center g-3 g-lg-4">
          {instructorsMeet.map((instructor, index) => (
            <div className="col-lg-4 col-md-6" key={instructor._id || index}>
              <div
                className="teacher-entry position-relative"
                style={{ backgroundImage: `url("images/teacher${(index % 3) + 1}.jpg")` }} // Rotate 3 sample images
              >
                <div className="teacher-info position-absolute p-3">
                  <ul className="teacher-socials position-absolute list-unstyled">
                    <li><a href="#"><img src="assets/images/icons/fb.png" alt="" /></a></li>
                    <li><a href="#"><img src="assets/images/icons/linkedin.png" alt="" /></a></li>
                    <li><a href="#"><img src="assets/images/icons/twitter.png" alt="" /></a></li>
                    <li><a href="#"><img src="assets/images/icons/pinterest.png" alt="" /></a></li>
                  </ul>
                  <div className="teacher-intro p-4 text-center">
                    <div className="social-action position-absolute icon icon-sm bg-secondary rounded-circle text-white">
                      <i className="feather-icon icon-share-2" />
                    </div>
                    <h3 className="display-4 mb-1">
                      <a className="text-reset" href="single-instructor.html">
                        {instructor.firstName} {instructor.lastName}
                      </a>
                    </h3>
                    <span className="designation">{instructor.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {instructorsMeet.length === 0 && (
            <p className="text-center">No instructors found.</p>
          )}
        </div>
      </div>
    </section>

  {/* Team Section End */}
  {/* Choose Section Start */}
  <section className="choose-sec sec-padding overflow-hidden">
    <div className="container">
      <div className="text-center sec-intro">
        <h2 className="sec-title">Why Choose <span className="color">Trelix</span></h2>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <ul className="nav nav-tabs ct-tab" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="instructor-tab" data-bs-toggle="tab" data-bs-target="#instructor" type="button" role="tab" aria-controls="instructor" aria-selected="true">
                <img src="assets/images/icons/instructor.png" alt />Expert Instructor
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="cost-tab" data-bs-toggle="tab" data-bs-target="#cost" type="button" role="tab" aria-controls="cost" aria-selected="false">
                <img src="assets/images/icons/wallet.png" alt />Cost Effectiveness
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="learning-tab" data-bs-toggle="tab" data-bs-target="#learning" type="button" role="tab" aria-controls="learning" aria-selected="false">
                <img src="assets/images/icons/book.png" alt />Flexible Learning
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="support-tab" data-bs-toggle="tab" data-bs-target="#support" type="button" role="tab" aria-controls="support" aria-selected="false">
                <img src="assets/images/icons/headphone.png" alt />24/7 Strong Support
              </button>
            </li>
          </ul>
          <div className="tab-content mt-5" id="myTabContent">
            <div className="tab-pane fade" id="instructor" role="tabpanel" aria-labelledby="instructor-tab">
              <div className="row">
                <div className="col-lg-7">
                  <div className="choose-media position-relative">
                    <img src="assets/images/blog2.jpg" alt="About" className="img-fluid" />
                    <img className="choose-abs img-fluid" src="assets/images/about-xs.png" alt="About" />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="choose-txt">
                    <h3 className="display-3">We provide education through our Instructor</h3>
                    <blockquote className="bg-shade text-dark display-6 my-4">
                      Education turns the filthy mind into open minds. The roots of education are bitter, but the fruit is sweet shapes people’s life
                    </blockquote>
                    <ul>
                      <li>Educated citizens bring development in the country</li>
                      <li>Education is a power and makes a person powerful</li>
                      <li>Education is a key to success and freedom from all the forces</li>
                      <li>Education changes your bad today into good tomorrow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="tab-pane fade show active" id="cost" role="tabpanel" aria-labelledby="cost-tab">
              <div className="row">
                <div className="col-lg-7">
                  <div className="choose-media position-relative">
                    <img src="assets/images/about-md.png" alt="About" className="img-fluid" />
                    <img className="choose-abs img-fluid" src="assets/images/about-xs.png" alt="About" />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="choose-txt">
                    <h3 className="display-3">Brings Opportunity of Unlimited Learning</h3>
                    <blockquote className="bg-shade text-dark display-6 my-4">
                      Education turns the filthy mind into open minds. The roots of education are bitter, but the fruit is sweet shapes people’s life
                    </blockquote>
                    <ul>
                      <li>Educated citizens bring development in the country</li>
                      <li>Education is a power and makes a person powerful</li>
                      <li>Education is a key to success and freedom from all the forces</li>
                      <li>Education changes your bad today into good tomorrow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Tab Pane End */}
            <div className="tab-pane fade" id="learning" role="tabpanel" aria-labelledby="learning-tab">
              <div className="row">
                <div className="col-lg-7">
                  <div className="choose-media position-relative">
                    <img src="assets/images/blog1.png" alt="About" className="img-fluid" />
                    <img className="choose-abs img-fluid" src="assets/images/about-xs.png" alt="About" />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="choose-txt">
                    <h3 className="display-3">Learning always should be flexible and effective.</h3>
                    <blockquote className="bg-shade text-dark display-6 my-4">
                      Education turns the filthy mind into open minds. The roots of education are bitter, but the fruit is sweet shapes people’s life
                    </blockquote>
                    <ul>
                      <li>Educated citizens bring development in the country</li>
                      <li>Education is a power and makes a person powerful</li>
                      <li>Education is a key to success and freedom from all the forces</li>
                      <li>Education changes your bad today into good tomorrow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Tab Pane End */}
            <div className="tab-pane fade" id="support" role="tabpanel" aria-labelledby="support-tab">
              <div className="row">
                <div className="col-lg-7">
                  <div className="choose-media position-relative">
                    <img src="assets/images/blog1.png" alt="About" className="img-fluid" />
                    <img className="choose-abs img-fluid" src="assets/images/about-xs.png" alt="About" />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="choose-txt">
                    <h3 className="display-3">We provide an exclusive support 24/7 hours.</h3>
                    <blockquote className="bg-shade text-dark display-6 my-4">
                      Education turns the filthy mind into open minds. The roots of education are bitter, but the fruit is sweet shapes people’s life
                    </blockquote>
                    <ul>
                      <li>Educated citizens bring development in the country</li>
                      <li>Education is a power and makes a person powerful</li>
                      <li>Education is a key to success and freedom from all the forces</li>
                      <li>Education changes your bad today into good tomorrow</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Tab Pane End */}
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* Choose Section End */}
  {/* Footer  */}
  
<Footer/>

  {/* Back to top */}
  <div className="back-top"><i className="feather-icon icon-chevron-up" /></div>
  {/*Javascript
========================================================*/}
  {/* Mirrored from html.theme-village.com/eduxo/ by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:01 GMT */}
</div>
                      );
}
export default Index;