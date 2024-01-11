'use client';
import { createContext, useState } from "react";
const SurveyContext = createContext(null);
function SurveyProvider({ children }) {
    const [data, setData] = useState([]);
    const [answers, setAnswers] = useState([])
    return (
      <SurveyContext.Provider value={{ data, setData, answers, setAnswers }}>
        {children}
      </SurveyContext.Provider>
    );
}
export {SurveyContext, SurveyProvider}