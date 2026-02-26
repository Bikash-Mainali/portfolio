import {useState} from 'react'
import {useInView} from '../hooks/useInView'
import {
    Github,
    ExternalLink
} from "../icons";
const projects = [
    {
        id: 1,
        title: 'Creative Brows Website',
        category: 'Web',
        description: 'Professional beauty services website with booking functionality and gallery. Built with modern web technologies and responsive design.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'],
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        links: {
            'external': {
                link: 'https://creativebrows.com/',
                label: 'Live',
                icon: <ExternalLink className="h-4 w-4"/>
            },
        }
    },
    {
        id: 2,
        title: 'Personal Portfolio v1',
        category: 'Web',
        description: 'First iteration of personal portfolio site from scratch HTML, JavaScript and CSS — bikashmainali.com.np — showcasing projects, skills and professional journey.',
        tags: ['HTML', 'CSS', 'Bootstrap', 'jQuery'],
        img: '/portfolio-site-v1.png',
        links: {
            'external': {
                link: 'https://bikash-mainali.github.io/bm/',
                label: 'Live',
                icon: <ExternalLink className="h-4 w-4"/>
            },
            'github': {
                link: 'https://github.com/Bikash-Mainali/portfolio-v1',
                label: 'Github',
                icon: <Github className="h-4 w-4"/>
            }
        }
    },
    {
        id: 3,
        title: 'Music App — Express & JS',
        category: 'Web',
        description: 'Full-featured music streaming application built with Node.js, Express, and vanilla JavaScript. Includes playback controls, playlists, and search.',
        tags: ['Node.js', 'Express', 'JavaScript', 'MongoDB'],
        img: '/music-app.png',
        links: {
            'github': {
                link: 'https://github.com/Bikash-Mainali/Music-APP-Express-JavaScript',
                label: 'Github',
                icon: <Github className="h-4 w-4"/>
            }
        }
    },
    {
        id: 4,
        title: 'Enterprise Banking Platform',
        category: 'App',
        description: 'Large-scale enterprise banking application with microservice architecture. Features real-time transaction processing and secure authentication.',
        tags: ['Java', 'Spring Boot', 'Oracle', 'Angular'],
        img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80',
    },
    {
        id: 5,
        title: 'Namaste Lekhapadhi',
        category: 'Web',
        description: 'Real State Website built with React, TypeScript, Vite and Tailwind CSS. It features a modern design, responsive layout, and interactive UI components.',
        tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
        img: '/namaste-lekhapadhi-site.png',
        links: {
            'live': {
                link: 'https://bikash-mainali.github.io/namaste-lekhapadhi/#/',
                label: 'Live',
                icon: <ExternalLink className="h-4 w-4"/>
            },
            'github': {
                link: 'https://github.com/Bikash-Mainali/namaste-lekhapadhi',
                label: 'GitHub',
                icon: <Github className="h-4 w-4"/>
            }

        }
    },
    {
        id: 6,
        title: 'Is It AI? — DeepFake Detection Mobile App',
        category: 'App',
        description: 'Mobile app that detects deepfake image using a Python Lambda function for analysis and AWS S3 for storage. Built with React Native and TypeScript.',
        tags: ['ReactNative', 'TypeScript', 'Python Lambda function', 'AWS S3'],
        img: '/deepfake-detector.png',
        links: {
            'live': {
                link: 'https://apps.apple.com/us/app/isitai/id6758316655',
                label: 'Live',
                icon: <ExternalLink className="h-4 w-4"/>
            }

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
            <div className="relative max-w-7xl mx-auto px-6">
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
                                    {project.links && Object.entries(project.links).map(([key, value]) => (
                                        <a
                                            href={value.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm font-mono text-teal-400 hover:text-teal-300 transition-colors"
                                        >
                                            <>
                                                <span>{value.icon}</span>{value.label}
                                            </>
                                        </a>
                                        )
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
