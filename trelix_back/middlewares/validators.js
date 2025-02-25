const yup = require('yup');

// Define the validation schema
const schema = yup.object({
  firstName: yup.string().matches(/^[A-Za-z]+$/, "First name must contain only letters (A-Z, a-z)")
  .min(2, "First name must be at least 2 characters.").required("First name is required."),
  lastName: yup.string().matches(/^[A-Za-z]+$/, "First name must contain only letters (A-Z, a-z)")
  .min(2, "Last name must be at least 2 characters.")
  .required("Last name is required."),
  email: yup.string()
  .matches(
    /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 
    "Email must start with a letter and can only contain '@', '.', '%', '+', '-', and '_' as special characters."
  )
  .email("Invalid email format.")
  .required("Email is required."),

  password: yup.string()
    .min(6, "Password must be at least 6 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.")
    .required("Password is required.")
});

const validateInput = async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });  // `abortEarly: false` allows for all errors to be returned
    next();  // If validation passes, move to the next middleware
  } catch (error) {
    const errors = error.inner.reduce((acc, curr) => {
      acc[curr.path] = curr.message; // Collect all errors in a structured way
      return acc;
    }, {});
    return res.status(400).json({ errors });
  }
};
module.exports = { validateInput };