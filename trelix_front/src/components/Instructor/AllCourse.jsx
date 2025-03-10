"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Footer from "../Footer";

function Allcourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/course/courses");
        console.log("Courses fetched:", response.data);
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <link rel="stylesheet" href="assets/css/style.css"/>
      <section
        className="promo-sec"
        style={{ background: 'url("images/promo-bg.jpg")no-repeat center center / cover' }}
      >
        <img src="assets/images/promo-left.png" alt className="anim-img" />
        <img src="assets/images/promo-right.png" alt className="anim-img anim-right" />
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <h1 className="display-2 text-white">Courses</h1>
              <nav aria-label="breadcrumb mt-0">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item active" aria-current="page">
                    Courses
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </section>
      {/* Promo Section End */}
      {/* Courses Section Start */}
      <section className="courses-sec sec-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 order-2 order-lg-1">
              <aside className="sidebar sidebar-spacing">
                <div className="widget">
                  <h3 className="widget-title">Categories</h3>
                  <div className="widget-inner">
                    <ul>
                      <li>
                        <input id="art" className="checkbox-custom" name="checkbox-3" type="checkbox" />
                        <label htmlFor="art" className="checkbox-custom-label">
                          Art &amp; Design
                        </label>
                        <span className="count">(12)</span>
                      </li>
                      <li>
                        <input id="dev" className="checkbox-custom" name="checkbox-3" type="checkbox" />
                        <label htmlFor="dev" className="checkbox-custom-label">
                          Technology
                        </label>
                        <span className="count">(10)</span>
                      </li>
                      <li>
                        <input id="info" className="checkbox-custom" name="checkbox-3" type="checkbox" />
                        <label htmlFor="info" className="checkbox-custom-label">
                          Development
                        </label>
                        <span className="count">(09)</span>
                      </li>
                      <li>
                        <input id="checkbox-3" className="checkbox-custom" name="checkbox-3" type="checkbox" />
                        <label htmlFor="checkbox-3" className="checkbox-custom-label">
                          Development
                        </label>
                        <span className="count">(12)</span>
                      </li>
                    </ul>
                  </div>
                </div>{" "}
                {/* Widget End */}
                <div className="widget">
                  <h3 className="widget-title">Instructor</h3>
                  <div className="widget-inner">
                    <ul>
                      <li>
                        <input id="michle" className="checkbox-custom" name="michle" type="checkbox" />
                        <label htmlFor="michle" className="checkbox-custom-label">
                          Michle John
                        </label>
                        <span className="count">(11)</span>
                      </li>
                      <li>
                        <input id="harnold" className="checkbox-custom" name="harnold" type="checkbox" />
                        <label htmlFor="harnold" className="checkbox-custom-label">
                          Harnnold
                        </label>
                        <span className="count">(07)</span>
                      </li>
                      <li>
                        <input id="arnold" className="checkbox-custom" name="arnold" type="checkbox" />
                        <label htmlFor="arnold" className="checkbox-custom-label">
                          Mc. Arnold
                        </label>
                        <span className="count">(19)</span>
                      </li>
                    </ul>
                  </div>
                </div>{" "}
                {/* Widget End */}
                <div className="widget">
                  <h3 className="widget-title">Price</h3>
                  <div className="widget-inner">
                    <ul>
                      <li>
                        <input id="all" className="checkbox-custom" name="all" type="checkbox" />
                        <label htmlFor="all" className="checkbox-custom-label">
                          All
                        </label>
                        <span className="count">(15)</span>
                      </li>
                      <li>
                        <input id="free" className="checkbox-custom" name="free" type="checkbox" />
                        <label htmlFor="free" className="checkbox-custom-label">
                          Free
                        </label>
                        <span className="count">(02)</span>
                      </li>
                      <li>
                        <input id="paid" className="checkbox-custom" name="paid" type="checkbox" />
                        <label htmlFor="paid" className="checkbox-custom-label">
                          Paid
                        </label>
                        <span className="count">(13)</span>
                      </li>
                    </ul>
                  </div>
                </div>{" "}
                {/* Widget End */}
                <div className="widget">
                  <h3 className="widget-title">Level</h3>
                  <div className="widget-inner">
                    <ul>
                      <li>
                        <input id="all-1" className="checkbox-custom" name="all-1" type="checkbox" />
                        <label htmlFor="all-1" className="checkbox-custom-label">
                          All Level
                        </label>
                        <span className="count">(15)</span>
                      </li>
                      <li>
                        <input id="begin" className="checkbox-custom" name="begin" type="checkbox" />
                        <label htmlFor="begin" className="checkbox-custom-label">
                          Beginner
                        </label>
                        <span className="count">(02)</span>
                      </li>
                      <li>
                        <input id="inter" className="checkbox-custom" name="inter" type="checkbox" />
                        <label htmlFor="inter" className="checkbox-custom-label">
                          Intermediate
                        </label>
                        <span className="count">(10)</span>
                      </li>
                      <li>
                        <input id="expert" className="checkbox-custom" name="expert" type="checkbox" />
                        <label htmlFor="expert" className="checkbox-custom-label">
                          Expert
                        </label>
                        <span className="count">(08)</span>
                      </li>
                    </ul>
                  </div>
                </div>{" "}
                {/* Widget End */}
                <div className="widget">
                  <h3 className="widget-title">Video Duration</h3>
                  <div className="widget-inner">
                    <ul>
                      <li>
                        <input id="hour-1" className="checkbox-custom" name="hour-1" type="checkbox" />
                        <label htmlFor="hour-1" className="checkbox-custom-label">
                          0-1 Hour
                        </label>
                        <span className="count">(02)</span>
                      </li>
                      <li>
                        <input id="hour-5" className="checkbox-custom" name="hour-5" type="checkbox" />
                        <label htmlFor="hour-5" className="checkbox-custom-label">
                          1-5 Hours
                        </label>
                        <span className="count">(02)</span>
                      </li>
                      <li>
                        <input id="hour-10" className="checkbox-custom" name="hour-10" type="checkbox" />
                        <label htmlFor="hour-10" className="checkbox-custom-label">
                          5-10 Hours
                        </label>
                        <span className="count">(9)</span>
                      </li>
                      <li>
                        <input id="hour-15" className="checkbox-custom" name="hour-15" type="checkbox" />
                        <label htmlFor="hour-15" className="checkbox-custom-label">
                          15+ Hours
                        </label>
                        <span className="count">(12)</span>
                      </li>
                    </ul>
                  </div>
                </div>{" "}
                {/* Widget End */}
              </aside>
            </div>
            <div className="col-lg-8 order-1 order-lg-2">
              <div className="course-filters d-flex justify-content-between align-items-center">
                <div className="result d-sm-flex align-items-center">
                  <p className="m-0">
                  </p>
                </div>
            
              </div>{" "}
              {/* Course Filter End */}
              <div className="course-lists row gy-4 mt-3">
                {/* Dynamic course listing */}
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div className="col-xl-6 col-md-6" key={course._id}>
                      <div className="course-entry-3 card rounded-2 bg-white border">
                        <div className="card-media position-relative">
                          <a href={`/chapters/${course._id}`}>
                            <img className="card-img-top" src="assets/images/course6.jpg" alt={course.title} />
                          </a>
                          <a href="#" className="action-wishlist position-absolute text-white icon-xs rounded-circle">
                            <img src="assets/images/icons/heart-fill.svg" alt="Wishlist" />
                          </a>
                        </div>
                        <div className="card-body">
                          <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <img src="assets/images/icons/star.png" alt="Rating" />
                              <strong>4.5</strong>
                              <span className="rating-count d-none d-xl-block">(1k reviews)</span>
                            </div>
                            <span>
                              <i className="feather-icon icon-layers me-2" />
                              {course.level}
                            </span>
                            <span className="lead">
                              <a href="#" className="text-reset">
                                <i className="feather-icon icon-bookmark" />
                              </a>
                            </span>
                          </div>
                          <h3 className="sub-title mb-0">
                            <a href={`/single-course/${course._id}`}>{course.title}</a>
                          </h3>
                          <div className="author-meta small d-flex pt-2 justify-content-between align-items-center mb-3">
                            <span>
                              By:{" "}
                              <a href="#" className="text-reset">
                                Instructor
                              </a>
                            </span>
                            <span>Students</span>
                          </div>
                          <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                            <div className="price">{course.price}<del>$35.00</del></div>
                            <a href={`/enroll/${course._id}`}>
                              Enroll Now <i className="feather-icon icon-arrow-right" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>No courses available.</p>
                  </div>
                )}
                
                {/* Pager Start - Only show if courses exist */}
                {courses.length > 0 && (
                  <div className="col-lg-12">
                    <div className="pager text-center mt-5">
                      <a href="#" className="next-btn"> <i className="feather-icon icon-arrow-left" />
                      </a>
                      <span className="current">1</span>
                      <a href="#">2</a>
                      <a href="#">3</a>
                      <a href="#">4</a>
                      <a href="#" className="prev-btn"> <i className="feather-icon icon-arrow-right" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
     

  
    </div>
   
  )
}

export default Allcourse
