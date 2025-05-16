import { Routes, Route, Navigate } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AuthLayout from "./routes/AuthLayout"
import TaskBoard from "./pages/TaskBoard"
import Navigation from "./component/Navigation"
import AdminUsers from "./pages/AdminUsers"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthLayout />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
