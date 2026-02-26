import { useInView } from '../hooks/useInView'
import {Barchart, GraduationCap} from '../icons';
const experiences = [
  {
    title: 'Senior Software Engineer (Full Stack)',
    company: 'CHG Healthcare',
    location: 'Utah, US',
    period: '07/2024 – Present',
    type: 'Full-time',
    bullets: [
      'Architected and developed Java 25 Spring Boot microservices serving healthcare professionals across multiple platforms',
      'Built AI-powered video chat assistant using RAG architecture (LLaMA, FastAPI, React) to enhance internal productivity',
      'Implemented Kafka-based event-driven architecture improving data pipeline reliability',
      'Reduced deployment time by 40% by engineering CI/CD pipelines with GitHub Actions and SonarCloud (95% code coverage)',
      'Orchestrated Docker containerization and Kubernetes (EKS) deployments with zero-downtime releases'
    ],
    tags: ['Java 25', 'Spring Boot', 'Kafka', 'AWS EKS', 'React 19', 'FastAPI', 'MongoDB', 'Grafana', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    title: 'Java Developer (Full Stack)',
    company: 'Morgan Stanley',
    location: 'New York, NY',
    period: '07/2023 – 09/2024',
    type: 'Full-time',
    bullets: [
      'Developed Enterprise Customer Risk Ranking (ECRR) and AML/CFT systems processing millions of daily transactions',
      'Designed Single Client View (SCV) application using Angular 15 and TypeScript, reducing client lookup time by 60%',
      'Built RESTful APIs using Spring Boot and JAX-RS with Elasticsearch and Redis caching (50% DB reduction)',
      'Implemented Kafka messaging for real-time risk calculation and cross-system notifications',
      'Optimized MongoDB, IBM DB2, and MSSQL queries improving performance by 40%',
      'Established Jenkins CI/CD pipelines and Liquibase versioning ensuring zero data migration issues'
    ],
    tags: ['Java', 'Spring Boot', 'Kafka', 'Angular 15', 'Redis', 'MongoDB', 'Splunk', 'Sonar', 'IBM DB2', 'Jenkins'],
  },
  {
    title: 'Java Engineer (Full Stack)',
    company: 'Client Inc',
    location: 'Cupertino, CA',
    period: '10/2022 – 02/2023',
    type: 'Contract',
    bullets: [
      'Developed high-performance microservices for Apple Search Ads platform serving millions of ad requests with sub-100ms latency',
      'Deployed services on AWS EKS using Docker ensuring 99.9% uptime',
      'Integrated Kafka for event-driven communication processing millions of events daily',
      'Implemented CI/CD pipelines using Spinnaker reducing deployment cycles by 50%',
      'Applied TDD achieving 80%+ code coverage using JUnit and TestNG',
      'Optimized Cassandra and Oracle databases for high-throughput ad serving'
    ],
    tags: ['Java 11', 'Spring Boot', 'Kafka', 'AWS EKS', 'Cassandra', 'Oracle', 'Docker', 'Spinnaker'],
  },
  {
    title: 'Software Engineer (Full Stack)',
    company: 'Deerwalk Services Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    period: '03/2021 – 10/2021',
    type: 'Contract',
    bullets: [
      'Architected File Mapper Engine microservices supporting 500+ healthcare organizations',
      'Built Angular 9 interfaces improving page load times by 70%',
      'Implemented Kafka streaming pipelines for asynchronous healthcare data exchange',
      'Integrated Elasticsearch and built Kibana dashboards for performance metrics',
      'Established Jenkins CI/CD pipelines with SonarQube quality gates',
      'Conducted SAST, DAST, and SCA security assessments before production releases'
    ],
    tags: ['Java', 'Spring Boot', 'Angular 9', 'Kafka', 'Elasticsearch', 'Jenkins', 'OAuth2', 'JWT'],
  },
  {
    title: 'Java Web Developer (Full Stack)',
    company: 'Datum Systems Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    period: '03/2020 – 03/2021',
    type: 'Full-time',
    bullets: [
      'Developed AML/ATF systems for major commercial banks',
      'Built secure REST APIs using Spring Boot with JWT and OAuth2',
      'Implemented React (Redux) and Angular full-stack features',
      'Created PostgreSQL stored procedures optimizing high-volume transactions',
      'Practiced TDD/BDD achieving high test coverage with JUnit, Mockito, and Cucumber'
    ],
    tags: ['Java', 'Spring Boot', 'React', 'Angular', 'PostgreSQL', 'MongoDB', 'JWT'],
  },
  {
    title: 'Web Application Developer',
    company: 'Ishani Technology Pvt. Ltd.',
    location: 'Lalitpur, Nepal',
    period: '05/2017 – 02/2020',
    type: 'Full-time',
    bullets: [
      'Developed enterprise web applications using Spring MVC, Hibernate, and JAX-RS',
      'Built dynamic UI using Angular, jQuery, AJAX, JSP, HTML5, and CSS3',
      'Optimized PostgreSQL queries and implemented TDD using JUnit and Mockito',
      'Applied multiple design patterns improving code maintainability and scalability'
    ],
    tags: ['Java', 'Spring MVC', 'Hibernate', 'Angular', 'PostgreSQL', 'jQuery'],
  },
];

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

export default function Experience() {
  const [ref, visible] = useInView()

  return (
    <section id="experience" ref={ref} className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="section-title">Experience</h2>
          <div className="section-line"></div>
        </div>

        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <a
            href="/BIKASH MAINALI-Resume-v2.pdf"
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
              <GraduationCap size='45'/>Education
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
              <Barchart size="45"/> At a Glance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '10', label: 'Projects' },
                { num: '8+', label: 'Years Exp.' },
                { num: '1', label: 'In Progress' },
                { num: '4', label: 'Companies' },
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
