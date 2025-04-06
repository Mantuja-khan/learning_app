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
      <h1 className="note-title">
        <span>Knowledge</span> <span className="hub">Hub</span>
      </h1>
      <div className="container">
      <h1 className="h1">Select Notes & Videos</h1>

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

      {loading && <p>Loading subjects...</p>}

      {subjects.length > 0 && (
        <div className="subject-list">
          <h2>Select a Subject:</h2>
          <ul>
          {subjects.map(subject => (
            <li>
            <button key={subject} className="subject-btn" onClick={() => fetchResources(subject)}>
              {subject}
            </button>
            </li>
          ))}
          </ul>
        </div>
      )}

      {selectedSubject && (
        <div className="resources">
          <h2>Resources for {selectedSubject}:</h2>
          <ul>
          {loading ? <p>Loading resources...</p> : resources.length > 0 ? (
            resources.map(res => (
              <li>
              <div key={res.url} className="resource-item">
                <a href={res.url} target="_blank" rel="noopener noreferrer" className='url'>
                  <span>({res.type === 'pdf' ? 'PDF' : res.type === 'video' ? 'Video' : 'Video'})</span>
                </a>
              </div>
              </li>
            ))
          ) : (
            <p>No resources available for this subject.</p>
          )}
          </ul>
        </div>
      )}
    </div>
    </div>
  );
};

export default Notes;
