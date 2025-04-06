import React, { useState, useCallback } from 'react';
import './dashboard_page.css';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as databaseRef, push, get } from 'firebase/database';
import { app } from './firebase';
import Loading from './waiting1';

const DashboardPage = () => {
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const branches = {
    'CSE': ['Physics', 'Into to C', 'BEE', 'Engineering mathematics 1','Engineering mathematics 2','Chemistry','MEFA','M.E.','Environmental Eng.','DSA','C++','S.E.','Linux','AEM','D.E.','Python','Java','Discrete Mathematics','TOC','MPI','CC','DMW','DS','COA','ML','CN','OS','CD','DIP','NLP','ISS','IOT','AOA','GAI','Disaster Management','Deep Learning'],
    'Mechanical': ['Thermodynamics', 'Fluid Mechanics'],
    'Civil': ['Structural Engineering', 'Geotechnical Engineering'],
    'ECE': ['Circuit Theory', 'Electromagnetics'],
  };

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) {
      if (droppedFiles[0].type === 'application/pdf') {
        setFile(droppedFiles[0]);
      } else if (droppedFiles[0].type.startsWith('video/')) {
        setVideoFile(droppedFiles[0]);
      }
      setMessage('');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(branch && semester && subject && (file || videoFile || youtubeURL))) {
      setMessage('Please select branch, semester, subject, and upload a file or provide a YouTube link.');
      return;
    }

    setIsLoading(true);

    try {
      const storage = getStorage(app);
      const database = getDatabase(app);
      const notesRef = databaseRef(database, `notes/${branch}/semester_${semester}/${subject}`);

      const fileUploadPromises = [];

      if (file) {
        const fileRef = storageRef(storage, `notes/${branch}/semester_${semester}/${subject}/${file.name}`);
        fileUploadPromises.push(uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef)).then(downloadURL => {
          return push(notesRef, { name: file.name, url: downloadURL, type: 'pdf', timestamp: Date.now() });
        }));
      }

      if (videoFile) {
        const videoRef = storageRef(storage, `videos/${branch}/semester_${semester}/${subject}/${videoFile.name}`);
        fileUploadPromises.push(uploadBytes(videoRef, videoFile).then(() => getDownloadURL(videoRef)).then(downloadURL => {
          return push(notesRef, { name: videoFile.name, url: downloadURL, type: 'video', timestamp: Date.now() });
        }));
      }

      if (youtubeURL) {
        fileUploadPromises.push(push(notesRef, { name: `${subject}`, url: youtubeURL, type: 'youtube', timestamp: Date.now() }));
      }

      await Promise.all(fileUploadPromises);
      setMessage('Notes and videos uploaded successfully!');
      setBranch('');
      setSemester('');
      setSubject('');
      setFile(null);
      setVideoFile(null);
      setYoutubeURL('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container1">
      {isLoading && <Loading message="Uploading, please wait..." />}
      <h2 className="up">Upload Notes and Videos</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Branch:</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Select Branch</option>
            {Object.keys(branches).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Semester:</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!branch}>
            <option value="">Select Semester</option>
            {semesters.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Subject:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!branch || !semester}>
            <option value="">Select Subject</option>
            {branch && branches[branch].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Upload Notes (PDF only):</label>
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Upload Video (MP4/MKV/AVI):</label>
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Upload YouTube Video URL:</label>
          <input type="url" placeholder="Enter YouTube video URL" value={youtubeURL} onChange={(e) => setYoutubeURL(e.target.value)} />
        </div>

        <button type="submit" className="upload-btn">Upload</button>
      </form>
    </div>
  );
};

export default DashboardPage;
