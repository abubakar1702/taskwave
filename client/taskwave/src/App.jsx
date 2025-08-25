import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";
import TaskDetail from "./pages/TaskDetail";
import NewTask from "./pages/NewTask";
import ProjectDetails from "./pages/ProjectDetails";
import NewProject from "./pages/NewProject";
import ProjectTasksPage from "./components/project/Project Detail/ProjectTasksPage";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

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
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/project/:id/tasks" element={<ProjectTasksPage />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
