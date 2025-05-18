"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { useNavigate } from "react-router-dom"

ChartJS.register(ArcElement, Tooltip, Legend)

const CourseChart = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/course/courses`)
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
      const cat = course.categorie || "Other"
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
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#9C27B0", "#00BCD4", "#FFC107"],
          borderWidth: 1,
        },
      ],
    }
  }

  const handleBackToList = () => {
    navigate("/profile/list")
  }

  if (loading) return <p className="text-center mt-5">Loading...</p>

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className="bg-light p-3" style={{ width: "300px", borderRight: "1px solid #ddd" }}>
        <h4 className="mb-3">Added Courses</h4>
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
        <div className="mb-4">
          <button
            onClick={handleBackToList}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              backgroundColor: "white",
              color: "#4169E1", // Couleur bleue comme dans l'image
              border: "1px solid #4169E1", // Bordure bleue
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              width: "fit-content",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white"
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: "8px" }}
            >
              <path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="#4169E1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back To List
          </button>
        </div>

        <h2 className="mb-4 text-center">Course Dashboard</h2>

        {/* Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-body">
                <h5 className="card-title">Total Courses</h5>
                <p className="card-text fs-4">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-body">
                <h5 className="card-title">Categories</h5>
                <p className="card-text fs-4">{[...new Set(courses.map((c) => c.categorie))].length}</p>
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
