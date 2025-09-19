import { useState } from "react"
import apiRequest from "../api";
import { useAuth } from "../AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const { refresh } = useAuth();
    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setMsg("");

        let profileRes = null;
        try {
            const data = await apiRequest("/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            await refresh();
            // Fetch user profile to check completion
            profileRes = await apiRequest("/me", {
                method: "GET"
            });
            const user = profileRes.user || {};
            if (user.profile_completed) { //work is needed on the profile
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/onboarding", { replace: true });
            }
        } catch (err) {
            console.error("Error details:", err); // Log the full error object
            let errorMessage = "Invalid credentials. Please try again.";
            if (err.msg) {
                errorMessage = err.msg; // Use the backend message if available
            } else if (profileRes && profileRes.msg) {
                errorMessage = profileRes.msg; // Use the message from the /users/me response
            }
            setMsg(errorMessage);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                            type="email"
                            className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Your password"
                            type="password"
                            className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input type="checkbox" className="h-4 w-4 text-[#0b3d91] rounded focus:ring-2 focus:ring-[#0b3d91]/20" />
                            Remember me
                        </label>

                        <Link to="#" className="text-sm text-[#0b3d91] hover:underline">Forgot password?</Link> {/* Doesn't do anything yet */}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-6 bg-[#0b3d91] text-white font-semibold rounded-3xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-sm text-gray-600">Don’t have an account? <Link to="/register" className="text-[#0b3d91] hover:underline">Create one</Link></div> {/*Dosent do anything yet*/} 

                {msg && (
                    <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-red-700 text-sm">{msg}</p>
                    </div>
                )}
            </div>
        </div>
    );
}