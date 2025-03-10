import React from "react";
const QuizAttemps = () => {
    return (
        <div>
        <div className="dashbaord-promo position-relative" />
        {/* Dashboard Cover Start */}
        <div className="dashbaord-cover bg-shade sec-padding">
          <div className="container">
            {/* Dashboard Inner Start */}
            <div className="row mt-5">
              <div className="col-lg-9 ps-lg-4">
                <section className="dashboard-sec">
                  <h2 className="display-5 border-bottom pb-3 mb-4">Quiz Attempts</h2>
                  <div className="row announce-filter bg-light rounded-2 px-3 py-4 mx-0 mb-5">
                    <div className="col-lg-6">
                      <div className="text-uppercase small fw-bold">Courses</div>
                      <select name="course" id="select-course">
                        <option value={1}>All</option>
                        <option value={1}>Web Development</option>
                        <option value={1}>Graphic Design</option>
                        <option value={1}>Ui/Ux Design</option>
                        <option value={1}>App Development</option>
                        <option value={1}>Enlish Learning</option>
                      </select>
                    </div>
                    <div className="col-lg-3">
                      <div className="text-uppercase small fw-bold">Sort by</div>
                      <select name="course" id="product-select">
                        <option value={1}>Default</option>
                        <option value={1}>Latest</option>
                        <option value={1}>Popularity</option>
                        <option value={1}>Trending</option>
                        <option value={1}>Price (Low to High)</option>
                        <option value={1}>Price (High to Low)</option>
                      </select>
                    </div>
                    <div className="col-lg-3">
                      <div className="text-uppercase small fw-bold">Price</div>
                      <select name="course" id="select-price">
                        <option value={1}>Free</option>
                        <option value={1}>Paid</option>
                        <option value={1}>Subscription</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <table className="table table-responsive">
                        <thead>
                          <tr>
                            <th>Quiz</th>
                            <th>Qus</th>
                            <th>TM</th>
                            <th>CA</th>
                            <th>Result</th>
                            <th>&nbsp;</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-success">Pass</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-danger">Fail</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-success">Pass</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-danger">Fail</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-success">Pass</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <p>20 Sep, 2024</p>
                              <a href="single-course.html" className="text-reset display-6">Loop over the object with foreach</a>
                              <p>Student: <span className="mute">Richard Eme</span></p>
                            </td>
                            <td>
                              4
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              7
                            </td>
                            <td>
                              <div className="badge bg-success">Fail</div>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <a href="#" title="Edit"><i className="feather-icon icon-edit" /></a>
                                <a href="#" title="Delete"><i className="feather-icon icon-trash-2" /></a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    );
}

export default QuizAttemps