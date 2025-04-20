
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  Plus,
  Download,
  BarChart2,
  Users,
  ArrowLeft,
  ArrowRight,
  EyeOff,
} from "lucide-react"
import { useNavigate,useOutletContext } from "react-router-dom"

const AllExamsInstructor = () => {
  const [activeTab, setActiveTab] = useState("list")
  const [exams, setExams] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const itemsPerPage = 40
  const { user } = useOutletContext()

  // New state for assign tab
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedExams, setSelectedExams] = useState([])

  useEffect(() => {
    fetchExams()
    if (activeTab === "assign") {
      fetchCourses()
    }
  }, [currentPage, sortBy, sortOrder, activeTab])

  const fetchExams = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:5000/Exam/get", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder,
        },
      })
      setExams(response.data.exams)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching exams:", error)
      setError("Failed to fetch exams. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
        const response = await axios.get("http://localhost:5000/course/courses")
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setError("Failed to fetch courses. Please try again.")
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(criteria)
      setSortOrder("asc")
    }
    setCurrentPage(1)
  }
  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
        try {
            if (!examId) {
                console.error("Exam ID is undefined");
                return;
            }
            await axios.delete(`http://localhost:5000/Exam/delete/${examId}`)

            fetchExams()
        } catch (error) {
            console.error("Error deleting exam:", error)
            alert("Failed to delete exam. Please try again.")
        }
    }
}

const handlePublish = async (examId, isPublished) => {
    try {
        await axios.post(`http://localhost:5000/Exam/publish/${examId}`);
        fetchExams();
    } catch (error) {
        console.error("Error updating exam status:", error);
        alert("Failed to update exam status. Please try again.");
    }
};

const handleDuplicate = async (examId) => {
    try {
        await axios.post(`http://localhost:5000/Exam/duplicate/${examId}`);
        fetchExams(); // Refresh exam list after duplication
    } catch (error) {
        console.error("Error duplicating exam:", error);
        alert("Failed to duplicate exam. Please try again.");
    }
};


const   handleExportResults = async (examId) => {
    try {
        const response = await axios.get(`http://localhost:5000/Exam/results/${examId}`, {
            responseType: "blob",
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `exam_${examId}_results.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error("Error exporting results:", error)
        alert("Failed to export results. Please try again.")
    }
}
const handleExportAllResults = async () => {
    try {
        const response = await axios.get("http://localhost:5000/Exam/results/export-all", {
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "all_exams_results.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting all exam results:", error);
        alert("Failed to export all exam results. Please try again.");
    }
};

  const handleAssignExams = async () => {
    if (!selectedCourse || selectedExams.length === 0) {
      alert("Please select a course and at least one exam.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/Exam/assign-exams", {
        courseId: selectedCourse,
        examIds: selectedExams,
      });
  
      console.log("Response:", response.data); // Debugging
      alert("Exams assigned successfully!");
      
      setSelectedCourse("");
      setSelectedExams([]);
    } catch (error) {
      console.error("Error assigning exams:", error);
      alert("Failed to assign exams. Please try again.");
    }
  };

  const filteredExams = exams.filter((exam) => exam.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Exams</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "list" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Exam List
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "assign" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("assign")}
        >
          Assign to Course
        </button>
      </div>

      {activeTab === "list" ? (
        <>
          {/* Existing exam list content */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => {
                navigate("/profile/addExam")
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Exam
            </button>
          </div>

          {/* Exam list table */}
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort("title")} className="text-blue-600 hover:underline text-sm px-2 py-1 min-w-[48px] rounded">
                        Exam Title
                        {sortBy === "title" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort("date")} className="text-blue-600 hover:underline text-sm px-2 py-1 min-w-[48px] rounded">
                        Created Date
                        {sortBy === "date" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExams.filter((exam) => exam.user === user._id).map((exam) => (
                    <tr key={exam._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                            <div className="text-sm text-gray-500">{exam.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(exam.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            exam.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{exam.participantCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        
                        
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="text-red-600 hover:text-red-900 mr-2"
                          title="Delete Exam"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        {exam.status !== "published" && (
                            <button
                            onClick={() => handlePublish(exam._id, exam.isPublished)}
                            className={exam.isPublished ? "text-green-600 hover:text-green-900 mr-2" : "text-red-600 hover:text-red-900 mr-2"}
                            title={exam.isPublished ? "Publish Exam" : "Hide Exam"}
                        >
                            {exam.isPublished ? <CheckCircle className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(exam._id)}
                          className="text-purple-600 hover:text-purple-900 mr-2"
                          title="Duplicate Exam"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={ handleExportAllResults}
                          className="text-orange-600 hover:text-orange-900 mr-2"
                          title="Export Results"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, exams.length)}</span> of{" "}
              <span className="font-medium">{exams.length}</span> results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        // Assign to Course tab content
        <div className="space-y-6">
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">
              Select Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ display: "block" }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a course</option>
              {courses.filter((course) => course.user === user._id).map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Exams</label>
            <div className="mt-2 space-y-2">
              {exams.filter((exam) => exam.user === user._id).map((exam) => (
                <div key={exam._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={exam._id}
                    value={exam._id}
                    checked={selectedExams.includes(exam._id)}
                    
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExams([...selectedExams, exam._id])
                      } else {
                        setSelectedExams(selectedExams.filter((id) => id !== exam._id))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={exam._id} className="ml-2 block text-sm text-gray-900">
                    {exam.title}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAssignExams}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Assign Exams to Course
          </button>
        </div>
      )}
    </div>
  )
}

export default AllExamsInstructor

