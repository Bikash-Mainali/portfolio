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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay backdrop-blur-sm p-5"
            onClick={closeModal}
        >
            <div
                className="bg-white dark:bg-navy-900 border border-light dark:border-dark rounded-xl p-8 w-full max-w-md shadow-card-light dark:shadow-card-dark"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-stone-900 dark:text-white">Login</h2>
                    <button
                        onClick={closeModal}
                        className="cursor-pointer text-3xl text-white hover:text-primary"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userCredentials.email}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 border border-light dark:border-dark rounded-lg  focus:outline-none  focus:border-primary transition-colors"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-sm font-medium  mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={userCredentials.password}
                            onChange={handleOnChange}
                            className="w-full px-4 py-2 border border-light dark:border-dark rounded-lg  focus:outline-none  focus:border-primary transition-colors"
                            placeholder="password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full cursor-pointer  bg-primary-weak text-white py-3 font-medium rounded-lg transition-colors mt-6"
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
