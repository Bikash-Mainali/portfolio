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
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-5"
            onClick={closeModal}
        >
            <div
                className="bg-white dark:bg-navy-900 border border-stone-300 dark:border-gray-600 rounded-xl p-8 w-full max-w-md shadow-2xl dark:shadow-[1px_1px_20px_16px_#404342]"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Login</h2>
                    <button
                        onClick={closeModal}
                        className="text-stone-600 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white text-3xl"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userCredentials.email}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 bg-stone-50 dark:bg-navy-950 border border-stone-300 dark:border-gray-600 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:border-amber-600 dark:focus:border-teal-400 transition-colors"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium text-stone-700 dark:text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={userCredentials.password}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 bg-stone-50 dark:bg-navy-950 border border-stone-300 dark:border-gray-600 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:border-amber-600 dark:focus:border-teal-400 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white py-3 font-medium rounded-lg transition-colors mt-6"
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
