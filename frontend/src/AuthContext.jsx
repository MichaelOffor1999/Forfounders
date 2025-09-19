import {useState, createContext, useContext, useEffect, useMemo} from "react"
import apiRequest from "./api";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("idle");

    

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token){
            setStatus("guest");
            return;
        }

        (async () => {
            setStatus("loading");
            try{
                const res = await apiRequest("/auth/me");
                setUser(res);
                setStatus("authed");

            }catch(e) {
                console.error("Auth failed", e);
                localStorage.removeItem("token");
                setUser(null);
                setStatus("guest");
            }

        })();
    }, []);

    const logout = () => {
        localStorage.romoveItem("token");
        setUser(null);
        setStatus("guest");
    };

    const refresh = () => {
        try{
            const res = apiRequest("/auth/me");
            setUser(res);
            setStatus("authed");
        }catch(e) {
            logout();
        }  
    };

    const value = useMemo(()=> ({user, setUser, status, logout, refresh}), [user, status]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)