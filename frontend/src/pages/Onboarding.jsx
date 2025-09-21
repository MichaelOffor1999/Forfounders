// src/pages/Onboarding.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../api.js"; 

const steps = [
  "Purpose for Joining",
  "Tags & Skills",
  "Looking For",
  "Bio, Interests & Specialization"
];

const suggestedTags = ["AI", "Frontend", "Backend", "Design", "Marketing", "Data Science", "Mobile", "Web", "Cloud", "DevOps"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    course: "",
    campus: "",
    tags: [],
    bio: "",
    interests: "",
    specialization: "",
    profile_picture: "",
    purpose: "",
    current_project: "",
    lookingFor: [] // New field added
  });
  const [currentTag, setCurrentTag] = useState(""); // New state for raw input

  // Progress bar calculation
  const progress = ((step + 1) / steps.length) * 100;

  // Simple form for each step (expand as needed)
  // Validation logic for each step
  const validateStep = () => {
    switch (step) {
      case 0:
        if (!profile.purpose) return "Purpose for joining is required.";
        break;
      case 1:
        if (profile.tags.length === 0) return "Please select or add at least one tag.";
        break;
      case 2: // Validation for the new step
        if (!profile.lookingFor || profile.lookingFor.length === 0) return "Please select at least one option.";
        break;
      case 3:
        if (!profile.bio.trim()) return "Bio is required.";
        if (!profile.specialization.trim()) return "Specialization is required.";
        break;
      default:
        break;
    }
    return "";
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Why are you joining the platform?</label>
              <select
                value={profile.purpose || ""}
                onChange={e => setProfile({ ...profile, purpose: e.target.value })}
                className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200 mb-4 appearance-none"
              >
                <option value="" disabled>Select your purpose</option>
                <option value="find_collaborators">I have a project and want to find collaborators</option>
                <option value="meet_people">I want to meet like-minded people and explore ideas</option>
                <option value="learn">I’m here to learn and get inspired</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Do you have a project? (Optional)</label>
              <textarea
                placeholder="Tell us about your project (if any)"
                value={profile.current_project}
                onChange={e => setProfile({ ...profile, current_project: e.target.value })}
                className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
              />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="mb-4">
              <div className="font-semibold mb-2">Suggested Tags:</div>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`px-3 py-1 rounded-full border ${profile.tags.includes(tag) ? "bg-[#0b3d91] text-white" : "bg-gray-100 text-gray-700"}`}
                    onClick={() => {
                      setProfile({
                        ...profile,
                        tags: profile.tags.includes(tag)
                          ? profile.tags.filter(t => t !== tag)
                          : [...profile.tags, tag]
                      });
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Add custom tags (comma separated)"
              value={currentTag} // Bind to raw input state
              onChange={e => setCurrentTag(e.target.value)} // Update raw input state
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent default Enter behavior
                  const newTags = currentTag.split(/\s*,\s*/).filter(tag => tag); // Split by commas and trim spaces
                  if (newTags.length > 0) {
                    setProfile({
                      ...profile,
                      tags: [...profile.tags, ...newTags]
                    });
                    setCurrentTag(""); // Clear raw input
                  }
                }
              }}
              className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
            />
            <div className="text-xs text-gray-500 mt-2">You can select from suggested tags above or add your own.</div>
          </>
        );
      case 2:
        return (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-2">What are you looking for?</label>
              <div className="flex flex-wrap gap-2">
                {["Technical Co-Founder", "Business Co-Founder", "Design Co-Founder", "Marketing Co-Founder"].map(option => (
                  <button
                    key={option}
                    type="button"
                    className={`px-3 py-1 rounded-full border ${
                      profile.lookingFor?.includes(option) ? "bg-[#0b3d91] text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => {
                      setProfile({
                        ...profile,
                        lookingFor: profile.lookingFor?.includes(option)
                          ? profile.lookingFor.filter(item => item !== option)
                          : [...(profile.lookingFor || []), option]
                      });
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Select one or more options that describe what you're looking for.</div>
          </>
        );
      case 3:
        return (
          <>
            <div className="mt-4 mb-6"> {/* Added margin-bottom for spacing */}
              <label className="block font-semibold mb-2 text-center">Profile Picture</label>
              <div className="flex flex-col items-center gap-4">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile Preview"
                    className="rounded-full w-32 h-32 object-cover border border-gray-300 shadow-md"
                  />
                ) : (
                  <div className="rounded-full w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm border border-gray-300 shadow-md">
                    No Image
                  </div>
                )}
                <label
                  htmlFor="profilePictureInput"
                  className="cursor-pointer px-4 py-2 bg-[#0b3d91] text-white font-semibold rounded-3xl shadow-md hover:shadow-lg transition-all duration-150"
                >
                  Upload Image
                </label>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfile(prev => ({ ...prev, profile_picture: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>
            <textarea
              placeholder="Bio"
              value={profile.bio}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200 mb-4"
            />
            <input
              type="text"
              placeholder="Specialization"
              value={profile.specialization}
              onChange={e => setProfile({ ...profile, specialization: e.target.value })}
              className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200 mb-4"
            />
            <button
              className="w-full py-3 px-6 bg-[#0b3d91] text-white font-semibold rounded-3xl shadow-md hover:shadow-lg transition-all duration-150 mt-4"
              onClick={handleFinish}
            >
              Finish & Save
            </button>
          </>
        );
      default:
        return <div>All steps complete!</div>;
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError("");
    try {
        const data = await apiRequest("/me", {
            method: "PUT",
            body: JSON.stringify(profile)
        });

        // Replace the temporary token with the new token if provided
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        setSuccess(true);
        setTimeout(() => {
            navigate("/dashboard");
        }, 1200);
    } catch (err) {
        setError("Error saving profile: " + err.message);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-3xl shadow-2xl">
      {success ? (
        <div className="text-green-600 text-lg font-semibold text-center py-12">Onboarding complete! Welcome aboard.</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-xl font-bold mb-4 text-gray-900">{steps[step]}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#0b3d91] h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {renderStep()}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <svg className="animate-spin h-6 w-6 text-[#0b3d91] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span className="text-[#0b3d91]">Submitting...</span>
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-3xl shadow-md hover:shadow-lg transition-all duration-150"
              disabled={step === 0 || loading}
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              Back
            </button>
            {step < steps.length - 1 && (
              <button
                className="py-2 px-4 bg-[#0b3d91] text-white font-semibold rounded-3xl shadow-md hover:shadow-lg transition-all duration-150"
                onClick={() => {
                  const validationError = validateStep();
                  if (validationError) {
                    setError(validationError);
                  } else {
                    setError("");
                    setStep(step + 1);
                  }
                }}
                disabled={loading}
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

<style jsx>{`
  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1.5rem;
  }

  select option {
    background-color: #f3f4f6; /* Light gray background for better contrast */
    color: #0b3d91;
    padding: 10px;
    border-radius: 0.5rem;
  }

  select option:hover {
    background-color: #e5e7eb; /* Slightly darker gray for hover effect */
    color: #0b3d91;
  }
`}</style>