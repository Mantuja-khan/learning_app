import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css"; // Custom CSS for the registration form
import { app } from "./firebase"; // Firebase app configuration
import { getDatabase, ref, set, get } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Firebase Storage
import Loading from "./waiting1"; // Import the Loading component
import logoutTune from "../assest/intro_music.mp3"; // Import the MP3 file

const RegisterPage = () => {
  const navigate = useNavigate(); // For navigation after successful registration
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    Roll_no: "",
    password: "",
    number: "",
    branch: "",
    semester: "",
    profilePhoto: null, // New field for profile photo
  });

  const [errors, setErrors] = useState({}); // For form validation
  const [showSecondSection, setShowSecondSection] = useState(false); // To toggle sections
  const [isTransitioning, setIsTransitioning] = useState(false); // For animation state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [previewImage, setPreviewImage] = useState(null); // For profile image preview
  const [showPassword, setShowPassword] = useState(false); // For password visibility

  const handleChange = (e) => {
    if (e.target.name === "profilePhoto") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        profilePhoto: file, // Handle profile photo upload
      });

      // Create a preview of the selected image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Password validation function
  const isValidPassword = (password) => {
    return (
      password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
    );
  };

  // Phone number validation function
  const isValidPhoneNumber = (number) => {
    return /^\d{10}$/.test(number);
  };

  const validateFirstSection = () => {
    let formErrors = {};
    if (!formData.name) formErrors.name = "Name is required";
    if (!formData.surname) formErrors.surname = "Surname is required";

    if (!formData.number) {
      formErrors.number = "Phone number is required";
    } else if (!isValidPhoneNumber(formData.number)) {
      formErrors.number = "Phone number must be exactly 10 digits";
    }

    if (!formData.password) {
      formErrors.password = "Password is required";
    } else if (!isValidPassword(formData.password)) {
      formErrors.password =
        "Password must be at least 6 characters and include both letters and numbers";
    }

    return formErrors;
  };

  const validateForm = () => {
    let formErrors = validateFirstSection();

    if (!formData.Roll_no) {
      formErrors.Roll_no = "Roll number is required";
    } else if (!/^\d{7}$/.test(formData.Roll_no)) {
      formErrors.Roll_no = "Roll number must be exactly 7 digits";
    }

    if (!formData.branch) formErrors.branch = "Branch is required";
    if (!formData.semester) formErrors.semester = "Semester is required";

    return formErrors;
  };

  const isRollNoUnique = async (rollNo) => {
    const db = getDatabase(app);
    const rollNoRef = ref(db, `students/${rollNo}`);
    const snapshot = await get(rollNoRef);
    return !snapshot.exists(); // Returns true if Roll_no is unique, false otherwise
  };

  const handleContinue = () => {
    const validationErrors = validateFirstSection();
    if (Object.keys(validationErrors).length === 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowSecondSection(true);
        setIsTransitioning(false);
      }, 500); // Duration of animation
    } else {
      setErrors(validationErrors);
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowSecondSection(false);
      setIsTransitioning(false);
    }, 500);
  };

  const registerUserInDatabase = async () => {
    const db = getDatabase(app);
    const storage = getStorage(app);

    const userId = formData.Roll_no;
    let profilePhotoURL = "";

    if (formData.profilePhoto) {
      const photoRef = storageRef(storage, `profilePhotos/${userId}`);
      await uploadBytes(photoRef, formData.profilePhoto); // Upload the photo
      profilePhotoURL = await getDownloadURL(photoRef); // Get the URL of the uploaded photo
    }

    await set(ref(db, `students/${userId}`), {
      name: formData.name,
      surname: formData.surname,
      Roll_no: formData.Roll_no,
      password: formData.password,
      number: formData.number,
      branch: formData.branch,
      semester: formData.semester,
      profilePhotoURL, // Store the profile photo URL
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true); // Show loading screen

      const audio = new Audio(logoutTune); // Play the MP3 audio
      audio.loop = true; // Loop the audio until process finishes
      audio.preload = "auto"; // Preload the audio for instant playback

      try {
        audio.play(); // Play the sound
        const isUnique = await isRollNoUnique(formData.Roll_no);
        if (!isUnique) {
          setErrors({ Roll_no: "This Roll number is already in use." });
          setIsLoading(false); // Hide loading screen
          audio.pause();
          return;
        }

        await registerUserInDatabase(); // Register the user in the database
        localStorage.setItem("studentName", formData.name);
        localStorage.setItem("authToken", "yourAuthTokenHere"); // Simulating login token
        localStorage.setItem("isRegistered", "true"); // Mark user as registered
        localStorage.setItem("studentRoll_no", formData.Roll_no);

        audio.pause(); // Stop the audio when registration is successful
        navigate("/"); // Navigate to the dashboard after successful registration
      } catch (error) {
        console.error("Error during registration:", error);
        setErrors({ submit: "Registration failed. Please try again." });
      } finally {
        audio.pause(); // Stop the audio regardless of success or failure
        setIsLoading(false); // Hide loading screen
      }
    } else {
      setErrors(validationErrors); // Show validation errors
    }
  };

  return (
    <div className="register-container">
      {/* Conditionally render the Loading component */}
      {isLoading && <Loading message="Creating your account, please wait..." />}

      <div className="register-card">
        <h2 className="register-title">Student Registration</h2>
        <div className="progress-indicator">
          <div
            className={`step ${!showSecondSection ? "active" : "completed"}`}
          >
            <span className="step-number">1</span>
            <span className="step-text">Personal Info</span>
          </div>
          <div className="progress-line"></div>
          <div className={`step ${showSecondSection ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-text">Academic Details</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`register-form1 ${isTransitioning ? "transition" : ""}`}
        >
          {!showSecondSection ? (
            <div className="form-section first-section">
              <div className="form-group1">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>
              <div className="form-group1">
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Enter your surname"
                  className={errors.surname ? "input-error" : ""}
                />
                {errors.surname && (
                  <span className="error">{errors.surname}</span>
                )}
              </div>
              <div className="form-group1">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="Enter your 10-digit phone number"
                  className={errors.number ? "input-error" : ""}
                />
                {errors.number && (
                  <span className="error">{errors.number}</span>
                )}
              </div>
              <div className="form-group1">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters with letters & numbers"
                    className={errors.password ? "input-error" : ""}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </span>
                </div>
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={handleContinue}
                  >
                    Continue <i className="arrow-icon">→</i>
                  </button>
                </div>
              </div>

              <div className="login-redirect">
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="form-section second-section">
              <div className="form-group1">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="Roll_no"
                  value={formData.Roll_no}
                  onChange={handleChange}
                  placeholder="Enter your 7-digit Roll Number"
                  className={errors.Roll_no ? "input-error" : ""}
                />
                {errors.Roll_no && (
                  <span className="error">{errors.Roll_no}</span>
                )}
              </div>
              <div className="form-group1">
                <label>Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={errors.branch ? "input-error" : ""}
                >
                  <option value="">Select your branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                </select>
                {errors.branch && (
                  <span className="error">{errors.branch}</span>
                )}
              </div>
              <div className="form-group1">
                <label>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={errors.semester ? "input-error" : ""}
                >
                  <option value="">Select your semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
                {errors.semester && (
                  <span className="error">{errors.semester}</span>
                )}
              </div>
              <div className="form-group1 profile-upload">
                <label>Profile Photo</label>
                <div className="upload-container">
                  <div className="preview-container">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="profile-preview"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        <i className="upload-icon">📷</i>
                      </div>
                    )}
                  </div>
                  <div className="upload-button-container">
                    <label className="custom-file-upload">
                      <input
                        type="file"
                        name="profilePhoto"
                        onChange={handleChange}
                        accept="image/*"
                      />
                      Choose Photo
                    </label>
                    <span className="file-hint">
                      JPEG, PNG or JPG (max. 5MB)
                    </span>
                  </div>
                </div>
              </div>

              {errors.submit && (
                <span className="error submit-error">{errors.submit}</span>
              )}

              <div className="form-actions two-buttons">
                <button type="button" className="btn-back" onClick={handleBack}>
                  <i className="arrow-icon back">←</i> Back
                </button>
                <button type="submit" className="btn-register">
                  Create Account
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
