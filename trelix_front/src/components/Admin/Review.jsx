import Headeradmin from './Headeradmin';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

const fetchUsers = async () => {
  const res = await axios.get("/api/admin/allUsers", { withCredentials: true });
  return res.data;
};
function Review() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  // Fetch users using React Query
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  // Mutation to delete user
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/admin/deleteUser/${id}`, { withCredentials: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]); // Refetch users after delete
    },
  });
   // Handle Delete User
   const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

                      return(
<div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/reviews.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:14 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard Admin</title>
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
<Headeradmin/>
    <div className="page-wrapper" style={{
    marginBlock: "2px"}}
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
                            <li className="breadcrumb-item d-inline-block"><a href="index.html" className="text-dark">Dashboard</a></li>
                            <li className="breadcrumb-item d-inline-block active">Users</li>
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
                  <a href="create-review.html" className="btn btn-theme button-1 ctm-border-radius text-white btn-block"><span><i className="fa fa-plus" /></span> Create Review</a>
                </div>
              </div>
              <div className="quicklink-sidebar-menu ctm-border-radius shadow-sm bg-white card">
                <div className="card-body">
                  <div className="flex-column list-group" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                    <a className=" active list-group-item" id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true">Overview</a>
                    <a className="list-group-item" id="v-pills-profile-tab" data-toggle="pill" href="#v-pills-profile" role="tab" aria-controls="v-pills-profile" aria-selected="false">Review Types</a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8  col-md-12">
            <div className="card shadow-sm ctm-border-radius">
              <div className="card-body align-center">
                  <div className="tab-pane fade show active" id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab">
                    <div className="employee-office-table">
                      <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      <table className="table custom-table table-hover">
        <thead>
          <tr>
            <th>User FirstName</th>
            <th>User LastName</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user._id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>
                {user.role}
              </td>
              <td>
              <button
    className="btn btn-sm btn-outline-primary"
    onClick={() => navigate(`/leave/${user._id}`)}
  >
    Update
  </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
                      </div>
                    </div>
                  </div>
               
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
</div>
                    );}
export default Review;
