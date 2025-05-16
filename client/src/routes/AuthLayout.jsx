import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navigation from "../component/Navigation";

const AuthLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" />;

    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
};

export default AuthLayout;
