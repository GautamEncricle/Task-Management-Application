import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom';

//context
const AuthContext = createContext();

//Auth provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async (req, res) => {
            try {
                const res = await axios.get('/protect/testing');
                setUser(res.data.user);
            }
            catch (error) {
                setUser(null);
                console.error(`Error occurred 💥: ${error}`);
            }
            finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    //logout handler
    const logout = async () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

//custom hook for easy to use
export const useAuth = () => useContext(AuthContext);