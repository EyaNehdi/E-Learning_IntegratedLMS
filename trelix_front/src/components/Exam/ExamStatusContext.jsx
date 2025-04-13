import React, { createContext, useContext, useState } from "react";

// Create the context
const ExamStatusContext = createContext();

// Provider component
export const ExamStatusProvider = ({ children }) => {
  const [hasPassedExam, setHasPassedExam] = useState(false);

  return (
    <ExamStatusContext.Provider value={{ hasPassedExam, setHasPassedExam }}>
      {children}
    </ExamStatusContext.Provider>
  );
};

// Custom hook
export const useExamStatus = () => useContext(ExamStatusContext);
