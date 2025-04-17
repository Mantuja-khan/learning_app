import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { Search, Calendar } from "lucide-react";
import QuestionPaperCard from "./QuestionPaperCard";
import "./QuestionPaperList.css";

const QuestionPaperList = () => {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [questionPapers, setQuestionPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const database = getDatabase();
    const papersRef = ref(database, "questionPapers");

    // Fetch data from Firebase Realtime Database
    const unsubscribe = onValue(papersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const papersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setQuestionPapers(papersArray);
      } else {
        setQuestionPapers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply search and filter
  useEffect(() => {
    const results = questionPapers.filter((paper) =>
      paper.title.toLowerCase().includes(search.toLowerCase()) &&
      (year === "" || paper.year === year)
    );
    setFilteredPapers(results);
  }, [search, year, questionPapers]);

  return (
    <div className="question-paper-list">
      <div className="search-filter-container">
        <div className="search-input">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by title or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="year-select">
          <Calendar className="calendar-icon" size={18} />
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>

      <div className="results-count">
        {filteredPapers.length} {filteredPapers.length === 1 ? 'paper' : 'papers'} found
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading question papers...</p>
        </div>
      ) : (
        <div className="scrollable-content">
          <div className="paper-grid">
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => (
                <QuestionPaperCard key={paper.id} paper={paper} />
              ))
            ) : (
              <div className="no-results">
                <p>No results found for your search.</p>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperList;