import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext, useParams } from "react-router-dom";
function CourseChapter() {
    const [chapters, setChapters] = useState([]);
    const { user, profile, setProfile, completion } = useOutletContext();
    const [expandedRows, setExpandedRows] = useState({});
    const maxLength = 50;
    const { courseId } = useParams(); // Get courseId from URL
   

    useEffect(() => {
        const fetchChapters = async () => {
            console.log('Course ID:', courseId); // Add this line to check the courseId
            if (!courseId) {
                console.error("Course ID is not defined");
                return;
            }
    
            try {
                const response = await axios.get(`http://localhost:5000/chapter/course/${courseId}`);
                setChapters(response.data.chapters);
            } catch (error) {
                console.error("Error fetching chapters:", error);
            }
        };
    
        fetchChapters();
    }, [courseId]);
    const toggleExpand = (chapterId) => {
        setExpandedRows((prevState) => ({
            ...prevState,
            [chapterId]: !prevState[chapterId],
        }));
    };
 


    const handleDelete = async (id) => {
        try {
            // Send DELETE request to the backend
            const response = await axios.delete(`http://localhost:5000/chapter/delete/${id}`);

            // If deletion was successful, update the state to remove the deleted chapter
            if (response.status === 200) {
                setChapters((prevChapters) => prevChapters.filter((chapter) => chapter._id !== id));
                alert('Chapter deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('Error deleting chapter');
        }
    };

    return (




        <section className="dashboard-sec">
            <h2 className="display-5 border-bottom pb-3 mb-4">Chapters</h2>
            <div className="course-tab">
                <ul className="nav" id="myTab" role="tablist">
                    <ul className="nav" id="myTab" role="tablist">

                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#afficter">chapter assign to this course </button>
                        </li>


                    </ul>
                </ul>
                <div className="tab-content" id="myTabContent">

                    <div className="tab-pane fade" id="afficter" role="tabpanel">


                        <table className="table table-responsive">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th style={{ width: "30%" }}>Description</th>
                                    <th>Video</th>
                                    <th>Mini PDF</th>
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
    {chapters
        .filter(chapter => chapter.userid === user._id) // Keep filtering by user
        .map(chapter => (
            <tr key={chapter._id}>
                <td>
                    <p>{chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <a href="single-course.html" className="text-reset display-6">{chapter.title}</a>
                </td>
                <td style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                    {chapter.description.length > maxLength && !expandedRows[chapter._id] ? (
                        <>
                            {chapter.description.substring(0, maxLength)}...
                            <button
                                onClick={() => toggleExpand(chapter._id)}
                                style={{ border: "none", background: "none", color: "blue", cursor: "pointer", paddingLeft: "5px" }}
                            >
                                View More
                            </button>
                        </>
                    ) : (
                        <>
                            {chapter.description}
                            {chapter.description.length > maxLength && (
                                <button
                                    onClick={() => toggleExpand(chapter._id)}
                                    style={{ border: "none", background: "none", color: "red", cursor: "pointer", paddingLeft: "5px" }}
                                >
                                    Show Less
                                </button>
                            )}
                        </>
                    )}
                </td>
                <td>
                    {chapter.video ? (
                        <a href={`http://localhost:5000${chapter.video}`} target="_blank" rel="noopener noreferrer">View Video</a>
                    ) : (
                        'No Video'
                    )}
                </td>
                <td>
                    {chapter.pdf ? (
                        <a href={`http://localhost:5000${chapter.pdf}`} target="_blank" rel="noopener noreferrer">Download PDF</a>
                    ) : (
                        'No PDF'
                    )}
                </td>
                <td>
                    <div className="badge bg-success">Pass</div>
                </td>
                <td>
                    <div className="d-flex justify-content-between">
                        <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                        <a href="#" title="Delete" onClick={() => handleDelete(chapter._id)}>
                            <i className="feather-icon icon-trash-2" />
                        </a>
                    </div>
                </td>
            </tr>
        ))}
</tbody>


                        </table>


                    </div>
                </div>
            </div>
        </section>



    );
}

export default CourseChapter;
