"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const MAX = 50; // Updated max value to 50
const MIN = 0; // Keep min value at 0
const marks = [
  {
    value: MIN,
    label: `${MIN} min`,
  },
  {
    value: MAX,
    label: `${MAX} max`,
  },
];
function Allcourse() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [val, setVal] = React.useState([MIN, MAX]); // Default to [0, 50]
  const [minPrice, setMinPrice] = useState(MIN);
  const [maxPrice, setMaxPrice] = useState(MAX);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [filters, setFilters] = useState({
    frontendDev: false,
    backendDev: false,
  })


  const handleChange = (_, newValue) => {
    setVal(newValue);
    setMinPrice(newValue[0]); // Set min price in parent component
    setMaxPrice(newValue[1]); // Set max price in parent component
  };
  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {

        setLoading(true);
        const response = await axios.get("http://localhost:5000/course/courses");
        console.log("Fetched courses:", response.data); 
        setCourses(response.data);
        setFilteredCourses(response.data); // Initialize with all courses
        setLoading(false);

      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters()
  }, [filters, courses])

  // Handle checkbox changes
  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }))
  }

  // Apply all active filters to courses
  const applyFilters = () => {
    let result = [...courses]

    // If no filters are active, show all courses
    if (!filters.frontendDev && !filters.backendDev) {
      setFilteredCourses(result)
      return
    }

    // Apply module filters
    if (filters.frontendDev || filters.backendDev) {
      result = result.filter((course) => {
        // Check if course has a module
        if (!course.module) return false

        const moduleName = course.module.name ? course.module.name.toLowerCase() : ""

        if (filters.frontendDev && moduleName.includes("developpement front-end")) {
          return true
        }

        if (filters.backendDev && moduleName.includes("developpement back-end")) {
          return true
        }

        return false
      })
    }

    setFilteredCourses(result)
  }

  // Extract unique categories from courses
  const categories = Array.from(new Set(courses.map(course => course.categorie)));

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelectedCategories) => {
      const newSelectedCategories = [...prevSelectedCategories];
      if (newSelectedCategories.includes(category)) {
        // If category is already selected, remove it
        return newSelectedCategories.filter(c => c !== category);
      } else {
        // If category is not selected, add it
        newSelectedCategories.push(category);
        return newSelectedCategories;
      }
    });
  };
   // Handle price slider change
   const handlePriceChange = (_, newValue) => {
    setVal(newValue);
    setMinPrice(newValue[0]);
    setMaxPrice(newValue[1]);
  };
  const levels = Array.from(new Set(courses.map(course => course.level)));
    // Handle level selection
    const handleLevelChange = (level) => {
      setSelectedLevels((prevSelectedLevels) => {
        const newSelectedLevels = [...prevSelectedLevels];
        if (newSelectedLevels.includes(level)) {
          return newSelectedLevels.filter(l => l !== level);
        } else {
          newSelectedLevels.push(level);
          return newSelectedLevels;
        }
      });
    };

  // Filter courses based on selected categories and price range
  useEffect(() => {
    let filtered = courses;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(course =>
        selectedCategories.includes(course.categorie)
      );
    }

    // Filter by levels
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(course =>
        selectedLevels.includes(course.level)
      );
    }

    // Filter by price range
    filtered = filtered.filter(course => {
      return course.price >= minPrice && course.price <= maxPrice;
    });

    setFilteredCourses(filtered);
    console.log('Filtered courses:', filteredCourses);
  }, [selectedCategories, selectedLevels, minPrice, maxPrice, courses]);

  return (
    <div>
      <link rel="stylesheet" href="assets/css/style.css" />
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
          {categories.map((category) => (
            <li key={category}>
              <input
                id={category}
                className="checkbox-custom"
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              <label htmlFor={category} className="checkbox-custom-label">
                {category}
              </label>
              <span className="count">({courses.filter(course => course.categorie === category).length})</span>
            </li>
          ))}
        </ul>
      </div>

                </div>{" "}
                {/* Widget End */}
                {/* Price filter section with slider */}
      <div className="widget">
        <h3 className="widget-title">Price</h3>
        <div className="widget-inner">
        <Box sx={{ width: 250 }}>
      <Slider
        marks={marks}
        step={10} // Step size is 10
        value={val}
        valueLabelDisplay="auto"
        min={MIN}
        max={MAX}
        onChange={handleChange}
        valueLabelFormat={(value) => `$${value}`} // Display price in dollar format
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      </Box>
    </Box>
        </div>
      </div>{" "}
                {/* Widget End */}
                <div className="widget">
        <h3 className="widget-title">Level</h3>
        <div className="widget-inner">
          <ul>
            {levels.map((level) => (
              <li key={level}>
                <input
                  id={level}
                  className="checkbox-custom"
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => handleLevelChange(level)}
                />
                <label htmlFor={level} className="checkbox-custom-label">
                  {level}
                </label>
                <span className="count">({courses.filter(course => course.level === level).length})</span>
              </li>
            ))}
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
                    {filteredCourses.length} cours trouvés
                    {(filters.frontendDev || filters.backendDev) && (
                      <span className="ms-2">
                        {filters.frontendDev
                          ? "(Developpement Front-end)"
                          : filters.backendDev
                            ? "(Developpement Back-end)"
                            : ""}
                      </span>
                    )}
                  </p>
                </div>
              </div>{" "}
              {/* Course Filter End */}
              <div className="course-lists row gy-4 mt-3">
                {/* Dynamic course listing */}

                {loading ? (
          <div className="col-12 text-center">
            <p>Loading...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div className="col-xl-6 col-md-6" key={course._id}>
              <div className="course-entry-3 card rounded-2 bg-white border">
                <div className="card-media position-relative">
                  <a href={`/chapters/${course._id}`}>
                    <img
                      className="card-img-top"
                      src={
                        course.categorie === "OpenClassrooms"
                          ? "assets/images/openclassrooms.jpg"
                          : "assets/images/crs.png"
                      }
                      alt={course.title}
                    />
                  </a>
                  <a
                    href="#"
                    className="action-wishlist position-absolute text-white icon-xs rounded-circle"
                  >
                    <img
                      src="assets/images/icons/heart-fill.svg"
                      alt="Wishlist"
                      style={{ marginTop: "10px", marginLeft: "9px" }}
                    />
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
                        {course.categorie === "OpenClassrooms" ? "OpenClassrooms" : "Instructor"}
                      </a>
                    </span>
                    <span>{course.module ? course.module.name : "No module assigned"}</span>
                  </div>
                  <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                    <div className="price">
                      {course.price === 0 ? "Free" : course.price + "$"} <del>$35.00</del>
                    </div>
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
                {filteredCourses.length > 0 && (
                  <div className="col-lg-12">
                    <div className="pager text-center mt-5">
                      <a href="#" className="next-btn">
                        {" "}
                        <i className="feather-icon icon-arrow-left" />
                      </a>
                      <span className="current">1</span>
                      <a href="#">2</a>
                      <a href="#">3</a>
                      <a href="#">4</a>
                      <a href="#" className="prev-btn">
                        {" "}
                        <i className="feather-icon icon-arrow-right" />
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

