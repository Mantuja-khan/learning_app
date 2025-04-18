import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { app } from './firebase';
import "./profile.css";
import logoutTune from '../assest/intro_music.mp3';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [user, setUser] = useState({
    name: "",
    Roll_no: "",
    phone_no: "",
    branch: "",
    surname: "",
    password: "",
    semester: "",
    profilePhotoURL: ""
  });
  const [newProfilePhoto, setNewProfilePhoto] = useState(null);

  // Fetch user data from Firebase when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getDatabase(app);
        const storage = getStorage(app);
        
        const userRoll_no = localStorage.getItem('studentRoll_no');
        const userId = userRoll_no;

        if (!userId) {
          navigate('/login');
          return;
        }

        const userRef = ref(db, `students/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          setUser({
            name: userData.name || "",
            Roll_no: userData.Roll_no || "",
            phone_no: userData.number || "",
            branch: userData.branch || "",
            surname: userData.surname || "",
            password: userData.password || "",
            semester: userData.semester || "",
            profilePhotoURL: userData.profilePhotoURL || ""
          });

          if (userData.profilePhotoURL) {
            try {
              const photoURL = await getDownloadURL(storageRef(storage, userData.profilePhotoURL));
              setUser(prevState => ({ ...prevState, profilePhotoURL: photoURL }));
            } catch (error) {
              console.error("Error fetching profile photo:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    if (e.target.name === "profilePhoto") {
      setNewProfilePhoto(e.target.files[0]);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const db = getDatabase(app);
      const storage = getStorage(app);
      const userRoll_no = localStorage.getItem('studentRoll_no');
      const userId = userRoll_no;

      let profilePhotoURL = user.profilePhotoURL;
      if (newProfilePhoto) {
        const photoRef = storageRef(storage, `profilePhotos/${userId}`);
        await uploadBytes(photoRef, newProfilePhoto);
        profilePhotoURL = await getDownloadURL(photoRef);
        
        // Update local storage with new profile photo URL
        localStorage.setItem('profilePhotoURL', profilePhotoURL);
      }

      await update(ref(db, `students/${userId}`), {
        name: user.name,
        surname: user.surname,
        number: user.phone_no,
        branch: user.branch,
        semester: user.semester,
        password: user.password,
        profilePhotoURL
      });

      // Update the user state with the new photo URL
      setUser(prevState => ({ ...prevState, profilePhotoURL }));
      
      // Show success popup instead of alert
      setShowSuccessPopup(true);
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
        setIsEditing(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    const audio = new Audio(logoutTune);
    audio.preload = 'auto';
    audio.play();

    setIsWaiting(true);

    // Show loading animation for 1 second
    setTimeout(() => {
      setIsWaiting(false);
      // Show success logout popup
      setShowLogoutSuccess(true);
      
      // After 2 seconds of showing success, redirect to login
      setTimeout(() => {
        localStorage.clear();
        navigate('/login');
      }, 2000);
    }, 1000);
  };

  const handleDashboard = () => {
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="custom-loading">
          <div className="circle-pulse"></div>
          <div className="circle-pulse"></div>
          <div className="circle-pulse"></div>
        </div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="main_profile_page">
      {isWaiting && (
        <div className="logout-overlay">
          <div className="logout-message">
            <div className="custom-loading">
              <div className="circle-pulse"></div>
              <div className="circle-pulse"></div>
              <div className="circle-pulse"></div>
            </div>
            <p>Logging out...</p>
          </div>
        </div>
      )}
      
      {isUpdating && (
        <div className="updating-overlay">
          <div className="updating-message">
            <div className="custom-loading">
              <div className="circle-pulse"></div>
              <div className="circle-pulse"></div>
              <div className="circle-pulse"></div>
            </div>
            <p>Updating your profile...</p>
          </div>
        </div>
      )}
      
      {showLogoutSuccess && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h3>Successfully Logged Out!</h3>
            <p>Thank you for using our platform.</p>
          </div>
        </div>
      )}
      
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h3>Profile Updated!</h3>
            <p>Your changes have been saved successfully.</p>
          </div>
        </div>
      )}
      
      <div className="profile-content-wrapper">
        {/* Simplified Navbar */}
        <div className="profile-navbar">
          
          <div className="navbar-links">
            <div className="nav-link" onClick={handleDashboard}>Dashboard</div>
          </div>
          <div className="navbar-actions">
            <button className="logout-nav-button" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
        
        <div className="profile-container1">
          <h1 className="profile-page-title">My Profile</h1>
          
          <div className="profile-details1">
            <div className="profile-info1">
              <div className="profile-photo-container">
                <img
                  src={user.profilePhotoURL || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="profile-picture1"
                />
                {isEditing && (
                  <div className="upload-overlay">
                    <label htmlFor="profile-upload" className="upload-label">
                      <span className="camera-icon">📷</span>
                    </label>
                    <input 
                      id="profile-upload"
                      type="file" 
                      name="profilePhoto" 
                      onChange={handleChange}
                      className="file-input" 
                    />
                  </div>
                )}
              </div>
              
              <div className="user-identity">
                <h2 className="user-name">{user.name} {user.surname}</h2>
                <p className="user-roll">{user.Roll_no}</p>
              </div>
              
              <button
                className={`edit-btn1 ${isEditing ? 'save-mode' : ''}`}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>

            <div className="profile-card">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-fields1">
                <div className="field-row1">
                  <div className="field1">
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <p className="field-value">{user.name || "Not specified"}</p>
                    )}
                  </div>
                  <div className="field1">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="surname"
                        value={user.surname}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <p className="field-value">{user.surname || "Not specified"}</p>
                    )}
                  </div>
                </div>

                <div className="field-row1">
                  <div className="field1">
                    <label>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone_no"
                        value={user.phone_no}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <p className="field-value">{user.phone_no || "Not specified"}</p>
                    )}
                  </div>
                  <div className="field1">
                    <label>Password</label>
                    {isEditing ? (
                      <div className="password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={user.password}
                          onChange={handleChange}
                          className="profile-input"
                        />
                        <span 
                          className="password-toggle" 
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
                        </span>
                      </div>
                    ) : (
                      <p className="field-value">••••••••</p>
                    )}
                  </div>
                </div>

                <div className="field-row1">
                  <div className="field1">
                    <label>Branch</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="branch"
                        value={user.branch}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <p className="field-value">{user.branch || "Not specified"}</p>
                    )}
                  </div>
                  <div className="field1">
                    <label>Semester</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="semester"
                        value={user.semester}
                        onChange={handleChange}
                        className="profile-input"
                      />
                    ) : (
                      <p className="field-value">{user.semester || "Not specified"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;