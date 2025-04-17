import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import './ResultPage.css'

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const {
    totalQuestions,
    score,
    incorrectAnswers,
    questions,
    userAnswers,
  } = location.state || {};

  useEffect(() => {
    const percentage = totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0;

    // Animate progress bar
    const timer = setTimeout(() => {
      setProgressPercentage(percentage);
    }, 800);

    return () => clearTimeout(timer);
  }, [score, totalQuestions]);

  // Redirect if no data is available
  if (!questions || !userAnswers) {
    return (
      <div className="results-error-container">
        <div className="results-error-message">
          <h2>Error: Quiz data is unavailable</h2>
          <p>Please retry the quiz</p>
          <button onClick={() => navigate("/")} className="results-home-btn">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const pieData = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [score, incorrectAnswers.length],
        backgroundColor: ["#4caf50", "#f44336"],
        hoverBackgroundColor: ["#45a049", "#e53935"],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage < 33) {
      return "You failed. Don't give up, keep practicing!";
    } else if (percentage >= 33 && percentage < 50) {
      return "Good job! You need more improvement in your learning skills.";
    } else if (percentage >= 50 && percentage < 75) {
      return "Nice understanding of topics! Keep doing well.";
    } else if (percentage >= 75 && percentage < 100) {
      return "Great job! You have an awesome understanding mindset, keep it up!";
    } else if (percentage === 100) {
      return "Outstanding! You aced the quiz! Perfect score!";
    }
  };

  const suggestions = incorrectAnswers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return {
      question: question ? question.question : "Not Available",
      correctAnswer: question ? question.answer : "Not Available",
      yourAnswer: answer.yourAnswer || "Not Attempted",
      explanation: question
        ? question.explanation
        : "Review this topic to improve your understanding.",
      topic: question ? question.topic : "Unknown Topic",
      isIncorrect: true, // Mark as incorrect
    };
  });

  const handleRetakeQuiz = () => {
    navigate("/"); // Navigate to the QuizPanel page
  };

  // Determine the performance level class name
  const getPerformanceLevelClass = (percentage) => {
    if (percentage < 33) return "results-performance-poor";
    if (percentage < 50) return "results-performance-fair";
    if (percentage < 75) return "results-performance-good";
    if (percentage < 100) return "results-performance-excellent";
    return "results-performance-perfect";
  };

  return (
    <div className="results-container">
      <div className="results-card">
        <div className="results-header">
          <h2>Quiz Results</h2>
          <div className="results-fireworks"></div>
        </div>
        
        <div className="results-summary-card">
          <h3>Summary</h3>
          <div className="results-stats">
            <div className="results-stat-item results-total">
              <span className="results-stat-label">Total Questions:</span>
              <span className="results-stat-value">{totalQuestions}</span>
            </div>
            <div className="results-stat-item results-correct">
              <span className="results-stat-label">Correct Answers:</span>
              <span className="results-stat-value">{score}</span>
            </div>
            <div className="results-stat-item results-incorrect">
              <span className="results-stat-label">Incorrect Answers:</span>
              <span className="results-stat-value">{incorrectAnswers.length}</span>
            </div>
          </div>
          
          <div className="results-chart-container">
            <Pie data={pieData} options={pieOptions} />
          </div>
          
          <h3>Overall Performance</h3>
          <div className="results-progress-container">
            <div
              className={`results-progress-bar ${getPerformanceLevelClass(progressPercentage)}`}
              style={{ width: `${progressPercentage}%` }}
            >
              <span className="results-progress-percentage">{progressPercentage}%</span>
            </div>
          </div>
          
          <p className="results-performance-message">
            {getPerformanceMessage(progressPercentage)}
          </p>
        </div>

        <div className="results-suggestions-section">
          <h3>Improvement Areas</h3>
          {suggestions.length > 0 ? (
            <div className="results-suggestions-list">
              {suggestions.map((item, index) => (
                <div key={index} className="results-suggestion-item">
                  <div className="results-suggestion-header">
                    <span className="results-suggestion-tag">Incorrect</span>
                    <span className="results-suggestion-topic">{item.topic}</span>
                  </div>
                  
                  <div className="results-suggestion-content">
                    <div className="results-suggestion-question">
                      <strong>Question:</strong> {item.question}
                    </div>
                    
                    <div className="results-suggestion-answers">
                      <div className="results-your-answer">
                        <strong>Your Answer:</strong> 
                        <span className="results-answer-wrong">{item.yourAnswer}</span>
                      </div>
                      
                      <div className="results-correct-answer">
                        <strong>Correct Answer:</strong>
                        <span className="results-answer-right">{item.correctAnswer}</span>
                      </div>
                    </div>
                    
                    <div className="results-suggestion-explanation">
                      <strong>Explanation:</strong> {item.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="results-perfect-score">
              <div className="results-trophy-icon">🏆</div>
              <p>Congratulations! You got everything correct!</p>
            </div>
          )}
        </div>

        <button onClick={handleRetakeQuiz} className="results-home-btn">
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

export default ResultPage;