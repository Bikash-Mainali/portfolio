import {useState} from 'react'
import {useInView} from '../hooks/useInView'
import {
    Github,
    Linkedin,
    Facebook,
    Send,
    Instagram,
    Mail,
    MapPinned
} from "../icons";
import emailjs from '@emailjs/browser';

export default function Contact() {
    const [ref, visible] = useInView()
    const [form, setForm] = useState({name: '', email: '', title: '', message: ''})
    const [sent, setSent] = useState(false)
    const [sending, setSending] = useState(false)

    function handleChange(e) {
        debugger
        setForm({...form, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSending(true)

        emailjs.send('service_hy2kl0t', 'template_fytdpoi', form, 'JOmZXS8uo9wDOYkqc')
            .then(() => {
                setSending(false)
                setSent(true)
                setForm({name: '', email: '', title: '', message: ''})
                setTimeout(() => setSent(false), 3000)
            }, (error) => {
                console.log('FAILED...', error);
            });
        }

    return (
        <section id="contact" ref={ref} className="py-28 relative">
            <div className="relative max-w-7xl mx-auto px-6">
                <div
                    className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="section-title text-center">Get In Touch</h2>
                    <div className="section-line mx-auto"></div>
                    <p className="text-slate-400 max-w-lg mx-auto mb-12 text-sm leading-relaxed">
                        I'm currently open to new opportunities. Whether you have a question, a project idea, or just
                        want to say hi — my inbox is always open!
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-10">
                    {/* Info cards */}
                    <div
                        className="md:col-span-2 flex justi flex-col gap-5 transition-all duration-700 delay-200"
                        style={{opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-20px)'}}
                    >
                        {[
                            {
                                icon: <MapPinned className="text-slate-300"/>,
                                label: 'Location',
                                value: 'CA, USA',
                                href: null
                            },
                            {
                                icon: <Mail className="text-slate-300"/>,
                                label: 'Email',
                                value: 'bikashmainali18@gmail.com',
                                href: 'mailto:bikashmainali18@gmail.com'
                            },
                            {
                                icon: <Linkedin className="text-slate-300"/>,
                                label: 'LinkedIn',
                                value: 'bikash-mainali',
                                href: 'https://www.linkedin.com/in/bikash-mainali-629505168/'
                            },
                        ].map(item => (
                            <div key={item.label}
                                 className="card-glass rounded-xl p-4 flex items-center gap-4 hover:border-teal-400/25 transition-all duration-200">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <div className="font-mono text-xs text-slate-500 mb-0.5">{item.label}</div>
                                    {item.href ? (
                                        <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                                           rel="noopener noreferrer"
                                           className="text-sm text-slate-300 hover:text-teal-400 transition-colors">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-300">{item.value}</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Social row */}
                        <div className="flex gap-5 flex-wrap mt-2 justify-center">
                            {[
                                {
                                    href: 'https://www.linkedin.com/in/bikash-mainali-629505168/',
                                    label: 'linkedin',
                                    icon: <Linkedin/>,
                                    color: "text-[#0A66C2] border-[#0A66C2]/40 hover:border-[#0A66C2] hover:text-[#0A66C2]/90 hover:bg-[#0A66C2]/10 hover:shadow-[0_0_15px_#0A66C2]"
                                },
                                {
                                    href: 'https://github.com/Bikash-Mainali',
                                    label: 'github',
                                    icon: <Github/>,
                                    color: "text-white border-white/30 hover:border-white hover:text-gray-200 hover:bg-white/10 hover:shadow-[0_0_15px_white]"
                                },
                                {
                                    href: 'https://www.facebook.com/biki51',
                                    label: 'facebook',
                                    icon: <Facebook/>,
                                    color: "text-[#1877F2] border-[#1877F2]/40 hover:border-[#1877F2] hover:text-[#1877F2]/90 hover:bg-[#1877F2]/10 hover:shadow-[0_0_15px_#1877F2]"
                                },
                                {
                                    href: 'https://www.instagram.com/mainalibiki/',
                                    label: 'instagram',
                                    icon: <Instagram/>,
                                    color: "text-[#E4405F] border-[#E4405F]/40 hover:border-[#E4405F] hover:text-[#E4405F]/90 hover:bg-[#E4405F]/10 hover:shadow-[0_0_15px_#E4405F]"
                                },
                            ].map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center
      border backdrop-blur-sm
      transition-all duration-300 ease-in-out
      ${s.color}`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div
                        className="md:col-span-3 transition-all duration-700 delay-400"
                        style={{opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(20px)'}}
                    >
                        <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-8 space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="font-mono text-xs text-slate-500 mb-2 block">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:bg-teal-400/5 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="font-mono text-xs text-slate-500 mb-2 block">Your Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Email"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:bg-teal-400/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5">
                                <div>
                                    <label className="font-mono text-xs text-slate-500 mb-2 block">Subject</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Title/Subject"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:bg-teal-400/5 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-mono text-xs text-slate-500 mb-2 block">Message</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Tell me something..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-400/50 focus:bg-teal-400/5 transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="btn-primary w-full justify-center flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : sent ? (
                                    <>✓ Message Sent!</>
                                ) : (
                                    <>
                                        Send Message
                                        <Send></Send>
                                    </>
                                )}
                            </button>

                            <p className="font-mono text-xs text-slate-600 text-center">
                                Or email me directly at{' '}
                                <a href="mailto:bikashmainali18@gmail.com" className="text-teal-400 hover:underline">
                                    bikashmainali18@gmail.com
                                </a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
