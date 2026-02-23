import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, Users, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Careers() {
  const jobs = [
    {
      title: "Cleaning Technician",
      type: "Full-time",
      location: "Dubai, UAE",
      description: "Join our team of professional cleaners. We provide comprehensive training and a supportive environment.",
      salary: "AED 2,500 - 3,500"
    },
    {
      title: "Operations Supervisor",
      type: "Full-time",
      location: "Dubai, UAE",
      description: "Lead a team of cleaners and ensure high-quality service delivery across various client locations.",
      salary: "AED 5,000 - 7,000"
    },
    {
      title: "Customer Service Representative",
      type: "Full-time",
      location: "Dubai, UAE",
      description: "Handle customer inquiries, coordinate service bookings, and ensure client satisfaction.",
      salary: "AED 4,000 - 5,500"
    }
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1600" 
            alt="Careers" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Join Our <span className="text-primary">Team</span></h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Build your career with UAE's leading hygiene solution provider. We're looking for passionate individuals to join our growing family.
          </p>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Our Culture</h2>
              <h3 className="text-4xl font-black text-slate-900 leading-tight">Why Work at <span className="text-primary">Silver Maid?</span></h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                We believe that happy employees lead to happy customers. We foster a culture of respect, growth, and excellence.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Growth Opportunities", icon: Sparkles },
                  { title: "Competitive Salary", icon: Heart },
                  { title: "Professional Training", icon: CheckCircle2 },
                  { title: "Diverse Team", icon: Users }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-primary shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-slate-900 font-black text-sm">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                alt="Our Team" 
                className="rounded-[3rem] shadow-2xl"
              />
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-4xl shadow-2xl border border-slate-100 hidden md:block">
                <div className="text-4xl font-black text-primary mb-1">50+</div>
                <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Team Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Open Positions</h2>
            <h3 className="text-4xl font-black text-slate-900">Current Opportunities</h3>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            {jobs.map((job, index) => (
              <div key={index} className="group bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-1 bg-pink-50 text-primary text-xs font-black rounded-full uppercase tracking-widest">{job.type}</span>
                      <span className="px-4 py-1 bg-slate-100 text-slate-600 text-xs font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{job.title}</h3>
                    <p className="text-slate-600 max-w-2xl">{job.description}</p>
                    <div className="text-primary font-black">{job.salary}</div>
                  </div>
                  <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-primary transition-all shadow-xl shadow-slate-200 group-hover:shadow-primary/20 shrink-0">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <p className="text-slate-600 text-lg mb-8">
              Don't see a position that matches your skills? Send us your resume anyway!
            </p>
            <button className="px-12 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-900 hover:text-white transition-all">
              Send General Application
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
