import React, { useState } from 'react';
import { getDatabase, ref as databaseRef, get } from 'firebase/database';
import { app } from './firebase';
import './notes.css';

const Notes = () => {
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const branches = ['CSE', 'Mechanical', 'Civil', 'ECE'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleSemesterChange = async (e) => {
    const selectedSem = e.target.value;
    setSemester(selectedSem);
    setSelectedSubject('');
    setResources([]);

    if (!branch || !selectedSem) return;

    setLoading(true);
    const database = getDatabase(app);
    const notesRef = databaseRef(database, `notes/${branch}/semester_${selectedSem}`);

    try {
      const snapshot = await get(notesRef);
      if (snapshot.exists()) {
        setSubjects(Object.keys(snapshot.val()));
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (subject) => {
    setSelectedSubject(subject);
    setResources([]);
    setLoading(true);

    const database = getDatabase(app);
    const subjectRef = databaseRef(database, `notes/${branch}/semester_${semester}/${subject}`);

    try {
      const snapshot = await get(subjectRef);
      if (snapshot.exists()) {
        setResources(Object.values(snapshot.val()));
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='main_note_page'>
      
      <div className="container">
        <h1 className="h1">Select Notes & Videos</h1>

        {/* Form Controls */}
        <div className="form-group">
          <label htmlFor="branchSelect">Select Branch:</label>
          <select id="branchSelect" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Select Branch</option>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="semesterSelect">Select Semester:</label>
          <select id="semesterSelect" value={semester} onChange={handleSemesterChange} disabled={!branch}>
            <option value="">Select Semester</option>
            {semesters.map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
          </select>
        </div>

        {/* Two-column layout for subjects and resources */}
        {subjects.length > 0 && (
          <div className="content-wrapper">
            {/* Left side - Subject list */}
            <div className="subject-list">
              <h2>Select a Subject:</h2>
              {loading && <p>Loading subjects...</p>}
              <ul>
                {subjects.map(subject => (
                  <li key={subject}>
                    <button 
                      className={`subject-btn ${selectedSubject === subject ? 'active' : ''}`} 
                      onClick={() => fetchResources(subject)}
                    >
                      {subject}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side - Resources */}
            <div className="resources">
              <h2>{selectedSubject ? `Resources for ${selectedSubject}:` : 'Select a subject to view resources'}</h2>
              {loading ? (
                <p>Loading resources...</p>
              ) : selectedSubject ? (
                resources.length > 0 ? (
                  <ul>
                    {resources.map((res, index) => (
                      <li key={index}>
                        <div className="resource-item">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className='url'>
                            {res.title || `Resource ${index + 1}`}
                            <span>({res.type === 'pdf' ? 'PDF' : 'Video'})</span>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No resources available for this subject.</p>
                )
              ) : (
                <p>Select a subject from the left to view available resources.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;