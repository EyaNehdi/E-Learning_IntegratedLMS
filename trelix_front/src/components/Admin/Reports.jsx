import Headeradmin from './Headeradmin';

function Reports(){
                      return(


<div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/reports.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:15 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reports Page</title>
  {/* Favicon */}
  <link rel="icon" type="image/x-icon" href="assets/img/favicon.png" />
  {/* Inner wrapper */}

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

		

  <Headeradmin/>
    <div className="page-wrapper"  style={{
    marginBlock: "2px"}}>
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
                            <li className="breadcrumb-item d-inline-block"><a href="index.html" className="text-dark">Home</a></li>
                            <li className="breadcrumb-item d-inline-block active">Reports</li>
                          </ol>
                          <h4 className="text-dark">Reports</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-body">
                  <a href="javascript:void(0)" className="btn btn-theme button-1 ctm-border-radius text-white btn-block" data-toggle="modal" data-target="#add_report"><span><i className="fe fe-plus" /></span> Create Reports</a>
                </div>
              </div>
              <div className="quicklink-sidebar-menu ctm-border-radius shadow-sm bg-white card">
                <div className="card-body">
                  <ul className="list-group">
                    <li className="list-group-item text-center active"><a href="reports.html" className="text-white">Team Member Data</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="leave-reports.html">Leave Data</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="payroll-reports.html">Payroll Data</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="contact-reports.html">Contact reports</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="email-reports.html">Email Reports</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="security-reports.html">Security Reports</a></li>
                    <li className="list-group-item text-center"><a className="text-dark" href="work-from-home-reports.html">Working From Home Reports</a></li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8  col-md-12">
            <div className="card shadow-sm ctm-border-radius">
              <div className="card-body align-center">
                <ul className="nav nav-pills" id="pills-tab" role="tablist">
                  <li className="nav-item mr-md-1">
                    <a className="nav-link active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Team Member Official Reports</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Team Member Personal reports</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card shadow-sm ctm-border-radius">
              <div className="card-body align-center">
                <div className="row filter-row">
                  <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3"> 
                    <div className="form-group mb-xl-0 mb-md-2 mb-sm-2">
                      <select className="form-control select">
                        <option selected>Start Date</option>
                        <option>Date Of Birth</option>
                        <option>Created At</option>
                        <option>Leaving Date</option>
                        <option>Visa Expiry Date</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3">  
                    <div className="form-group mb-lg-0 mb-md-2 mb-sm-2">
                      <input type="text" className="form-control datetimepicker" placeholder="From" />
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3">  
                    <div className="form-group mb-lg-0 mb-md-0 mb-sm-0">
                      <input type="text" className="form-control datetimepicker" placeholder="To" />
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-6 col-lg-6 col-xl-3">  
                    <a href="#" className="btn btn-theme button-1 text-white btn-block p-2 mb-md-0 mb-sm-0 mb-lg-0 mb-0"> Apply Filter </a>  
                  </div>
                </div>
              </div>
            </div>
            <div className="card shadow-sm ctm-border-radius">
              <div className="card-body align-center">
                <div className="tab-content" id="pills-tabContent">
                  {/*Tab 1*/}
                  <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                    <div className="employee-office-table">
                      <div className="table-responsive">
                        <table className="table custom-table table-hover">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Active</th>
                              <th>Employment</th>
                              <th>Email</th>
                              <th>Job title</th>
                              <th>Line Manager</th>
                              <th>Team name</th>
                              <th>Start Date</th>
                              <th>Company Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img alt="avatar image" src="assets/img/profiles/img-5.jpg" className="img-fluid" /></a>
                                <h2><a href="employment.html">Danny Ward</a></h2>
                              </td>
                              <td>
                                <div className="dropdown action-label drop-active">
                                  <a href="javascript:void(0)" className="btn btn-white btn-sm dropdown-toggle" data-toggle="dropdown"> Active <i className="caret" /></a>
                                  <div className="dropdown-menu">
                                    <a className="dropdown-item" href="javascript:void(0)"> Active</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Inactive</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Invited</a>
                                  </div>
                                </div>
                              </td>
                              <td>Permanent</td>
                              <td><a href="https://dleohr.dreamstechnologies.com/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="e480858a9d93859680a4819c8589948881ca878b89">[email&nbsp;protected]</a></td>
                              <td>Team Lead</td>
                              <td><span className="btn btn-outline-success text-dark btn-sm">Richard Wilson</span></td>
                              <td><span className="btn btn-outline-warning text-dark btn-sm">Designing</span></td>
                              <td>05 Jan 2019</td>
                              <td>Focus Technologies</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-4.jpg" /></a>
                                <h2><a href="employment.html"> Linda Craver</a></h2>
                              </td>
                              <td>
                                <div className="dropdown action-label drop-active">
                                  <a href="javascript:void(0)" className="btn btn-white btn-sm dropdown-toggle" data-toggle="dropdown"> Active <i className="caret" /></a>
                                  <div className="dropdown-menu">
                                    <a className="dropdown-item" href="javascript:void(0)"> Active</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Inactive</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Invited</a>
                                  </div>
                                </div>
                              </td>
                              <td>Permanent</td>
                              <td><a href="https://dleohr.dreamstechnologies.com/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="92fefbfcf6f3f1e0f3e4f7e0d2f7eaf3ffe2fef7bcf1fdff">[email&nbsp;protected]</a></td>
                              <td>Team Lead</td>
                              <td><span className="btn btn-outline-success text-dark btn-sm">Richard Wilson</span></td>
                              <td><span className="btn btn-outline-warning text-dark btn-sm">IOS</span></td>
                              <td>07 Jun 2019</td>
                              <td>Focus Technologies</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-3.jpg" /></a>
                                <h2><a href="employment.html">Jenni Sims</a></h2>
                              </td>
                              <td>
                                <div className="dropdown action-label drop-active">
                                  <a href="javascript:void(0)" className="btn btn-white btn-sm dropdown-toggle" data-toggle="dropdown"> Active <i className="caret" /></a>
                                  <div className="dropdown-menu">
                                    <a className="dropdown-item" href="javascript:void(0)"> Active</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Inactive</a>
                                    <a className="dropdown-item" href="javascript:void(0)"> Invited</a>
                                  </div>
                                </div>
                              </td>
                              <td>Permanent</td>
                              <td><a href="https://dleohr.dreamstechnologies.com/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="4228272c2c2b312b2f3102273a232f322e276c212d2f">[email&nbsp;protected]</a></td>
                              <td>Team Lead</td>
                              <td><span className="btn btn-outline-success text-dark btn-sm">Richard Wilson</span></td>
                              <td><span className="btn btn-outline-warning text-dark btn-sm">Android</span></td>
                              <td>05 Apr 2019</td>
                              <td>Focus Technologies</td>
                            </tr>
                            
                         
                          +
                          
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  {/*/Tab 1*/}
                  {/* Tab 2*/}
                  <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                    <div className="employee-office-table">
                      <div className="table-responsive">
                        <table className="table custom-table table-hover">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Gender</th>
                              <th>Salary Current</th>
                              <th>Date Of Birth</th>
                              <th>Phone Number</th>
                              <th>Address</th>
                              <th>Bank Name</th>
                              <th>Account Number</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img alt="avatar image" src="assets/img/profiles/img-5.jpg" className="img-fluid" /></a>
                                <h2><a href="employment.html">Danny Ward</a></h2>
                              </td>
                              <td>
                                Male
                              </td>
                              <td>$3000</td>
                              <td>25 Jun 1984</td>
                              <td>9876543231</td>
                              <td>201 Lunetta Street,Plant City,<br /> Florida(FL), 33566</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987652</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-4.jpg" /></a>
                                <h2><a href="employment.html"> Linda Craver</a></h2>
                              </td>
                              <td>
                                Female
                              </td>
                              <td>$2000</td>
                              <td>14 Feb 1984</td>
                              <td>9876543221</td>
                              <td>683 Longview Avenue,New York, <br /> New York(NY), 10011</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987662</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-3.jpg" /></a>
                                <h2><a href="employment.html">Jenni Sims</a></h2>
                              </td>
                              <td>
                                Female
                              </td>
                              <td>$4000</td>
                              <td>20 Jan 1984</td>
                              <td>9876534214</td>
                              <td> 4923 Front Street,Detroit,<br /> Michigan(MI), 48226</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987653</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img alt="avatar image" src="assets/img/profiles/img-6.jpg" className="img-fluid" /></a>
                                <h2><a href="employment.html"> Maria Cotton</a></h2>
                              </td>
                              <td>
                                Female
                              </td>
                              <td>$5000</td>
                              <td>15 Jul 1984</td>
                              <td>9876541123</td>
                              <td>1246 Parkway Street, Brawley, <br />California(CA), 92227</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987654</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-2.jpg" /></a>
                                <h2><a href="employment.html"> John Gibbs</a></h2>
                              </td>
                              <td>
                                Male
                              </td>
                              <td>$4500</td>
                              <td>05 Dec 1984</td>
                              <td>9876541132</td>
                              <td>4604 Fairfax Drive,Rochelle Park,<br /> New Jersey(NJ), 07662</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987655</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-10.jpg" /></a>
                                <h2><a href="employment.html"> Richard Wilson</a></h2>
                              </td>
                              <td>
                                Male
                              </td>
                              <td>$4600</td>
                              <td>25 Apr 1984</td>
                              <td>9876541321</td>
                              <td>3088 Gordon Street, Los Angeles,<br /> California(CA), 90017</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987656</td>
                            </tr>
                            <tr>
                              <td>
                                <a href="employment.html" className="avatar"><img className="img-fluid" alt="avatar image" src="assets/img/profiles/img-8.jpg" /></a>
                                <h2><a href="employment.html">Stacey Linville</a></h2>
                              </td>
                              <td>
                                Female
                              </td>
                              <td>$4700</td>
                              <td>23 Jan 1984</td>
                              <td>9876542312</td>
                              <td>835 Sarah Drive,Lafayette,<br /> Louisiana(LA), 70506</td>
                              <td>Life Essence Banks, Inc.</td>
                              <td>112300987657</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  {/* /Tab 2*/}
                </div>
                <div className="text-center mt-3">
                  <a href="javascript:void(0)" className="btn btn-theme button-1 ctm-border-radius text-white">Download Report</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/*/Content*/}
  
  {/* Inner Wrapper */}
  {/* Create Reports The Modal */}
  <div className="modal fade" id="add_report">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        {/* Modal body */}
        <div className="modal-body">
          <button type="button" className="close" data-dismiss="modal">×</button>
          <h4 className="modal-title mb-3">Create Report</h4>
          <form>
            <p className="mb-2">Select Report Type</p>
            <div className="custom-control custom-radio custom-control-inline">
              <input type="radio" className="custom-control-input" id="customRadio" name="example" defaultValue="customEx" />
              <label className="custom-control-label" htmlFor="customRadio">Team Member</label>
            </div>
            <div className="custom-control custom-radio custom-control-inline">
              <input type="radio" className="custom-control-input" id="customRadio2" name="example" defaultValue="customEx" />
              <label className="custom-control-label" htmlFor="customRadio2">Time Off</label>
            </div>
            <div className="form-group">
              <label className="mt-3">What data would you like to include?</label>
              {/* Multiselect dropdown */}
              <select multiple className="select w-100 form-control">
                <option>Full Name</option>
                <option>Working Days Off</option>
                <option>Booked By</option>
                <option>Start Date</option>
                <option>End Date</option>
                <option>Team Name</option>
                <option>First Name</option>
                <option>Last Name</option>
                <option>Email</option>
                <option>Date Of Birth</option>
                <option>Phone Number</option>
              </select>{/* End */}
            </div>
          </form>
          <button type="button" className="btn btn-danger text-white ctm-border-radius float-right ml-3" data-dismiss="modal">Cancel</button>
          <button type="button" className="btn btn-theme button-1 text-white ctm-border-radius float-right">Add</button>
        </div>
      </div>
    </div>
  </div>
  <div className="sidebar-overlay" id="sidebar_overlay" />
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/reports.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:17 GMT */}
</div>
                      );
}
export default Reports;