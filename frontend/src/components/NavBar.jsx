import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <nav className="bg-blue-600 text-white py-4 shadow-md rounded-b-lg">
            <div className="container mx-auto flex justify-between items-center px-4">
                <div className="text-lg font-bold">
                    For <span style={{ color: '#f26522' }}>Founders</span>
                </div>
                <ul className="flex space-x-6">
                    <li>
                        <Link to="/dashboard" className="px-3 py-2 rounded transition-colors duration-200 hover:bg-blue-700 hover:text-white">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/discover" className="px-3 py-2 rounded transition-colors duration-200 hover:bg-blue-700 hover:text-white">Find Founders</Link>
                    </li>
                    <li>
                        <Link to="/wave-requests" className="px-3 py-2 rounded transition-colors duration-200 hover:bg-blue-700 hover:text-white">Wave Requests</Link>
                    </li>
                    <li>
                        <Link to="/messages" className="px-3 py-2 rounded transition-colors duration-200 hover:bg-blue-700 hover:text-white">Messages</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
