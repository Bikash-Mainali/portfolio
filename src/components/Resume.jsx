import { useInView } from '../hooks/useInView'

const experiences = [
  {
    title: 'Java Engineer',
    company: 'Apple Inc.',
    location: 'Cupertino, CA',
    period: '2022 – 2023',
    type: 'Full-time',
    bullets: ['Requirement analysis & feature design for ad-platform services', 'Back-end development using Java & Spring Boot microservices', 'Technical documentation and code reviews'],
    tags: ['Java', 'Spring Boot', 'Microservices', 'AWS'],
  },
  {
    title: 'Software Engineer (Full Stack)',
    company: 'Deerwalk Services',
    location: 'Kathmandu, Nepal',
    period: '2021',
    type: 'Full-time',
    bullets: ['Full-stack development for healthcare analytics platform', 'Mentorship of junior engineers', 'Agile/Scrum sprint planning and execution'],
    tags: ['Java', 'Angular', 'PostgreSQL', 'Docker'],
  },
  {
    title: 'Java Web Developer (Full Stack)',
    company: 'Datum Systems Pvt Ltd',
    location: 'Kathmandu, Nepal',
    period: '2020 – 2021',
    type: 'Full-time',
    bullets: ['Built and maintained full-stack web applications', 'Database design and PL/SQL stored procedures', 'Technical documentation'],
    tags: ['Java', 'Spring', 'Oracle', 'PL/SQL'],
  },
  {
    title: 'Web Developer (Java Full Stack)',
    company: 'Ishani Technology Pvt Ltd',
    location: 'Kathmandu, Nepal',
    period: '2017 – 2020',
    type: 'Full-time',
    bullets: ['Full-stack development for banking and e-commerce systems', 'Front-end development with jQuery and Bootstrap', 'Report writing and stakeholder communication'],
    tags: ['Java', 'jQuery', 'MySQL', 'Bootstrap'],
  },
]

const education = [
  {
    degree: "Master's in Computer Science",
    school: 'Maharishi International University',
    period: '2021 – 2023',
    detail: 'GPA: 3.8',
  },
  {
    degree: 'Bachelor of Engineering in IT',
    school: 'Cosmos College of Management & Technology',
    period: '2013 – 2017',
    detail: 'GPA: 3.64 (84.2%)',
  },
]

export default function Resume() {
  const [ref, visible] = useInView()

  return (
    <section id="resume" ref={ref} className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="section-title">Experience</h2>
          <div className="section-line"></div>
        </div>

        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <a
            href="/assets/pdf/resume.pdf"
            target="_blank"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 16v-8M8 12l4 4 4-4M5 20h14"/>
            </svg>
            Download Resume
          </a>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Experience timeline */}
          <div className="lg:col-span-2 relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-teal-400/50 via-teal-400/20 to-transparent"></div>

            <div className="space-y-10">
              {experiences.map((exp, i) => (
                <div
                  key={i}
                  className="relative pl-12 transition-all duration-500"
                  style={{
                    transitionDelay: `${i * 120}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                  }}
                >
                  {/* Dot */}
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-navy-950 ring-2 ring-teal-400/30"></div>

                  <div className="card-glass rounded-2xl p-6 hover:border-teal-400/20 transition-all duration-200">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-semibold text-white text-lg">{exp.title}</h3>
                      <span className="font-mono text-xs text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full">{exp.period}</span>
                    </div>
                    <p className="font-mono text-sm text-gold mb-4">{exp.company} · {exp.location}</p>
                    <ul className="space-y-1.5 mb-4">
                      {exp.bullets.map(b => (
                        <li key={b} className="flex items-start gap-2 text-slate-400 text-sm">
                          <span className="text-teal-400 mt-0.5 shrink-0">▹</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map(t => (
                        <span key={t} className="tag text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education sidebar */}
          <div
            className="transition-all duration-700 delay-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <h3 className="font-display text-xl text-white font-semibold mb-6 flex items-center gap-2">
              <span className="text-teal-400">🎓</span> Education
            </h3>
            <div className="space-y-5">
              {education.map((edu, i) => (
                <div key={i} className="card-glass rounded-xl p-5 border-l-2 border-gold/50">
                  <h4 className="font-body font-medium text-white text-sm mb-1">{edu.degree}</h4>
                  <p className="font-mono text-xs text-gold mb-2">{edu.school}</p>
                  <p className="font-mono text-xs text-slate-500">{edu.period}</p>
                  <p className="font-mono text-xs text-teal-400 mt-1">{edu.detail}</p>
                </div>
              ))}
            </div>

            {/* Facts */}
            <h3 className="font-display text-xl text-white font-semibold mt-10 mb-6 flex items-center gap-2">
              <span className="text-teal-400">📊</span> At a Glance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '7', label: 'Projects' },
                { num: '8+', label: 'Years Exp.' },
                { num: '1', label: 'In Progress' },
                { num: '3', label: 'Companies' },
              ].map(f => (
                <div key={f.label} className="card-glass rounded-xl p-4 text-center">
                  <div className="font-display text-2xl font-bold text-gradient">{f.num}</div>
                  <div className="font-mono text-xs text-slate-500 mt-1">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
