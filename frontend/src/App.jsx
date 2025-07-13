import "./App.css";
import LoginPage from "./pages/LoginPage";
import RecommendationPage from "./pages/RecommendationPage";
import SelectedLecturerPage from "./pages/SelectedLecturerPage";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [student, setStudent] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <LoginPage
                onLogin={(studentData) => {
                  setIsLoggedIn(true);
                  setStudent(studentData);
                }}
              />
            ) : (
              <RecommendationPage student={student} />
            )
          }
        />
        <Route
          path="/selected-lecturer"
          element={<SelectedLecturerPage student={student} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
