import {useState} from 'react'
import {useInView} from '../hooks/useInView'
import {ExternalLink, Github} from 'lucide-react'

const projects = [
    {
        id: 1,
        title: 'Creative Brows Website',
        category: 'Web',
        description: 'Professional beauty services website with booking functionality and gallery. Built with modern web technologies and responsive design.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        links: {link: 'https://creativebrows.com/', label: 'Live Site', icon: <ExternalLink className="h-4 w-4"/>}
    },
    {
        id: 2,
        title: 'Personal Portfolio v1',
        category: 'Web',
        description: 'First iteration of personal portfolio site from scratch HTML, JavaScript and CSS — bikashmainali.com.np — showcasing projects, skills and professional journey.',
        tags: ['HTML', 'CSS', 'Bootstrap', 'jQuery'],
        img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80',
        links: {link: 'https://bikash-mainali.github.io/bm/', label: 'GitHub', icon: <Github className="h-4 w-4"/>}
    },
    {
        id: 3,
        title: 'Music App — Express & JS',
        category: 'App',
        description: 'Full-featured music streaming application built with Node.js, Express, and vanilla JavaScript. Includes playback controls, playlists, and search.',
        tags: ['Node.js', 'Express', 'JavaScript', 'MongoDB'],
        img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
        links: {
            link: 'https://github.com/Bikash-Mainali/Music-APP-Express-JavaScript',
            label: 'GitHub',
            icon: <Github className="h-4 w-4"/>
        }
    },
    {
        id: 4,
        title: 'Enterprise Banking Platform',
        category: 'App',
        description: 'Large-scale enterprise banking application with microservice architecture. Features real-time transaction processing and secure authentication.',
        tags: ['Java', 'Spring Boot', 'Oracle', 'Angular'],
        img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
        links: {
            link: 'https://github.com/Bikash-Mainali/Music-APP-Express-JavaScript',
            label: 'Live Site',
            icon: <ExternalLink className="h-4 w-4"/>
        }
    },
]

const filters = ['All', 'Web', 'App']

export default function Portfolio() {
    const [active, setActive] = useState('All')
    const [ref, visible] = useInView()

    const filtered = active === 'All' ? projects : projects.filter(p => p.category === active)

    return (
        <section id="portfolio" ref={ref} className="py-28 bg-navy-900/50 relative">
            <div className="absolute inset-0 dot-grid opacity-15"></div>
            <div className="relative max-w-6xl mx-auto px-6">
                <div
                    className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="section-title">Projects</h2>
                    <div className="section-line"></div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-10">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActive(f)}
                            className={`font-mono text-sm px-5 py-2 rounded-full transition-all duration-200 ${
                                active === f
                                    ? 'bg-teal-500 text-navy-950 font-medium'
                                    : 'text-slate-400 border border-white/10 hover:border-teal-400/30 hover:text-teal-400'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {filtered.map((project, i) => (
                        <div
                            key={project.id}
                            className="group card-glass rounded-2xl overflow-hidden hover:border-teal-400/25 hover:glow-teal transition-all duration-300"
                            style={{
                                transitionDelay: `${i * 100}ms`,
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                            }}
                        >
                            {/* Image */}
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={project.img}
                                    alt={project.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent opacity-60"></div>
                                <span
                                    className="absolute top-3 right-3 font-mono text-xs px-3 py-1 rounded-full bg-navy-950/70 text-teal-400 border border-teal-400/30 backdrop-blur-sm">
                  {project.category}
                </span>
                            </div>

                            <div className="p-6">
                                <h3 className="font-display font-bold text-white text-xl mb-2">{project.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-4">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {project.tags.map(t => (
                                        <span key={t} className="tag">{t}</span>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    {project.links && (
                                        <a
                                            href={project.links.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm font-mono text-teal-400 hover:text-teal-300 transition-colors"
                                        >
                                            <>
                                                <span>{project.links.icon}</span>{project.links.label}
                                            </>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
