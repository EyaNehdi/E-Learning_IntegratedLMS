"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const CourseChart = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/course/courses")
        setCourses(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const getCategoryChartData = () => {
    const categoryCounts = {}

    courses.forEach((course) => {
      const cat = course.categorie || "Autres"
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    })

    const labels = Object.keys(categoryCounts)
    const data = Object.values(categoryCounts)

    return {
      labels,
      datasets: [
        {
          label: "Distribution of courses by category",
          data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8BC34A",
            "#9C27B0",
            "#00BCD4",
            "#FFC107",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  if (loading) return <p className="text-center mt-5">Chargement...</p>

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-light p-3" style={{ width: "300px", borderRight: "1px solid #ddd" }}>
        <h4 className="mb-3">Added Courses
        </h4>
        <ul className="list-group">
          {courses.map((course) => (
            <li key={course._id} className="list-group-item">
              {course.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <h2 className="mb-4 text-center">Course Dashboard </h2>

        {/* Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Course</h5>
                <p className="card-text fs-4">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Catégories</h5>
                <p className="card-text fs-4">
                  {[...new Set(courses.map((c) => c.categorie))].length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Pie data={getCategoryChartData()} />
        </div>
      </div>
    </div>
  )
}

export default CourseChart
