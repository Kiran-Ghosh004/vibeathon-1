import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import About from "./pages/About";
import Home from "./pages/Home";
import Chapters from "./pages/Chapters";
import ChapterDetails from "./pages/ChapterDetails";
import ShlokaDetails from "./pages/ShlokaDetails";
import Ai from "./pages/Ai"; // 

function App() {
  return (
    <Routes>
      {/* 🌿 Public Routes (now all accessible by default) */}
      <Route path="/intro" element={<Intro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/" element={<Home />} />
      <Route path="/ai" element={<Ai />} />
      <Route path="/chapters" element={<Chapters />} />
      <Route path="/chapter/:id" element={<ChapterDetails />} />
      <Route
        path="/chapter/:chapterId/shlokas/:verseId"
        element={<ShlokaDetails />}
      />

      {/* 🚪 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
