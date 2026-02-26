import Navbar from './components/Navbar'
import Home from './components/Home.jsx'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience.jsx'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Home />
        <About />
        <Skills />
        <Experience />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
