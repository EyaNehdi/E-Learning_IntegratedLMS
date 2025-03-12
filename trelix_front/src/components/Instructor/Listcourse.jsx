import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

function Listcourse() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { user } = useOutletContext();

  // Fonction pour récupérer les cours
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/course/courses");
      console.log("Cours récupérés:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error);
      alert("Erreur lors de la récupération des cours");
    }
  };

  useEffect(() => {
    fetchCourses(); // Charger les cours au montage du composant
  }, []);

  // Fonction pour rediriger vers la page d'édition du cours
  const handleEdit = (courseId) => {
    navigate(`/profile/edit-course/${courseId}`);
  };

  // Fonction pour supprimer un cours
  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce cours ?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/course/delete/${courseId}`);

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== courseId)
      );
      alert("Cours supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du cours :", error);
      alert("Erreur lors de la suppression du cours");
    }
  };

  return (
    <section className="dashboard-sec course-dash">
      <div className="course-tab">
        <ul className="nav" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="home-tab"
              data-bs-toggle="tab"
              data-bs-target="#home"
              type="button"
              role="tab"
              aria-controls="home"
              aria-selected="true"
            >
              Publish
            </button>
          </li>
          <li>
            <a
              href="/profile/course"
              className="btn btn-sm btn-info rounded-5"
              style={{ marginLeft: "205px" }}
            >
              <i className="feather-icon icon-plus me-2"></i>Add New Course
            </a>
          </li>
        </ul>
      </div>

      <div className="tab-content inner-sec" id="myTabContent">
        <div className="tab-pane fade show active" id="home" role="tabpanel">
          <div className="row g-4">
            {courses.length > 0 ? (
              courses
                .filter((course) => course.user === user._id)
                .map((course) => (
                  <div key={course._id} className="col-xl-4 col-sm-6" style={{width: "fit-content"}}>
                    <div className="course-entry-3 card rounded-2 bg-info border shadow-1">
                      <div className="card-media position-relative">
                        <a href={`/profile/course-chapter/${course._id}`}>
                          <img
                            className="card-img-top"
                            src="/assets/images/course.png"
                            alt={course.title}
                          />
                        </a>
                      </div>
                      <div
                        className="card-body p-3"
                        style={{ backgroundColor: "white" }}
                      >
                        <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <img
                              src="/assets/images/icons/star.png"
                              alt="Star"
                            />
                            <strong>4.7</strong>
                            <span className="rating-count">(2k reviews)</span>
                          </div>
                          <span>
                            <i className="feather-icon icon-layers me-2" />
                            {course.level}
                          </span>
                        </div>
                        <h3 className="sub-title my-3">
                          <a href="single-course.html">{course.title}</a>
                        </h3>
                        <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                          <div className="price">
                            {course.price}$<del>$35.00</del>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary"
                              onClick={() => handleEdit(course._id)}
                            >
                              <i className="feather-icon icon-edit me-2" />
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger "
                              onClick={() => handleDelete(course._id)}
                            >
                              <i className="feather-icon icon-edit me-2" />
                              Delete
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>Aucun cours disponible.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Listcourse;
