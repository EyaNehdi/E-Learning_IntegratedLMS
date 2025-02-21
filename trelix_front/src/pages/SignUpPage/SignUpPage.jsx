import InstructorRegister from "../../components/Instructor/InstructorRegister";
import StudentRegister from "../../components/Student/StudentRegister";
import MfaSetup from "../../components/MfaSetup/MfaSetup";
import React, { useState } from "react";
import { useProfileStore } from "../../store/profileStore";
import { useEffect } from "react";
import "./signupStyle.css";

function SignUpPage() {
  const [isInstructor, setIsInstructor] = useState(true);
  const [isRegisterSuccess, setisRegisterSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const { user, fetchUser } = useProfileStore();

  useEffect(() => {
    if (isRegisterSuccess) {
      fetchUser();
    }
  }, [isRegisterSuccess]);

  useEffect(() => {
    if (user) {
      console.log("User after fetch:", user);
      setUserId(user._id);
    }
  }, [user]);

  const toggleSignup = () => {
    setIsInstructor((prevState) => !prevState);
  };
  return (
    <div className="vh-100 d-flex align-items-center justify-content-center m-0 p-0">
      <title>Sign up to Trelix . Trelix</title>
      <div className="row w-100 h-100 m-0 p-0">
        {/* Left Side (Hidden on small screens) */}
        <div
          className="col-12 col-md-5 col-lg-4 flex-fill overflow-auto d-none d-md-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#6045FF",
            flex: "1",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <div style={{ textAlign: "center" }}>
              <img
                src="assets/images/signup-2.png"
                alt="Sign Up"
                className="img-fluid"
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginBottom: "20px",
                  marginTop: "15px",
                }}
              >
                <button
                  className="btn btn-outline-secondary mb-2"
                  style={{
                    border: "1px solid white",
                    color: "white",
                    backgroundColor: "transparent",
                    transition: "background-color 0.3s, color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.color = "#6045FF";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "white";
                  }}
                >
                  Contact support
                </button>
              </div>

              <a
                href="/privacy-policy"
                className="text-white text-decoration-none"
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginTop: "10px",
                }}
              >
                Privacy & Policy
              </a>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="col-12 col-md-7 col-lg-8 m-0 p-0"
          style={{
            height: "100%",
            overflow: "auto",
          }}
        >
          <div className="w-100 d-flex flex-column align-items-center justify-content-start">
            {isRegisterSuccess ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh", // Full viewport height
                }}
              >
                <MfaSetup />
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "400",
                      color: "#000",
                      marginTop: "20px",
                    }}
                  >
                    Select your account type to continue:
                  </p>
                </div>

                {/* Toggle Signup Type */}
                <div
                  onClick={() => setIsInstructor(!isInstructor)}
                  className="position-relative mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: "80%",
                    maxWidth: "250px",
                    height: "40px",
                    backgroundColor: "#6045FF",
                    borderRadius: "20px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Moving Indicator */}
                  <div
                    className="position-absolute top-0 transition"
                    style={{
                      left: isInstructor ? "0" : "50%",
                      width: "50%",
                      height: "100%",
                      backgroundColor: "#fff",
                      borderRadius: "25px",
                      transition: "left 0.3s ease-in-out",
                    }}
                  ></div>

                  {/* Text Labels */}
                  <div className="d-flex text-center w-100">
                    <div
                      className={`flex-grow-1 py-2`}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        color: isInstructor ? "#6045FF" : "#6045FF",
                        fontWeight: isInstructor ? "bold" : "normal",
                        visibility: isInstructor ? "visible" : "hidden",
                      }}
                    >
                      Instructor
                    </div>
                    <div
                      className={`flex-grow-1 py-2`}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        color: isInstructor ? "#6045FF" : "#6045FF",
                        fontWeight: isInstructor ? "normal" : "bold",
                        visibility: !isInstructor ? "visible" : "hidden",
                      }}
                    >
                      Student
                    </div>
                  </div>
                </div>

                {/* Conditional Form Rendering */}
                {isInstructor ? (
                  <InstructorRegister
                    setisRegisterSuccess={setisRegisterSuccess}
                  />
                ) : (
                  <StudentRegister
                    setisRegisterSuccess={setisRegisterSuccess}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
