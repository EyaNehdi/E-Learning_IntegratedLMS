import Headeradmin from "../../components/Admin/Headeradmin";
import { Outlet, useNavigate } from "react-router-dom";

const UsersPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <title>Dashboard Admin</title>
      <Headeradmin />
      <div
        className="page-wrapper"
        style={{
          marginBlock: "2px",
        }}
      >
        <div className="container-fluid">
          <div className="row">
            {/* the sidebar  */}
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
                                  Dashboard
                                </a>
                              </li>
                              <li className="breadcrumb-item d-inline-block active">
                                Users
                              </li>
                            </ol>
                            <h4 className="text-dark">User management</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <a
                      onClick={() => navigate(`/admin/create`)}
                      className="btn btn-theme button-1 ctm-border-radius text-white btn-block"
                    >
                      <span>
                        <i className="fa fa-plus" />
                      </span>{" "}
                      Create New User
                    </a>
                  </div>
                </div>
              </aside>
            </div>
            {/* the users list table  */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
export default UsersPage;
