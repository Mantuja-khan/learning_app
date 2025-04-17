import React, { useState } from 'react';
import './login.css'; // Importing CSS for styling
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for redirection
import { app } from './firebase'; // Firebase app configuration
import { getDatabase, ref, get, child } from 'firebase/database'; // Firebase database methods
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'; // Firebase storage methods
import { Eye, EyeOff, Lock, User, BookOpen, FileText, GraduationCap, Book } from 'lucide-react'; // Import icons

const Login = () => {
    const navigate = useNavigate(); // Initialize the navigate function
    const [Roll_no, setRoll_no] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [success, setSuccess] = useState(false); // Success state
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    // Roll_no validation function
    const isValidRoll_no = (Roll_no) => {
        return /\S/.test(Roll_no);
    };

    // Fetch user data from Firebase by Roll_no
    const fetchUserData = async (Roll_no) => {
        const dbRef = ref(getDatabase(app)); // Get the database reference
        try {
            const Roll_noKey = Roll_no;
            const snapshot = await get(child(dbRef, `students/${Roll_noKey}`));

            if (snapshot.exists()) {
                return snapshot.val(); // Return the user data if found
            } else {
                return null; // Return null if no user data exists
            }
        } catch (error) {
            setError('Error fetching user data.');
            console.error('Error fetching data:', error);
            return null;
        }
    };

    // Fetch profile photo URL from Firebase Storage
    const fetchProfilePhoto = async (Roll_no) => {
        const storage = getStorage(app);
        const Roll_noKey = Roll_no;
        try {
            const profilePhotoRef = storageRef(storage, `profilePhotos/${Roll_noKey}`);
            const url = await getDownloadURL(profilePhotoRef);
            return url;
        } catch (error) {
            console.error('Error fetching profile photo:', error);
            return null;
        }
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset any previous errors
        setError('');
        setSuccess(false);

        // Basic validation for empty fields
        if (Roll_no === '' || password === '') {
            setError('Both fields are required.');
            return;
        }

        // Roll_no validation
        if (!isValidRoll_no(Roll_no)) {
            setError('Please enter a valid Roll number.');
            return;
        }

        // Simulating a login process
        setLoading(true);

        // Fetch the user data from Firebase
        const userData = await fetchUserData(Roll_no);

        setLoading(false); // Stop loading after the Firebase query completes

        if (userData) {
            // Check if the password matches
            if (password === userData.password) {
                // Fetch profile photo
                const profilePhotoURL = await fetchProfilePhoto(Roll_no);
                localStorage.setItem('authToken', 'example_token'); 
                localStorage.setItem('studentName', userData.name);
                localStorage.setItem('studentRoll_no', Roll_no);
                localStorage.setItem('profilePhotoURL', profilePhotoURL || '');

                setSuccess(true);
                setError('');

                navigate('/'); 
            } else {
                setError('Invalid Roll number or password.');
            }
        } else {
            setError('Invalid Roll number or password.');
        }
    };

    // Navigate to register page
    const goToRegister = () => {
        navigate('/register');
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='login_main_container'>
            {/* Study material decorative elements */}
            <div className="study-elements">
                <div className="study-element book">
                    <BookOpen size={24} />
                    <span>Digital Library</span>
                </div>
                <div className="study-element notes">
                    <FileText size={24} />
                    <span>Class Notes</span>
                </div>
                <div className="study-element course">
                    <GraduationCap size={24} />
                    <span>Courses</span>
                </div>
                <div className="study-element assignment">
                    <Book size={24} />
                    <span>Assignments</span>
                </div>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h2>Student Login</h2>
                    <p className="form-subtitle">Welcome back! Enter your credentials to access your account</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Login successful!</p>}

                <div className={`form-group ${error ? 'input-error' : ''}`}>
                    <label htmlFor="roll_no">Roll Number</label>
                    <div className="input-container">
                        <User size={18} className="input-icon" />
                        <input
                            id="roll_no"
                            type="text"
                            value={Roll_no}
                            onChange={(e) => setRoll_no(e.target.value)}
                            placeholder="Enter your Roll number"
                            required
                        />
                    </div>
                </div>

                <div className={`form-group ${error ? 'input-error' : ''}`}>
                    <label htmlFor="password">Password</label>
                    <div className="input-container">
                        <Lock size={18} className="input-icon" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-options">
                    
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <div className="divider">
                    <span>OR</span>
                </div>
                
                <button type="button" className="register-btn" onClick={goToRegister}>
                    Create New Account
                </button>
            </form>
        </div>
    );
};

export default Login;