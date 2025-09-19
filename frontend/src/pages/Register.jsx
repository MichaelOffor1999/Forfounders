import { useState } from "react";
import { replace, useNavigate } from "react-router-dom";
import apiRequest from "../api";

export function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // Fixed initial state to false
    const [msg, setMsg] = useState("");

    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        setMsg("");

        // Validate all fields are filled
        if (!name || !email || !password) {
            setMsg("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const res = await apiRequest("/register", {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
            });
            setMsg(res.msg);

            // Store the temporary token in localStorage
            if (res.token) {
                localStorage.setItem("token", res.token);
                // After registering, send user to onboarding to complete their profile
                navigate("/onboarding", { replace: true });
            }
        } catch (e) {
            setMsg(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">Create your account</h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your full name"
                            type="text"
                            className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
                            required
                        />
                    </div>

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
                            placeholder="Choose a password"
                            type="password"
                            className="w-full px-6 py-3 rounded-3xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0b3d91]/8 focus:border-[#0b3d91] transition-all duration-200"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full py-3 px-6 bg-[#0b3d91] text-white font-semibold rounded-3xl shadow-md hover:shadow-lg transition-all duration-150" disabled={loading}>
                        {loading ? "Registering..." : "Create account"}
                    </button>
                </form>

                {msg && (
                    <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-blue-700 text-sm">{msg}</p>
                    </div>
                )}

                <p className="mt-6 text-sm text-gray-600">Already have an account? <a href="/login" className="text-[#0b3d91] hover:underline">Sign in</a></p>
            </div>
        </div>
    );
}