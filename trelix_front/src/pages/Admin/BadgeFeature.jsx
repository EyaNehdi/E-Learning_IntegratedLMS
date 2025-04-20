import { Outlet, NavLink } from "react-router-dom";
import Headeradmin from "../../components/Admin/Headeradmin";

const BadgeFeature = () => {
  return (
    <div>
      <title>Dashboard Admin</title>
      <Headeradmin />
      <div className="page-wrapper" style={{ marginBlock: "2px" }}>
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar */}
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
                                <NavLink to="/" className="text-dark">
                                  Dashboard
                                </NavLink>
                              </li>
                              <li className="breadcrumb-item d-inline-block active">
                                Badges
                              </li>
                            </ol>
                            <h4 className="text-dark">Badge Management</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <NavLink
                      to="/badge/createBadge"
                      className="btn btn-theme button-1 ctm-border-radius text-white btn-block"
                    >
                      <span>
                        <i className="fa fa-plus" />
                      </span>{" "}
                      Create New Badge
                    </NavLink>
                    <NavLink
                      to="/badge/list-badges"
                      className="btn btn-outline-secondary ctm-border-radius text-dark btn-block mt-2"
                    >
                      <span>
                        <i className="fa fa-list" />
                      </span>{" "}
                      View All Badges
                    </NavLink>
                  </div>
                </div>
              </aside>
            </div>

            {/* Main Content */}
            <div className="col-xl-9 col-lg-8 col-md-12">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeFeature;
