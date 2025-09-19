import { useAuth } from "../AuthContext" 
import { Link } from "react-router-dom"
import NavBar from "../components/NavBar"
import { useEffect, useState } from "react";
import apiRequest from "../api";

export function Dashboard() {
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [links, setLinks] = useState([{ key: "", value: "" }]);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await apiRequest("/me");
                console.log("Fetched user:", response.user);
                setUser(response.user);
            } catch (err) {
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await apiRequest("/projects");
                setUser((prevUser) => ({
                    ...prevUser,
                    projects: response.projects,
                }));
            } catch (err) {
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    const toggleFormVisibility = () => {
        setShowForm((prev) => !prev);
    };

    const handleAddLink = () => {
        if (links.length < 5) {
            setLinks([...links, { key: "", value: "" }]);
        } else {
            alert("You can only add up to 5 links.");
        }
    };

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...links];
        updatedLinks[index][field] = value;
        setLinks(updatedLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const formData = {
            title: e.target.title.value,
            description: e.target.description.value,
            role: e.target.role.value,
            image: e.target.image.value,
            links: links.reduce((acc, link) => {
                if (link.key && link.value) {
                    acc[link.key] = link.value;
                }
                return acc;
            }, {}),
        };

        // Validate required fields
        if (!formData.title || !formData.description || !formData.role) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate unique keys in links
        const keys = links.map(link => link.key);
        if (new Set(keys).size !== keys.length) {
            alert("Duplicate keys are not allowed in links.");
            return;
        }

        // Validate URL format in links
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
        for (const link of links) {
            if (link.value && !urlPattern.test(link.value)) {
                alert(`Invalid URL format for link: ${link.key}`);
                return;
            }
        }

        try {
            const response = await apiRequest("/projects", {
                method: "POST",
                body: JSON.stringify(formData)
            });
            console.log("Project added successfully:", response);
            alert("Project added successfully!");
        } catch (error) {
            console.error("Error adding project:", error);
            alert("Failed to add project. Please try again.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <NavBar />
            <div className="container mx-auto mt-8 p-4">
                <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-6">
                    <img 
                        src={user.profile_picture || "https://via.placeholder.com/150"} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user.name || "Your Name"}</h1>
                        <p className="text-gray-600 mt-2">{user.bio || "Add a bio to tell others about yourself."}</p>
                        <p className="text-gray-600 mt-2">{user.specialization || "Specialization not provided."}</p>
                        <div className="mt-4">
                            <a 
                                href={user.links?.linkedin || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline"
                            >
                                LinkedIn
                            </a>
                            <span className="mx-2">|</span>
                            <a 
                                href={user.links?.github || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-500 hover:underline"
                            >
                                GitHub
                            </a>
                        </div>

                        {/* Badges Section */}
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Badges</h2>
                            <div className="flex space-x-4">
                                {user.badges?.early_adopter && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-white font-bold text-lg">EU</span>
                                        </div>
                                        <span className="text-gray-700 text-sm mt-2">Early User</span>
                                    </div>
                                )}
                                {user.badges?.connector && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-md">
                                            <span className="text-white font-bold text-lg">C</span>
                                        </div>
                                        <span className="text-gray-700 text-sm mt-2">Connector</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Projects</h2>
                    <button
                        onClick={toggleFormVisibility}
                        className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 mb-4"
                    >
                        {showForm ? "Cancel" : "Add Project"}
                    </button>

                    {showForm && (
                        <form className="bg-white shadow-md rounded-lg p-6 space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Project Title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Description</label>
                                <textarea
                                    name="description"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Project Description"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Your role in the project"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Image (Optional)</label>
                                <input
                                    type="text"
                                    name="image"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Image URL"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Links</label>
                                {links.map((link, index) => (
                                    <div key={index} className="flex space-x-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Name (e.g., GitHub)"
                                            value={link.key}
                                            onChange={(e) => handleLinkChange(index, "key", e.target.value)}
                                            className="w-1/2 border border-gray-300 rounded-lg p-2"
                                            required
                                        />
                                        <input
                                            type="url"
                                            placeholder="Link (e.g., https://github.com)"
                                            value={link.value}
                                            onChange={(e) => handleLinkChange(index, "value", e.target.value)}
                                            className="w-1/2 border border-gray-300 rounded-lg p-2"
                                            required
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddLink}
                                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600"
                                >
                                    Add Link
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="bg-green-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-600"
                            >
                                Submit
                            </button>
                        </form>
                    )}

                    {user.projects && user.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.projects.map((project, index) => (
                                <div key={index} className="bg-white shadow-md rounded-lg p-4">
                                    <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                                    <p className="text-gray-600 mt-2">{project.description}</p>
                                    <div className="mt-4">
                                        <span className="text-sm font-semibold text-gray-700">Role:</span> {project.role}
                                    </div>
                                    <div className="mt-4">
                                        {Object.entries(project.links).map(([key, value]) => (
                                            <a
                                                key={key}
                                                href={value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline block"
                                            >
                                                {key}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (                      
                        <p className="text-gray-600">No projects to display. Add your first project!</p>
                    )}
                </div>
            </div>
        </div>
    );
}