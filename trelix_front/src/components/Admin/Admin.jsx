import Headeradmin from './Headeradmin';

function Admin(){
                      return (
<div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/index.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:09 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard Page</title>
  {/* Favicon */}
  <link rel="icon" type="image/x-icon" href="assetss/img/logoos.png" />




    <Headeradmin/>
  
    <div className="page-wrapper">
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
                              <a href="index.html" className="text-dark">Home</a>
                            </li>
                            <li className="breadcrumb-item d-inline-block active">
                              Dashboard
                            </li>
                          </ol>
                          <h4 className="text-dark">
                            Admin
                            Dashboard
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="user-card card shadow-sm bg-white text-center ctm-border-radius">
                <div className="user-info card-body">
                  <div className="user-avatar mb-4">
                    <img src="assetss/img/profiles/img-13.jpg" alt="User Avatar" className="img-fluid rounded-circle" width={100} />
                  </div>
                  <div className="user-details">
                    <h4><b>Welcome Admin</b>
                    </h4>
                    <p>Sun, 29 Nov 2019
                    </p>
                  </div>
                </div>
              </div>
              <div className="quicklink-sidebar-menu ctm-border-radius shadow-sm bg-white card">
                <div className="card-body">
                  <ul className="list-group">
                    <li className="list-group-item text-center active button-5">
                      <a href="index.html" className="text-white">Admin
                        Dashboard</a>
                    </li>
                    <li className="list-group-item text-center button-6">
                      <a className="text-dark" href="employees-dashboard.html">Employees
                        Dashboard</a>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8 col-md-12">
            {/* Widget */}
            <div className="row">
              <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-12">
                <div className="card dash-widget ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <div className="card-icon bg-primary">
                      <i className="fa fa-users" aria-hidden="true" />
                    </div>
                    <div className="card-right">
                      <h4 className="card-title">
                        Employees
                      </h4>
                      <p className="card-text">
                        700
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 col-12">
                <div className="card dash-widget ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <div className="card-icon bg-warning">
                      <i className="fa fa-building-o" />
                    </div>
                    <div className="card-right">
                      <h4 className="card-title">
                        Companies
                      </h4>
                      <p className="card-text">
                        30
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 col-12">
                <div className="card dash-widget ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <div className="card-icon bg-danger">
                      <i className="fa fa-suitcase" aria-hidden="true" />
                    </div>
                    <div className="card-right">
                      <h4 className="card-title">
                        Leaves
                      </h4>
                      <p className="card-text">
                        3
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-6 col-sm-6 col-12">
                <div className="card dash-widget ctm-border-radius shadow-sm">
                  <div className="card-body">
                    <div className="card-icon bg-success">
                      <i className="fa fa-money" aria-hidden="true" />
                    </div>
                    <div className="card-right">
                      <h4 className="card-title">
                        Salary
                      </h4>
                      <p className="card-text">
                        $5.8M
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* / Widget */}
            {/* Chart */}
            <div className="row">
              <div className="col-xl-6 col-lg-12 col-md-6 d-flex">
                <div className="card ctm-border-radius shadow-sm flex-fill">
                  <div className="card-header">
                    <h4 className="card-title mb-0">
                      Total
                      Employees
                    </h4>
                  </div>
                  <div className="card-body">
                    <canvas id="pieChart" />
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-12 col-md-6 d-flex">
                <div className="card ctm-border-radius shadow-sm flex-fill">
                  <div className="card-header">
                    <h4 className="card-title mb-0">
                      Total
                      Salary
                      By
                      Unit
                    </h4>
                  </div>
                  <div className="card-body">
                    <canvas id="lineChart" />
                  </div>
                </div>
              </div>
            </div>
            {/* / Chart */}
            <div className="row">
              <div className="col-xl-6 col-lg-12 col-md-12">
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0 d-inline-block">
                      Today
                    </h4>
                    <a href="javascript:void(0)" className="d-inline-block float-right text-primary"><i className="lnr lnr-sync" /></a>
                  </div>
                  <div className="card-body recent-activ">
                    <div className="recent-comment">
                      <a href="javascript:void(0)" className="dash-card text-dark">
                        <div className="dash-card-container">
                          <div className="dash-card-icon text-primary">
                            <i className="fa fa-birthday-cake" aria-hidden="true" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              No
                              Birthdays
                              Today
                            </h6>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-dark">
                        <div className="dash-card-container">
                          <div className="dash-card-icon text-warning">
                            <i className="fa fa-bed" aria-hidden="true" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Ralph
                              Baker
                              is
                              off
                              sick
                              today
                            </h6>
                          </div>
                          <div className="dash-card-avatars">
                            <div className="e-avatar">
                              <img className="img-fluid" src="assets/img/profiles/img-9.jpg" alt="Avatar" />
                            </div>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-dark">
                        <div className="dash-card-container">
                          <div className="dash-card-icon text-success">
                            <i className="fa fa-child" aria-hidden="true" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Ralph
                              Baker
                              is
                              parenting
                              leave
                              today
                            </h6>
                          </div>
                          <div className="dash-card-avatars">
                            <div className="e-avatar">
                              <img className="img-fluid" src="assetss/img/profiles/img-9.jpg" alt="Avatar" />
                            </div>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-dark">
                        <div className="dash-card-container">
                          <div className="dash-card-icon text-danger">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Danny
                              ward
                              is
                              away
                              today
                            </h6>
                          </div>
                          <div className="dash-card-avatars">
                            <div className="e-avatar">
                              <img className="img-fluid" src="assetss/img/profiles/img-5.jpg" alt="Avatar" />
                            </div>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-dark">
                        <div className="dash-card-container">
                          <div className="dash-card-icon text-pink">
                            <i className="fa fa-home" aria-hidden="true" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              You
                              are
                              working
                              from
                              home
                              today
                            </h6>
                          </div>
                          <div className="dash-card-avatars">
                            <div className="e-avatar">
                              <img className="img-fluid" src="assetss/img/profiles/img-6.jpg" alt="Maria Cotton" />
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-12 col-md-12 d-flex">
                {/* Team Leads List */}
                <div className="card flex-fill team-lead shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0 d-inline-block">
                      Team
                      Leads
                    </h4>
                    <a href="employees.html" className="dash-card float-right mb-0 text-primary">Manage
                      Team
                    </a>
                  </div>
                  <div className="card-body">
                    <div className="media mb-3">
                      <div className="e-avatar avatar-online mr-3">
                        <img src="assetss/img/profiles/img-6.jpg" alt="Maria Cotton" className="img-fluid" />
                      </div>
                      <div className="media-body">
                        <h6 className="m-0">
                          Maria
                          Cotton
                        </h6>
                        <p className="mb-0 ctm-text-sm">
                          PHP
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="media mb-3">
                      <div className="e-avatar avatar-online mr-3">
                        <img className="img-fluid" src="assetss/img/profiles/img-5.jpg" alt="Linda Craver" />
                      </div>
                      <div className="media-body">
                        <h6 className="m-0">
                          Danny
                          Ward
                        </h6>
                        <p className="mb-0 ctm-text-sm">
                          Design
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="media mb-3">
                      <div className="e-avatar avatar-online mr-3">
                        <img src="assetss/img/profiles/img-4.jpg" alt="Linda Craver" className="img-fluid" />
                      </div>
                      <div className="media-body">
                        <h6 className="m-0">
                          Linda
                          Craver
                        </h6>
                        <p className="mb-0 ctm-text-sm">
                          IOS
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="media mb-3">
                      <div className="e-avatar avatar-online mr-3">
                        <img className="img-fluid" src="assetss/img/profiles/img-3.jpg" alt="Linda Craver" />
                      </div>
                      <div className="media-body">
                        <h6 className="m-0">
                          Jenni
                          Sims
                        </h6>
                        <p className="mb-0 ctm-text-sm">
                          Android
                        </p>
                      </div>
                    </div>
                    <hr />
                    <div className="media">
                      <div className="e-avatar avatar-offline mr-3">
                        <img className="img-fluid" src="assetss/img/profiles/img-2.jpg" alt="Linda Craver" />
                      </div>
                      <div className="media-body">
                        <h6 className="m-0">
                          John
                          Gibbs
                        </h6>
                        <p className="mb-0 ctm-text-sm">
                          Business
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 d-flex">
                {/* Recent Activities */}
                <div className="card recent-acti flex-fill shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0 d-inline-block">
                      Recent
                      Activities
                    </h4>
                    <a href="javascript:void(0)" className="d-inline-block float-right text-primary"><i className="lnr lnr-sync" /></a>
                  </div>
                  <div className="card-body recent-activ admin-activ">
                    <div className="recent-comment">
                      <div className="notice-board">
                        <div className="table-img">
                          <div className="e-avatar mr-3">
                            <img className="img-fluid" src="assetss/img/profiles/img-5.jpg" alt="Danny Ward" />
                          </div>
                        </div>
                        <div className="notice-body">
                          <h6 className="mb-0">
                            Lorem
                            Ipsum
                            dolor
                            sit
                            Amet.
                          </h6>
                          <span className="ctm-text-sm">Danny
                            Ward
                            |
                            1
                            hour
                            ago</span>
                        </div>
                      </div>
                      <hr />
                      <div className="notice-board">
                        <div className="table-img">
                          <div className="e-avatar mr-3">
                            <img className="img-fluid" src="assetss/img/profiles/img-2.jpg" alt="John Gibbs" />
                          </div>
                        </div>
                        <div className="notice-body">
                          <h6 className="mb-0">
                            Lorem
                            Ipsum
                            dolor
                            sit
                            Amet.
                          </h6>
                          <span className="ctm-text-sm">John
                            Gibbs
                            |
                            2
                            hour
                            ago</span>
                        </div>
                      </div>
                      <hr />
                      <div className="notice-board">
                        <div className="table-img">
                          <div className="e-avatar mr-3">
                            <img className="img-fluid" src="assetss/img/profiles/img-6.jpg" alt="Maria Cotton" />
                          </div>
                        </div>
                        <div className="notice-body">
                          <h6 className="mb-0">
                            Lorem
                            Ipsum
                            dolor
                            sit
                            Amet.
                          </h6>
                          <span className="ctm-text-sm">Maria
                            Cotton
                            |
                            4
                            hour
                            ago</span>
                        </div>
                      </div>
                      <hr />
                      <div className="notice-board">
                        <div className="table-img">
                          <div className="e-avatar mr-3">
                            <img className="img-fluid" src="assetss/img/profiles/img-4.jpg" alt="Linda Craver" />
                          </div>
                        </div>
                        <div className="notice-body">
                          <h6 className="mb-0">
                            Lorem
                            Ipsum
                            dolor
                            sit
                            Amet.
                          </h6>
                          <span className="ctm-text-sm">Linda
                            Craver
                            |
                            5
                            hour
                            ago</span>
                        </div>
                      </div>
                      <hr />
                      <div className="notice-board">
                        <div className="table-img">
                          <div className="e-avatar mr-3">
                            <img className="img-fluid" src="assetss/img/profiles/img-3.jpg" alt="Jenni Sims" />
                          </div>
                        </div>
                        <div className="notice-body">
                          <h6 className="mb-0">
                            Lorem
                            Ipsum
                            dolor
                            sit
                            Amet.
                          </h6>
                          <span className="ctm-text-sm">Jenni
                            Sims
                            |
                            6
                            hour
                            ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* / Recent Activities */}
              <div className="col-lg-6 col-md-12 d-flex">
                {/* Today */}
                <div className="card flex-fill today-list shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0 d-inline-block">
                      Your
                      Upcoming
                      Leave
                    </h4>
                    <a href="leave.html" className="d-inline-block float-right text-primary"><i className="fa fa-suitcase" /></a>
                  </div>
                  <div className="card-body recent-activ">
                    <div className="recent-comment">
                      <a href="javascript:void(0)" className="dash-card text-danger">
                        <div className="dash-card-container">
                          <div className="dash-card-icon">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Mon,
                              16
                              Dec
                              2019
                            </h6>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-primary">
                        <div className="dash-card-container">
                          <div className="dash-card-icon">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Fri,
                              20
                              Dec
                              2019
                            </h6>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-primary">
                        <div className="dash-card-container">
                          <div className="dash-card-icon">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Wed,
                              25
                              Dec
                              2019
                            </h6>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-primary">
                        <div className="dash-card-container">
                          <div className="dash-card-icon">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Fri,
                              27
                              Dec
                              2019
                            </h6>
                          </div>
                        </div>
                      </a>
                      <hr />
                      <a href="javascript:void(0)" className="dash-card text-primary">
                        <div className="dash-card-container">
                          <div className="dash-card-icon">
                            <i className="fa fa-suitcase" />
                          </div>
                          <div className="dash-card-content">
                            <h6 className="mb-0">
                              Tue,
                              31
                              Dec
                              2019
                            </h6>
                          </div>
                        </div>
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

 

  {/* jQuery */}
  {/* Bootstrap Core JS */}
  {/* Sticky sidebar JS */}
  {/* Chart JS */}
  {/* Custom Js */}
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/index.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:10 GMT */}
</div>


        

                      );
}

export default Admin;
