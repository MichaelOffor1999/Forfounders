import {useAuth} from "./AuthContext"
import {Navigate} from "react-router-dom"

export function ProtectedRoute({children}){
    const {status} = useAuth();
    if(status === "loading") {return <div>Loading...</div>};
    if(status === "guest") {return <Navigate to="/login" replace />};

    return children;
}