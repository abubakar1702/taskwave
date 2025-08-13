import React, { useEffect, useState } from "react";
import ProjectCard from "../components/project/ProjectCard";
import ProjectFilter from "../components/project/ProjectFilter";
import { FaPlus } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const accessToken =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("accessToken") ||
          sessionStorage.getItem("authToken");

        if (!accessToken) {
          throw new Error("No authentication token found");
        }

        const endpoint =
          activeTab === "Created by me"
            ? `${API_BASE_URL}/api/projects/?created_by_me=true`
            : `${API_BASE_URL}/api/projects/`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeTab]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#2563EB" size={50} />
      </div>
    );

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">Error: {error}</p>
        {error.includes("Authentication") && (
          <p className="mt-2">
            <a href="/login" className="text-blue-600 underline">
              Please login to continue
            </a>
          </p>
        )}
      </div>
    );
  }

  const filteredProjects = projects;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Projects{" "}
              {!loading && (
                <span className="text-gray-400">
                  ({filteredProjects.length})
                </span>
              )}
            </h1>
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Project <FaPlus className="inline-block ml-1" />
            </button>
          </div>
        </div>

        <ProjectFilter activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
