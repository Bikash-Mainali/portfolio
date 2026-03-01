import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router";
import App from './App.jsx'
import './index.css'
import PostEditor from "./components/PostEditor.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFound from "./components/NotFound.jsx";
import Blogs from "./components/Blogs.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<App/>}/>
                <Route path="/home" element={<App/>}/>
                <Route path="*" element={<NotFound/>}/>
                <Route path="/blogs" element={<Blogs/>}/>
                <Route path="/admin/*" element={
                    <ProtectedRoute>
                        <AdminLayout/>
                    </ProtectedRoute>
                }
                >
                    <Route path="post-editor" element={<PostEditor/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
