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
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background orbs */}
            <div className="orb w-96 h-96 bg-teal-500/8 top-20 -left-40" style={{animationDelay: '0s'}}></div>
            <div className="orb w-72 h-72 bg-gold/6 bottom-20 -right-20" style={{animationDelay: '3s'}}></div>

            {/* Dot grid */}
            <div className="absolute inset-0 dot-grid opacity-30"></div>

            <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* LEFT: text */}
                    <div className="flex-1 max-w-xl">
                        <p className="font-mono text-teal-400 text-lg mb-5 animate-fade-up"
                           style={{animationDelay: '0.1s', opacity: 0}}>
                            Hi there, I'm
                        </p>

                        <h1
                            className="font-display text-6xl md:text-7xl font-bold text-white leading-none mb-4 animate-fade-up"
                            style={{animationDelay: '0.2s', opacity: 0}}
                        >
                            Bikash<br/>
                            <span className="text-gradient">Mainali</span>
                        </h1>

                        <div
                            className="font-mono text-xl md:text-2xl text-slate-400 mb-8 h-9 animate-fade-up"
                            style={{animationDelay: '0.35s', opacity: 0}}
                        >
                            {displayed}<span className="typed-cursor">|</span>
                        </div>

                        <p
                            className="font-body text-slate-400 text-lg leading-relaxed mb-10 animate-fade-up"
                            style={{animationDelay: '0.5s', opacity: 0}}
                        >
                            Full-stack engineer with <span
                            className="text-teal-400 font-medium">8+ years</span>
                          Full Stack Software Engineer building scalable, high-performance solutions across healthcare, ad-tech, banking, and e-commerce. Passionate about designing robust systems, bridging frontend and backend technologies, and delivering software that drives business impact. Always excited to solve complex problems and innovate.                        </p>

                        <div className="flex flex-wrap gap-4 animate-fade-up"
                             style={{animationDelay: '0.65s', opacity: 0}}>
                            <a href="#portfolio" className="btn-primary">View My Work →</a>
                            <a href="#contact" className="btn-outline">Get In Touch</a>
                        </div>

                        <div className="flex flex-wrap gap-10 mt-14 animate-fade-up"
                             style={{animationDelay: '0.8s', opacity: 0}}>
                            {[
                                {value: '8+', label: 'Years Experience'},
                                {value: '10+', label: 'Projects Shipped'},
                                {value: '4', label: 'Companies'},
                            ].map(s => (
                                <div key={s.label}>
                                    <div className="font-display text-3xl font-bold text-gradient-gold">{s.value}</div>
                                    <div className="font-mono text-xs text-slate-500 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: profile image */}
                    <div className="flex-shrink-0 animate-fade-up" style={{animationDelay: '0.4s', opacity: 0}}>
                        <div className="relative group">

                            {/* Animated glow ring */}
                            <div
                                className="absolute -inset-1 bg-gradient-to-br from-teal-400 via-teal-600 to-gold opacity-60 blur-md group-hover:opacity-90 transition-all duration-500 animate-pulse-slow"></div>

                            {/* Corner brackets decoration */}
                            <div
                                className="absolute -top-5 -left-5 w-9 h-9 border-t-2 border-l-2 border-teal-400/60 rounded-tl-lg pointer-events-none"></div>
                            <div
                                className="absolute -bottom-5 -right-5 w-9 h-9 border-b-2 border-r-2 border-gold/60 rounded-br-lg pointer-events-none"></div>

                            {/* Image circle */}
                            <div
                                className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-lg overflow-hidden border-2 border-teal-400/30 ">
                                <img
                                    src="/profile.jpg"
                                    alt="Bikash Mainali"
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-navy-950/30 to-transparent pointer-events-none rounded-lg"></div>
                            </div>

                            {/* Floating badge */}
                            <div
                                className="absolute -bottom-2 -left-8 card-glass rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-black/40">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                <span className="font-mono text-xs text-slate-300">Available for co-operation</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
