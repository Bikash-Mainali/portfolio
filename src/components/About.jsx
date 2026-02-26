import {useInView} from '../hooks/useInView'
import {
    Github,
    Linkedin,
    Facebook,
    Instagram,
    Mail,
    MapPinned,
    Phone
} from "../icons";
const stacks = {
    'Languages & Frameworks': [
        'Java', 'Spring Boot', 'Groovy / Grails',
        'Node.js / Express', 'Python FAST API', 'TypeScript', 'JavaScript (ES6+)',
        'Angular', 'React', 'HTML · CSS · Sass · Bootstrap', 'Tailwind CSS', 'OAuth2 / OpenID Connect'
    ],
    'DevOps & Cloud': [
        'AWS Cloud', 'Docker', 'Kubernetes',
        'CI/CD (Jenkins, Spinnaker)', 'SonarQube', 'Grafana', 'Prometheus', 'ELK Stack', 'Splunk', 'Zipkin'
    ],
    'Databases': [
        'Oracle', 'MySQL', 'PostgreSQL', 'PL/SQL',
        'MongoDB', 'IBM Db2', 'Cassandra', 'Redis',
    ],
    'Testing & Tools': [
        'Cucumber', 'JUnit, TestNG, Mockito', 'TestContainer', 'Jest, Playwright, Selenium', 'Bruno', 'Swagger', 'Git/GitHub',
        'Maven, Gradle', 'Vite', 'IntelliJ IDEA', 'VS Code'
    ],
    'Messaging Queue': [
        'Kafka', 'RabbitMQ', 'ActiveMQ'
    ],
    'AI/ML': [
        'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Agentic AI', 'Streamlit', 'LLM', 'Zapier'
    ]
}

export default function About() {
    const [ref, visible] = useInView()

    return (
        <section id="about" ref={ref} className="py-28 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="section-title">About Me</h2>
                    <div className="section-line"></div>
                </div>

                <div className="grid lg:grid-cols-5 gap-16 mt-6">
                    {/* Text */}
                    <div
                        className={`lg:col-span-3 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="space-y-4 text-slate-400 leading-relaxed text-[15px]">
                            <p>
                                Hello! I'm <span className="text-teal-400 font-medium">Bikash Mainali</span>, a Full
                                Stack Software Engineer with 8+ years of experience building enterprise-grade systems
                                across
                                healthcare, Apple’s ad-tech platform, banking, and e-commerce.
                            </p>
                            <p>
                                I specialize in designing scalable, high-performance applications using <span
                                className="text-white/80">Java (Spring
                                Boot), Node.js, Python FAST API, React, Angular, TypeScript, Postgres, MongoDB, and
                              Microservices architectures </span>. My
                                experience spans backend system design, cloud-native deployments, and crafting
                                intuitive, pixel-perfect frontend experiences.
                            </p>
                            <p>
                                Recently, I’ve been expanding my focus into <span className="text-white/80">AI/ML-driven systems, exploring how
                                intelligent automation, data modeling, agentic AI and AI-powered features can enhance
                                enterprise
                              applications </span>. I’m particularly interested in building software that integrates
                                machine
                                learning, predictive systems, and intelligent workflows into real-world products.
                            </p>
                            <p>
                                I thrive in Agile environments, collaborate effectively with cross-functional teams, and
                                enjoy solving complex engineering problems with clean, scalable architecture.
                            </p>
                            <p>
                                My goal: Build intelligent, scalable systems that combine strong engineering
                                fundamentals with modern AI capabilities.
                            </p>
                        </div>

                        {/* Tech stacks */}
                        <div className="mt-10 space-y-6">
                            {Object.entries(stacks).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="font-mono text-xs text-gold mb-3 uppercase tracking-widest">{category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map(item => (
                                            <span key={item} className="tag">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Photo & socials */}
                    <div
                        className={`lg:col-span-2 flex flex-col items-center lg:items-start gap-6 transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <div className="relative group">
                            {/* Decorative frame */}
                            <div
                                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-teal-400/40 to-gold/30 blur-sm group-hover:blur-md transition-all duration-300"></div>
                            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-teal-400/20">
                                <img
                                    src="/profile1.jpg"
                                    alt="Bikash Mainali"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=Bikash+Mainali&background=0e1d47&color=2dd4bf&size=256&font-size=0.4`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                {
                                    label: 'LinkedIn',
                                    href: 'https://www.linkedin.com/in/bikash-mainali-629505168/',
                                    icon: <Github/>
                                },
                                {label: 'GitHub', href: 'https://github.com/Bikash-Mainali', icon: <Linkedin/>},
                                {label: 'Facebook', href: 'https://www.facebook.com/biki51', icon: <Facebook/>},
                                {
                                    label: 'Instagram',
                                    href: 'https://www.instagram.com/mainalibiki/',
                                    icon: <Instagram/>
                                },
                            ].map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 card-glass rounded-full text-sm text-slate-300 hover:text-teal-400 hover:border-teal-400/30 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <span>{s.icon}</span>
                                    <span className="font-mono text-xs">{s.label}</span>
                                </a>
                            ))}
                        </div>

                        {/* Contact info box */}
                        <div className="card-glass rounded-xl p-5 w-full space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="text-teal-400"><MapPinned/></span>
                                <span>CA, USA</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="text-teal-400"><Mail/></span>
                                <a href="mailto:bikashmainali18@gmail.com"
                                   className="hover:text-teal-400 transition-colors">
                                    bikashmainali18@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
