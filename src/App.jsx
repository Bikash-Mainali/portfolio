import Navbar from './components/Navbar'
import Home from './components/Home.jsx'
import About from './components/About'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/shared/Footer.jsx'

export default function App() {
    return (
        <>
            <Navbar/>
            <main>
                <Home/>
                <About/>
                <Skills/>
                <Experience/>
                <Projects/>
                <Contact/>
            </main>
            <Footer />
        </>
    )
}
