import { useInView } from '../hooks/useInView'

const skills = [
  { name: 'Java', pct: 95, cat: 'Language' },
  { name: 'TypeScript', pct: 100, cat: 'Language' },
  { name: 'JavaScript', pct: 100, cat: 'Language' },
  { name: 'Angular', pct: 90, cat: 'Frontend' },
  { name: 'React', pct: 100, cat: 'Frontend' },
  { name: 'Vue', pct: 70, cat: 'Frontend' },
  { name: 'PL/SQL', pct: 90, cat: 'Database' },
  { name: 'Groovy', pct: 80, cat: 'Language' },
  { name: 'AWS', pct: 50, cat: 'DevOps' },
  { name: 'Python', pct: 70, cat: 'Language' },
]

const catColor = {
  Frontend: 'text-teal-600 dark:text-teal-400 bg-teal-600/10 dark:bg-teal-400/10 border-teal-600/20 dark:border-teal-400/20',
  Backend: 'text-blue-600 dark:text-blue-400 bg-blue-600/10 dark:bg-blue-400/10 border-blue-600/20 dark:border-blue-400/20',
  Language: 'text-amber-600 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-400/10 border-amber-600/20 dark:border-amber-400/20',
  Database: 'text-purple-600 dark:text-purple-400 bg-purple-600/10 dark:bg-purple-400/10 border-purple-600/20 dark:border-purple-400/20',
  DevOps: 'text-orange-600 dark:text-orange-400 bg-orange-600/10 dark:bg-orange-400/10 border-orange-600/20 dark:border-orange-400/20',
}

const barColor = {
  Frontend: 'bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-500 dark:to-teal-400',
  Backend: 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-400',
  Language: 'bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-600 dark:to-amber-400',
  Database: 'bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-600 dark:to-purple-400',
  DevOps: 'bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-600 dark:to-orange-400',
}

export default function Skills() {
  const [ref, visible] = useInView()

  return (
      <section id="skills" ref={ref} className="py-28 bg-stone-50 dark:bg-navy-900/50 relative">
        <div className="absolute inset-0 dot-grid opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="section-title">Tech Stack</h2>
            <div className="section-line"></div>
            <p className="text-stone-600 dark:text-slate-400 text-sm mb-12">A snapshot of my technical proficiency</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, i) => (
                <div
                    key={skill.name}
                    className={`card-glass rounded-xl p-5 transition-all duration-500`}
                    style={{
                      transitionDelay: `${i * 80}ms`,
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-body font-medium text-stone-900 dark:text-white text-sm">{skill.name}</span>
                      <span className={`tag text-xs border px-2 py-0.5 rounded-full ${catColor[skill.cat]}`}>
                    {skill.cat}
                  </span>
                    </div>
                    <span className="font-mono text-sm text-stone-700 dark:text-slate-300">{skill.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${barColor[skill.cat]} transition-all duration-1000 ease-out`}
                        style={{
                          width: visible ? `${skill.pct}%` : '0%',
                          transitionDelay: `${i * 80 + 300}ms`,
                        }}
                    ></div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>
  )
}
