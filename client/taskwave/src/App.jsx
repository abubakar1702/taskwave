import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";
import TaskDetails from "./pages/TaskDetails";
import NewTask from "./pages/NewTask";
import ProjectDetails from "./pages/ProjectDetails";

function App() {

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route path="/" element={<Tasks />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/new-task" element={<NewTask />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
