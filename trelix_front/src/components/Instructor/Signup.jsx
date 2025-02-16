import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/auth/register/instructor',
        formData,
        { withCredentials: true }
      );

      if (response.data) {
        navigate('/'); // Redirect to home or dashboard after successful signup
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
                      return (
<div>
  {/* Mirrored from html.theme-village.com/eduxo/signup.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:40 GMT */}
  <meta charSet="utf-8" />
  <meta httpEquiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="description" content="An ideal tempalte for online education, e-Learning, Course School, Online School, Kindergarten, Classic LMS, University, Language Academy, Coaching, Online Course, Single Course, and Course marketplace." />
  <meta name="keywords" content="bootstrap 5, online course, education, creative, gulp, business, minimal, modern, course, one page, responsive, saas, e-Learning, seo, startup, html5, site template" />
  <meta name="author" content="theme-village" />
  <title>Eduxo - Online Courses and Education HTML5 Template</title>
  <link rel="apple-touch-icon" href="assets/images/favicon.png" />
  <link rel="shortcut icon" href="assets/images/favicon.ico" />
  {/* SignUp Section Start */}
  <section className="signup-sec full-screen">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-xl-5 col-md-5">
          <div className="signup-thumb">
            <img className="img-fluid" src="assets/images/signup-2.png" alt="Sign Up" />
          </div>
        </div>
        <div className="col-xl-7 col-md-7">
          <div className="signup-form">
            <h1 className="display-3 text-center mb-5">Let’s Sign Up Instructor</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-user" /></span>
                <input type="text" placeholder=" FirstName" name="firstName"
            value={formData.firstName}
            onChange={handleChange} required />
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-user" /></span>
                <input type="text" placeholder=" LastName"  name="lastName"
            value={formData.lastName}
            onChange={handleChange} required />
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-mail" /></span>
                <input type="email" placeholder=" Email" name="email"
            value={formData.email}
            onChange={handleChange} required />
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-lock" /></span>
                <input type="password" placeholder="Password"  name="password"
            value={formData.password}
            onChange={handleChange} required />
              </div>
              <button 
  className="btn btn-primary w-100" 
  style={{ 
    padding: "15px", // Augmente la hauteur du bouton
    fontSize: "18px", // Augmente la taille du texte
    borderRadius: "8px" // Arrondi les bords
  }}
  type="submit" disabled={loading}
>
{loading ? 'Registering...' : 'Sign Up as Instructor'}
</button>
              <div className="form-footer mt-4 text-center">
                <div className="alter overly">
                  <p>OR</p>
                </div>
                <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/icons/google.png" alt="Facebook" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
              Continue with Google
              </a>
              <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/microsoft.png" alt="Google" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
               Continue with Microsoft
               </a> 
               <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/gitt.png" alt="Google" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
               Continue with GitHub
               </a> 
                <p>Already have account? <a href="login.html" className="text-primary fw-bold">Login Now</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* Mirrored from html.theme-village.com/eduxo/signup.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:41 GMT */}
</div>
                      );
}
export default Signup;
