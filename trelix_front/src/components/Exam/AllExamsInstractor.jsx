"use client"

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
import { useNavigate } from "react-router-dom"

const AllExamsInstructor = () => {
    const [exams, setExams] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("date")
    const [sortOrder, setSortOrder] = useState("desc")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const itemsPerPage = 3
    

    useEffect(() => {
        fetchExams()
    }, [currentPage, sortBy, sortOrder])

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
    

    const handleExportResults = async (examId) => {
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
    

    const filteredExams = exams.filter((exam) => exam.title.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Exams</h1>

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
                navigate('/profile/addExam'); // Navigate to the specified path
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
            <Plus className="h-5 w-5 mr-2" />
            Create New Exam
        </button>
            </div>

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
                                    <button onClick={() => handleSort("title")} className="flex items-center focus:outline-none">
                                        Exam Title
                                        {sortBy === "title" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => handleSort("date")} className="flex items-center focus:outline-none">
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
                            {filteredExams.map((exam) => (
                                <tr key={exam.id}>
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
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exam.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
                                            onClick={() => {
                                                /* Navigate to view exam page */
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                            title="View Exam"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                /* Navigate to edit exam page */
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-2"
                                            title="Edit Exam"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
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
    onClick={handleExportAllResults}
    className="text-blue-600 hover:text-blue-900 mr-2"
    title="Export All Results"
>
    <Download className="h-5 w-5" />
</button>

                                        <button
                                            onClick={() => {
                                                /* Navigate to exam statistics page */
                                            }}
                                            className="text-teal-600 hover:text-teal-900"
                                            title="View Statistics"
                                        >
                                            <BarChart2 className="h-5 w-5" />
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
                        className={`px-3 py-1 rounded-md ${currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AllExamsInstructor

