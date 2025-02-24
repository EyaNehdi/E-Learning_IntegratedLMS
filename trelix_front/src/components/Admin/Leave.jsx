import Headeradmin from './Headeradmin';


function Leave(){
                      return(

                      

<div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:53:58 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Leave Page</title>
  {/* Favicon */}
  <link rel="icon" type="image/x-icon" href="assetss/img/favicon.png" />
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




    <div className="page-wrapper" style={{
    marginBlock: "2px"}}>
      <div className="container-fluid">
        <div className="row">
          <div className=" col-xl-3 col-lg-4 col-md-12 theiaStickySidebar">
            <aside className="sidebar sidebar-user">
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-body py-4">
                  <div className="row">
                    <div className="col-md-12 mr-auto text-left">
                      <div className="custom-search input-group">
                        <div className="custom-breadcrumb">
                          <ol className="breadcrumb no-bg-color d-inline-block p-0 m-0 mb-2">
                            <li className="breadcrumb-item d-inline-block"><a href="index.html" className="text-dark">Home</a></li>
                            <li className="breadcrumb-item d-inline-block active">Leave</li>
                          </ol>
                          <h4 className="text-dark">Leave</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-header">
                  <div className="d-inline-block">
                    <h4 className="card-title mb-0">Focus Technologies</h4>
                    <p className="mb-0 ctm-text-sm">Head Office</p>
                  </div>
                </div>
                <div className="card-body">
                  <h4 className="card-title">Members</h4>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Danny Ward"><img alt="avatar image" src="assetss/img/profiles/img-5.jpg" className="img-fluid" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Linda Craver"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-4.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Jenni Sims"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-3.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Maria Cotton"><img alt="avatar image" src="assetss/img/profiles/img-6.jpg" className="img-fluid" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="John Gibbs"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-2.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Richard Wilson"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-10.jpg" /></span></a>
                </div>
              </div>
              <div className="card shadow-sm ctm-border-radius">
                <div className="card-body">
                  <span className="avatar" data-toggle="tooltip" data-placement="top" title="Jenni Sims"><img src="assetss/img/profiles/img-3.jpg" alt="Jenni Sims" className="img-fluid" /></span><span className="ml-4">Jenni Sims is working from home today.</span>
                </div>
              </div>
              <div className="card shadow-sm ctm-border-radius">
                <div className="card-body">
                  <span className="avatar" data-toggle="tooltip" data-placement="top" title="John Gibbs"><img className="img-fluid" src="assetss/img/profiles/img-2.jpg" alt="Jenni Sims" /></span><span className="ml-4">
                    John Gibbs is away today.</span>
                </div>
              </div>
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8 col-md-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Apply Leaves</h4>
                  </div>
                  <div className="card-body">
                    <form>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Leave Type
                              <span className="text-danger">*</span>
                            </label>
                            <select className="form-control select">
                              <option>Select Leave</option>
                              <option>Working From Home</option>
                              <option>Sick Leave</option>
                              <option>Parental Leave</option>
                              <option>Annual Leave</option>
                              <option>Normal Leave</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-6 leave-col">
                          <div className="form-group">
                            <label>Remaining Leaves</label>
                            <input type="text" className="form-control" placeholder={10} disabled />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>From</label>
                            <input type="text" className="form-control datetimepicker" />
                          </div>
                        </div>
                        <div className="col-sm-6 leave-col">
                          <div className="form-group">
                            <label>To</label>
                            <input type="text" className="form-control datetimepicker" />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                            <label>
                              Half Day
                              <span className="text-danger">*</span>
                            </label>
                            <select className="form-control select">
                              <option>Select</option>
                              <option>First Half</option>
                              <option>Second Half</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-6 leave-col">
                          <div className="form-group">
                            <label>Number of Days Leave</label>
                            <input type="text" className="form-control" placeholder={2} disabled />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="form-group mb-0">
                            <label>Reason</label>
                            <textarea className="form-control" rows={4} defaultValue={""} />
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <a href="javascript:void(0);" className="btn btn-theme button-1 text-white ctm-border-radius mt-4">Apply</a>
                        <a href="javascript:void(0);" className="btn btn-danger text-white ctm-border-radius mt-4">Cancel</a>
                      </div>
                    </form>
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
  {/*Delete The Modal */}
  <div className="modal fade" id="delete">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        {/* Modal body */}
        <div className="modal-body">
          <button type="button" className="close" data-dismiss="modal">×</button>
          <h4 className="modal-title mb-3">Are You Sure Want to Delete?</h4>
          <button type="button" className="btn btn-danger ctm-border-radius text-white text-center mb-2 mr-3" data-dismiss="modal">Cancel</button>
          <button type="button" className="btn btn-theme button-1 ctm-border-radius text-white text-center mb-2" data-dismiss="modal">Delete</button>
        </div>
      </div>
    </div>
  </div>
  {/* jQuery */}
  {/* Bootstrap Core JS */}
  {/* Sticky sidebar JS */}
  {/* Select2 JS */}
  {/* Datetimepicker JS */}
  {/* Custom Js */}
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:05 GMT */}
</div>

);
}
export default Leave;
