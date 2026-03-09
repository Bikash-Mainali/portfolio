import {useState, useEffect} from 'react'

const roles = [
    'Full Stack Software Engineer',
    'Java Engineer',
    'Angular Developer',
    'React Developer',
    'Sailpoint Supporter',
    'Database Designer',
    'PL/SQL Developer',
    'AI/ML Enthusiast',
]

export default function Home() {
    const [roleIndex, setRoleIndex] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [typing, setTyping] = useState(true)

    useEffect(() => {
        const target = roles[roleIndex]
        let timeout

        if (typing) {
            if (displayed.length < target.length) {
                timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80)
            } else {
                timeout = setTimeout(() => setTyping(false), 2000)
            }
        } else {
            if (displayed.length > 0) {
                timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40)
            } else {
                setRoleIndex((roleIndex + 1) % roles.length)
                setTyping(true)
            }
        }
        return () => clearTimeout(timeout)
    }, [displayed, typing, roleIndex])

    return (
        <section id="home" className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-34 sm:pt-32 md:pt-40 lg:pt-52">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* LEFT: text */}
                <div className="flex-1 max-w-xl">
                    <p className="font-mono text-primary text-lg mb-5 animate-fade-up"
                       style={{animationDelay: '0.1s', opacity: 0}}>
                        Hi there, I'm
                    </p>

                    <h1
                        className="font-display text-6xl md:text-7xl font-bold text-navy-900 dark:text-white-dim  leading-none mb-4 animate-fade-up"
                        style={{animationDelay: '0.2s', opacity: 0}}
                    >
                        Bikash<br/>
                        <span className="text-gradient">Mainali</span>
                    </h1>

                    <div
                        className="font-mono text-xl md:text-2xl mb-8 h-9 animate-fade-up dark:text-white-dim text-navy-900"
                        style={{animationDelay: '0.35s', opacity: 0}}
                    >
                        {displayed}<span className="dark:text-white-dim text-navy-900">|</span>
                    </div>

                    <p
                        className="font-body text-stone-700 dark:text-slate-300 text-lg leading-relaxed mb-10 animate-fade-up"
                        style={{animationDelay: '0.5s', opacity: 0}}
                    >
                        Full-stack engineer with <span
                        className="text-accent font-medium">8+ years&nbsp;</span>
                        building scalable, high-performance solutions across healthcare, ad-tech, banking, and
                        e-commerce. Passionate about designing robust systems, bridging frontend and backend
                        technologies, and delivering software that drives business impact. Always excited to solve
                        complex problems and innovate. </p>

                    <div className="flex flex-wrap gap-4 animate-fade-up"
                         style={{animationDelay: '0.65s', opacity: 0}}>
                        <a href="#portfolio" className="btn-primary">View My Work →</a>
                        <a href="#contact" className="btn-outline">Get In Touch</a>
                    </div>

                    <div className="flex flex-wrap gap-8 mt-14 lg:justify-start justify-center animate-fade-up"
                         style={{animationDelay: '0.8s', opacity: 0}}>
                        {[
                            {value: '8+', label: 'Years Experience'},
                            {value: '10+', label: 'Projects Shipped'},
                            {value: '4', label: 'Companies'},
                        ].map(s => (
                            <div key={s.label}>
                                <div
                                    className="font-display text-3xl font-bold text-gradient-accent">{s.value}</div>
                                <div
                                    className="font-mono text-xs text-slate mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: profile image */}
                <div
                    className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 flex-shrink-0 animate-fade-up"
                    style={{ animationDelay: "0.4s", opacity: 0 }}
                >
                    <div className="relative group">

                        {/* glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-weak via-primary-weak to-primary-weak opacity-60 group-hover:opacity-90 blur-sm transition-all duration-500 animate-pulse-slow"></div>

                        {/* brackets */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-primary-weak rounded-tl-lg"></div>
                        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-primary-weak rounded-br-lg"></div>

                        {/* image */}
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-lg overflow-hidden border border-primary-weak">
                            <img
                                src="/profile.jpg"
                                alt="Bikash Mainali"
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-dim to-transparent pointer-events-none rounded-lg"></div>
                        </div>

                        {/* Floating badge */}
                        <div
                            className="absolute -bottom-2 -left-8 card-glass  rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-amber-600/20 dark:shadow-black/40 d">

                                <span
                                    className="w-3 h-3 rounded-full bg-red-600 animate-pulse [animation-duration:0.5s]"></span>

                            <span
                                className="font-mono text-xs tracking-wider dark:text-primary text-white  decoration-accent decoration-2 underline-offset-4">Available for remote-work</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
