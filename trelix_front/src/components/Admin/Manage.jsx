import Headeradmin from "./Headeradmin";

function Manage() {
  return (
    <div>
      {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/manage.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:17 GMT */}
      {/* Required meta tags */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Manage Page</title>
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="assets/img/favicon.png" />

      <div>
        {/* Bootstrap CSS */}
        <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
        {/* Linearicon Font */}
        <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
        {/* Fontawesome CSS */}
        <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
        {/* Custom CSS */}
        <link rel="stylesheet" href="assetss/css/style.css" />
        <div>
          <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
          <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
          <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
          <link rel="stylesheet" href="assetss/css/style.css" />
        </div>
      </div>

      <Headeradmin />

      <div
        className="page-wrapper"
        style={{
          marginBlock: "2px",
        }}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-3 col-lg-4 col-md-12 theiaStickySidebar">
              <aside className="sidebar sidebar-user">
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-body py-4">
                    <div className="row">
                      <div className="col-md-12 mr-auto text-left">
                        <div className="custom-search input-group">
                          <div className="custom-breadcrumb">
                            <ol className="breadcrumb no-bg-color d-inline-block p-0 m-0 mb-2">
                              <li className="breadcrumb-item d-inline-block">
                                <a href="index.html" className="text-dark">
                                  Home
                                </a>
                              </li>
                              <li className="breadcrumb-item d-inline-block active">
                                Manage
                              </li>
                            </ol>
                            <h4 className="text-dark">Manage</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="quicklink-sidebar-menu ctm-border-radius shadow-sm bg-white card">
                  <div className="card-body">
                    <ul className="list-group">
                      <li className="list-group-item text-center active button-5">
                        <a href="manage.html" className="text-white">
                          Account Roles
                        </a>
                      </li>
                      <li className="list-group-item text-center button-6">
                        <a className="text-dark" href="manage-leadership.html">
                          Leadership Roles
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
            <div className="col-xl-9 col-lg-8  col-md-12">
              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-6 d-flex">
                  <div className="card ctm-border-radius shadow-sm flex-fill">
                    <div className="card-header">
                      <h4 className="card-title mb-0">Super Admin</h4>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        They can see and do everything – best not to have many
                        with this role.
                      </p>
                      <div className="mt-2">
                        <span
                          className="avatar"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Richard Wilson"
                        >
                          <img
                            src="asset
                      ss/img/profiles/img-10.jpg"
                            alt="Richard Wilson"
                            className="img-fluid"
                          />
                        </span>
                        <a
                          href="super-admin.html"
                          className="btn btn-theme button-1 ctm-border-radius text-white float-right "
                        >
                          View Permissions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 d-flex">
                  <div className="card ctm-border-radius shadow-sm flex-fill">
                    <div className="card-header">
                      <h4 className="card-title mb-0">Admin</h4>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        Admin to help sort stuff, but have less access to
                        confidential information like salaries.
                      </p>
                      <div className="mt-2">
                        <span
                          className="avatar"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Richard Wilson"
                        >
                          <img
                            src="assetss/img/profiles/img-10.jpg"
                            alt="Richard Wilson"
                            className="img-fluid"
                          />
                        </span>
                        <a
                          href="admin.html"
                          className="btn btn-theme button-1 ctm-border-radius text-white float-right "
                        >
                          View Permissions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 d-flex">
                  <div className="card ctm-border-radius shadow-sm flex-fill">
                    <div className="card-header">
                      <h4 className="card-title mb-0">Payroll Admin</h4>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        They sort out your payroll and have access to everyone's
                        salary information.
                      </p>
                      <div className="mt-2">
                        <span
                          className="avatar"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Richard Wilson"
                        >
                          <img
                            src="assetss/img/profiles/img-10.jpg"
                            alt="Richard Wilson"
                            className="img-fluid"
                          />
                        </span>
                        <a
                          href="payroll-admin.html"
                          className="btn btn-theme button-1 ctm-border-radius text-white float-right "
                        >
                          View Permissions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 d-flex">
                  <div className="card ctm-border-radius shadow-sm flex-fill">
                    <div className="card-header">
                      <h4 className="card-title mb-0">Team Member</h4>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        Team Members have the most limited access – most people
                        should have this role.
                      </p>
                      <div className="mt-2">
                        <span
                          className="avatar"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Maria Cotton"
                        >
                          <img
                            src="assetss/img/profiles/img-6.jpg"
                            alt="Maria Cotton"
                            className="img-fluid"
                          />
                        </span>
                        <a
                          href="team-member.html"
                          className="btn btn-theme button-1 ctm-border-radius text-white float-right "
                        >
                          View Permissions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*/Content*/}

      {/* Inner Wrapper */}
      <div className="sidebar-overlay" id="sidebar_overlay" />
      {/* Add Working Weeks */}
      <div className="modal fade" id="addWorkWeek">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Modal body */}
            <div className="modal-body">
              <form>
                <button type="button" className="close" data-dismiss="modal">
                  ×
                </button>
                <h4 className="modal-title mb-3">Edit Working Week</h4>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Mon"
                    className="custom-control-input"
                    defaultChecked
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Mon">
                    Mon
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Tue"
                    className="custom-control-input"
                    defaultChecked
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Tue">
                    Tue
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Wed"
                    className="custom-control-input"
                    defaultChecked
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Wed">
                    Wed
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Thu"
                    className="custom-control-input"
                    defaultChecked
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Thu">
                    Thu
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Fri"
                    className="custom-control-input"
                    defaultChecked
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Fri">
                    Fri
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Sat"
                    className="custom-control-input"
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Sat">
                    Sat
                  </label>
                </div>
                <div className=" custom-control custom-checkbox mb-3 d-inline-block mr-3">
                  <input
                    type="checkbox"
                    id="Sun"
                    className="custom-control-input"
                  />
                  <label className="mb-0 custom-control-label" htmlFor="Sun">
                    Sun
                  </label>
                </div>
                <br />
                <button
                  type="button"
                  className="btn btn-danger text-white ctm-border-radius float-right ml-3"
                  data-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-theme button-1 text-white ctm-border-radius float-right"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Add Working Weeks */}
      <div className="modal fade" id="edit_timedefault">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Modal body */}
            <div className="modal-body">
              <button type="button" className="close" data-dismiss="modal">
                ×
              </button>
              <h4 className="modal-title mb-3">Company Default</h4>
              <div className="form-group">
                <label>Time Off Allowance</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  defaultValue="25 Days"
                />
              </div>
              <div className="form-group">
                <label>Year Start</label>
                <input
                  type="text"
                  className="form-control datetpicker"
                  placeholder="Year Start"
                  defaultValue="01-01-2019"
                />
              </div>
              <button
                type="button"
                className="btn btn-danger text-white ctm-border-radius float-right ml-3"
                data-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-theme button-1 text-white ctm-border-radius float-right"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/manage.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:18 GMT */}
    </div>
  );
}
export default Manage;
