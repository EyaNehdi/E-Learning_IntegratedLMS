import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProfileStore } from "../../store/profileStore";
import { Link, Outlet, useParams } from "react-router-dom";

const ListChapters = () => {
  const { id } = useParams();
  const [chapters, setChapters] = useState([]);
  const [completedChapters, setCompletedChapters] = useState([]);
  const { user, fetchUser, clearUser } = useProfileStore();

  // Fetch the user data on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    console.log("user after fetch", user);
  }, [user]);

  useEffect(() => {
    // Fetch chapters from the backend
    axios
      .get("http://localhost:5000/chapter/get")  // Fetch all chapters
      .then((response) => {
        setChapters(response.data);
      })
      .catch((error) => {
        console.error("Error fetching chapters:", error);
      });

    // Ensure that user is available before making the request
    if (user && user._id) {
      axios
        .get("http://localhost:5000/api/auth/completedchapters", {
          params: {
            userId: user._id, // Pass user ID as query param
            chapterId: id,    // Pass the chapter ID as query param
          },
        })
        .then((response) => {
          setCompletedChapters(response.data.completedChapters); 
          console.log("Completed chapters data: ", response.data);
        })
        .catch((error) => {
          console.error("Error fetching completed chapters:", error);
        });
    }
  }, [user, id]);

  const handleCompleteChapter = (chapterId) => {
    if (!user || !user._id) {
      console.error("User is not logged in");
      return;
    }

    // When a chapter is completed, update the backend
    axios
      .post("http://localhost:5000/user/mark-chapter-completed", {
        userId: user._id, // Get the logged-in user's ID
        chapterId: chapterId,
      })
      .then((response) => {
        // Check if the response contains updated completed chapters
        if (response.data.completedChapters) {
          setCompletedChapters(response.data.completedChapters);
        }
      })
      .catch((error) => {
        console.error("Error marking chapter as completed:", error);
      });
  };

  return (
    <div>
      <link rel="stylesheet" href="assets/css/style.css" />

      {/* Course Section */}
      <section className="course-lesson bg-shade sec-padding overflow-hidden">
        <div className="container-fluid px-0">
          <div className="row d-flex">
            {/* Sidebar on the left */}
            <div className="col-lg-4">
              <aside className="sidebar position-relative lesson-sidebar px-4">
                <h1 className="display-4 mb-4">Course Content</h1>
                <div className="lesson-container">
                  {chapters.map((chapter) => {
                    const isCompleted = completedChapters.includes(chapter._id); // Check if the chapter is completed
                    return (
                      <Link
                        key={chapter._id}
                        className="nav-link btn btn-primary mb-2 w-100 text-start d-flex justify-content-between align-items-center"
                        to={`/chapters/content/${chapter._id}`}
                        style={{
                          backgroundColor: "white",
                          color: "black",
                          borderColor: "blue",
                          position: "relative",
                          paddingRight: "2rem", // Ensure space for the checkmark
                        }}
                      >
                        {chapter.title}

                        {/* Progress Indicator */}
                        {isCompleted ? (
                          <span style={{ color: "green", fontSize: "1.2rem" }}>✔️</span>
                        ) : (
                          <span
                            style={{ color: "gray", fontSize: "1.2rem", cursor: "pointer" }}
                            onClick={() => handleCompleteChapter(chapter._id)} // Mark as complete on click
                          >
                            ⏳
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </aside>
            </div>

            {/* Chapter content on the right */}
           
            <div className="col-lg-8">
              <div className="content-container p-4">
                <Outlet /> {/* This will display the selected chapter content */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListChapters;
