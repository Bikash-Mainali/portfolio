import {Loader} from "../icons/index.jsx";
import {authenticateUser} from "../util/auth.js";
import {useState} from "react";
import {Navigate, useNavigate} from "react-router";

export default function Login({displayLoginModal}) {
    const [userCredentials, setUserCredentials] = useState({email: '', password: ''})
    const navigate = useNavigate();
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const handleOnChange = (e) => {
        setUserCredentials({...userCredentials, [e.target.name]: e.target.value})
    }

    function closeModal() {
        displayLoginModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        const {email, password} = userCredentials
        setLoading(true);
        const isAuthenticated = await authenticateUser(email, password)
        if (!isAuthenticated) {
            setError('Invalid email or password')
            return
        }
        setLoading(false)
        navigate('/admin/post-editor', {replace: true});
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
             onClick={closeModal}
        >
            <div className="bg-navy-900 border border-white/10 rounded-xl p-8 w-full max-w-md shadow-2xl"
                 onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Login</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white text-3xl"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userCredentials.email}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={userCredentials.password}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-teal-400 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 font-medium rounded-lg transition-colors mt-6"
                    >
                        {
                            loading && error == null ? (
                                <div className="flex items-center justify-center">
                                    <Loader size={25}/>
                                    <span className="ml-2">Authenticating...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )
                        }
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>
        </div>
    )
}