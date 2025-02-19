import InstructorRegister from "../components/Instructor/InstructorRegister";
import StudentRegister from "../components/Student/StudentRegister";
import MfaSetup from "../components/MfaSetup/MfaSetup";
import React, { useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { useEffect } from "react";

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
    <div>
      <section className="signup-sec full-screen">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-5 col-md-5">
              <div className="signup-thumb">
                <img
                  className="img-fluid"
                  src="assets/images/signup-2.png"
                  alt="Sign Up"
                />
              </div>
            </div>
            <div className="col-xl-7 col-md-7">
              {isRegisterSuccess ? (
                <MfaSetup />
              ) : (
                <>
                  <div
                    onClick={toggleSignup}
                    style={{
                      position: "relative",
                      width: "220px", // largeur totale du conteneur
                      height: "50px",
                      marginLeft: "900px", // hauteur
                      margin: "20px auto",
                      border: "2px solid #007BFF",
                      borderRadius: "25px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: isInstructor ? "0" : "50%", // se déplace à gauche ou à droite
                        width: "50%", // occupe la moitié du conteneur
                        height: "100%",
                        backgroundColor: "#007BFF",
                        transition: "left 0.3s ease-in-out",
                      }}
                    ></div>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isInstructor ? "#fff" : "#007BFF",
                          fontWeight: isInstructor ? "bold" : "normal",
                        }}
                      >
                        Instructor
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: !isInstructor ? "#fff" : "#007BFF",
                          fontWeight: !isInstructor ? "bold" : "normal",
                        }}
                      >
                        Student
                      </div>
                    </div>
                  </div>
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
      </section>
    </div>
  );
}

export default SignUpPage;
