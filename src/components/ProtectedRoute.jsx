import { Navigate } from 'react-router'

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('access_token')

    if (!token) {
        return <Navigate to="/home" replace />
    }

    return children
}
