import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./QuizPage.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./ResultPage.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branch, semester, difficulty } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Option labels
  const OPTION_LABELS = ["A", "B", "C", "D"];

  useEffect(() => {
    // Fetch the questions from the backend
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/questions?branch=${encodeURIComponent(
            branch
          )}&semester=${encodeURIComponent(
            semester
          )}&difficulty=${encodeURIComponent(difficulty)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch questions.");
        }

        const data = await response.json();
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching questions.");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [branch, semester, difficulty]);

  useEffect(() => {
    setSelectedOptionIndex(null);
  }, [currentQuestionIndex]);

  const handleAnswerClick = (isCorrect, questionId, selectedOption, index) => {
    // Prevent multiple selections
    if (selectedOptionIndex !== null) return;

    // Set the selected option index
    setSelectedOptionIndex(index);

    // Add answer to user answers
    setUserAnswers((prevAnswers) => [
      ...prevAnswers,
      { questionId, isCorrect, yourAnswer: selectedOption },
    ]);

    // Auto-advance to next question after a short delay to show feedback
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      }
    }, 800);
  };

  const handleFinishQuiz = () => {
    setSubmitting(true);
    
    // Simulate processing time
    setTimeout(() => {
      const totalQuestions = questions.length;
      const attempts = userAnswers.length;
      const score = userAnswers.filter((answer) => answer.isCorrect).length;
      const incorrectAnswers = userAnswers.filter((answer) => !answer.isCorrect);

      // Navigate to the ResultsPage with calculated results
      navigate("/results", {
        state: {
          totalQuestions,
          score,
          attempts,
          incorrectAnswers,
          questions,
          userAnswers,
        },
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading questions... Please wait!</p>
      </div>
    );
  }

 if (submitting) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">
        <p>Calculating your results<span className="loading-dots">...</span></p>
      </div>
    </div>
  );
}

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (questions.length === 0) {
    return <div className="error-message">No questions available for the selected options!</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Determine option button classes and disabled state
  const getOptionButtonClass = (index) => {
    // If no option selected yet
    if (selectedOptionIndex === null) {
      return "option-button";
    }

    // If this is the selected option
    if (index === selectedOptionIndex) {
      // Correct answer
      if (currentQuestion.options[index] === currentQuestion.answer) {
        return "option-button correct";
      }
      // Incorrect answer
      return "option-button incorrect";
    }

    // If this is the correct answer but not selected
    if (currentQuestion.options[index] === currentQuestion.answer) {
      return "option-button correct-answer";
    }

    // Other options when one is selected
    return "option-button disabled";
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="quiz-page-wrapper">
      <div className="quiz-page">
        <div className="quiz-header">
          <h2>Quiz</h2>
          <div className="quiz-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        <div className="question-container">
          <h3 className="question-text">{currentQuestion.question}</h3>
          
          <div className="option-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={getOptionButtonClass(index)}
                onClick={() =>
                  handleAnswerClick(
                    option === currentQuestion.answer,
                    currentQuestion.id,
                    option,
                    index
                  )
                }
                disabled={selectedOptionIndex !== null}
              >
                <span className="option-label">{OPTION_LABELS[index]}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          {isLastQuestion && selectedOptionIndex !== null && (
            <button
              className="finish-button"
              onClick={handleFinishQuiz}
            >
              Finish Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;