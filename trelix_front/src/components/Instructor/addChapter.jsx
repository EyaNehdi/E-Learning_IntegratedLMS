import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
function AddChapter() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [pdf, setPdf] = useState(null);
    const [video, setVideo] = useState(null);
    const [chapters, setChapters] = useState([]);
    const { user, profile, setProfile, completion } = useOutletContext();
    const [expandedRows, setExpandedRows] = useState({});
    const maxLength = 50;
    const toggleExpand = (chapterId) => {
        setExpandedRows((prevState) => ({
            ...prevState,
            [chapterId]: !prevState[chapterId],
        }));
    };

    useEffect(() => {
        // Simulating an API call to fetch chapters using Axios
        axios.get('http://localhost:5000/chapter/get')
            .then(response => {
                // Assuming the data is in response.data
                setChapters(response.data);
            })
            .catch(error => {
                console.error('Error fetching chapters:', error);
            });
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (e.target.name === "pdf") setPdf(file);
            if (e.target.name === "video") setVideo(file);
        }
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            alert("Title and description are required.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("userid", user._id);

        if (pdf) formData.append("pdf", pdf);
        if (video) formData.append("video", video);

        try {
            const response = await axios.post("http://localhost:5000/chapter/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                alert("Chapter added successfully!");
                setTitle("");
                setDescription("");
                setPdf(null);
                setVideo(null);
            } else {
                alert("Failed to add chapter.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.message || "Failed to add chapter.");
        }
    };

    return (




        <section className="dashboard-sec">
            <h2 className="display-5 border-bottom pb-3 mb-4">Chapters</h2>
            <div className="course-tab">
                <ul className="nav" id="myTab" role="tablist">
                    <ul className="nav" id="myTab" role="tablist">
                        <li className="nav-item">
                            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile">Add chapter</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#list">All chapters</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#withdrawal">Edit chapter</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#social">Delete chapter</button>
                        </li>


                    </ul>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade" id="profile" role="tabpanel">
                        <div className="tab-pane fade show active" id="addChapter">
                            <form onSubmit={handleSubmit} className="profile-form mt-5">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="title">Title</label>
                                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="pdfInput">PDF Chapter</label>
                                            <input id="pdfInput" type="file" name="pdf" accept="application/pdf" onChange={handleFileChange} />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="videoInput">Video</label>
                                            <input id="videoInput" type="file" name="video" accept="video/*" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-sm btn-primary mt-3">Add Info</button>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="list" role="tabpanel">


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
                                    .filter((chapter) => chapter.userid === user._id)
                                    .map((chapter) => (
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
                                                            style={{
                                                                border: "none",
                                                                background: "none",
                                                                color: "blue",
                                                                cursor: "pointer",
                                                                paddingLeft: "5px"
                                                            }}
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
                                                                style={{
                                                                    border: "none",
                                                                    background: "none",
                                                                    color: "red",
                                                                    cursor: "pointer",
                                                                    paddingLeft: "5px"
                                                                }}
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

export default AddChapter;
