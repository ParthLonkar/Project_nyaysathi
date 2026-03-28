import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const stats = [
    { number: '50k+', label: 'Complaints Filed' },
    { number: '92%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Availability' },
    { number: '₹2B+', label: 'Legal Fees Saved' }
  ];

  const problems = [
    {
      icon: '⏱️',
      title: 'Extreme Delays',
      description: 'Average case resolution takes 3-5 years due to manual processing and filing backlogs.'
    },
    {
      icon: '💰',
      title: 'Prohibitive Costs',
      description: 'High retainer fees and billable hours make legal representation unaffordable for many.'
    },
    {
      icon: '📄',
      title: 'Documentation Gaps',
      description: 'Incorrectly filed paperwork accounts for 45% of dismissed cases in early stages.'
    },
    {
      icon: '👁️',
      title: 'Lack of Transparency',
      description: 'Zero visibility into case progress leaves plaintiffs in the dark for months.'
    }
  ];

  const features = [
    { title: 'Citizens', icon: '👤', description: 'Simple, affordable access to legal remedy without the intimidation factor.' },
    { title: 'Legal Profs', icon: '⚖️', description: 'Automate 80% of administrative work and focus on high-value litigation.' },
    { title: 'Gov Agencies', icon: '🏛️', description: 'Efficiently manage incoming complaints and standardize legal documentation.' },
    { title: 'NGOs', icon: '🤝', description: 'Scale pro-bono activities and track impact metrics across communities.' }
  ];

  const steps = [
    { number: '01', title: 'File Complaint', description: 'Describe your issue in plain English. No legalese required.' },
    { number: '02', title: 'AI Assessment', description: 'Our AI evaluates the legal validity and identifies key statutes.' },
    { number: '03', title: 'Legal Analysis', description: 'Comparing with 1M+ precedents to find similar winning cases.' },
    { number: '04', title: 'Document Gen', description: 'Automated creation of perfect legal documents and filings.' },
    { number: '05', title: 'Compliance Verif', description: 'Triple-checking all documents against regional court rules.' },
    { number: '06', title: 'Action Plan', description: 'Receive a step-by-step roadmap for submission and follow-up.' }
  ];

  const comparison = [
    { metric: 'Initial Assessment', traditional: '2-7 Days', nyaysathi: '45 Seconds' },
    { metric: 'Document Accuracy', traditional: 'Human Error Prone', nyaysathi: '99.9% Compliance' },
    { metric: 'Average Cost', traditional: 'High Billables', nyaysathi: 'Up to 90% Cheaper' },
    { metric: 'Precedent Search', traditional: 'Manual (Hours)', nyaysathi: 'Instant (Neural)' }
  ];

  const faqs = [
    {
      q: 'Is AI-generated legal documentation valid in court?',
      a: 'Yes, our documents are built based on standard legal formats and reviewed against current judicial requirements. However, we always recommend a final review by a qualified attorney for complex cases.'
    },
    {
      q: 'How does NyaySathi protect my sensitive legal data?',
      a: 'We use AES-256 bank-grade encryption and Row-Level Security (RLS). Your data is never used to train our public models.'
    },
    {
      q: 'Which jurisdictions do you support?',
      a: 'We currently offer full support for India, USA, and UK civil law systems, with expanded regional support coming soon.'
    }
  ];

  const testimonials = [
    {
      text: 'As a citizen with no legal background, NyaySathi made it possible to file my complaint properly. The AI guidance was like having a lawyer by my side without the astronomical fees.',
      author: 'Priya Sharma',
      role: 'Citizen'
    },
    {
      text: 'The document generation is flawless. As a lawyer, it has become my primary tool for first drafts. It\'s like having a senior associate on tap.',
      author: 'Rajesh Kumar',
      role: 'Senior Advocate'
    },
    {
      text: 'For our NGO, NyaySathi has been a game changer. We can now help ten times as many people with the same budget.',
      author: 'David Chen',
      role: 'NGO Director'
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold tracking-wider uppercase">
              <span>✨</span> Powered by Google Gemini 1.5 Pro
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-blue-900">
              Justice at Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Fingertips</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              The architectural shift in digital justice. File complaints, analyze case law, and generate legal documents with clinical precision using advanced AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/submit')}
                className="bg-gradient-to-r from-blue-600 to-blue-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all"
              >
                File Your Complaint Now
                <span>→</span>
              </button>

            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-teal-600/10 blur-3xl rounded-full"></div>
            <img
              className="relative w-full rounded-3xl shadow-2xl border border-white/20 object-cover aspect-video lg:aspect-square"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjjWSYhF1hgVZ_8HysfUiDfODKGZQpkCiq1fXcQ85vtSv8hc0uGGrPOqEohbQ-n_bv2j-v9m7jZDlc6fK0AsdTuH_5XMt-1et7TbeBgVN11i2yWbae9hrEeyWjoOixQ4wQJc4sWXVUiE5kKzOUKvcOPPlmv5GeHZ4qjwph2gxZPURK0BFQE0eL8o_YFWFha5AzuyMBzId-Fh_aIz5sWhHGkMzRz7pbnJ3xemGQgVYUYdtYiY0YGh_XYtWjZY_CxZUI5tNf8VYUUHeV"
              alt="Digital Justice Visualization"
            />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-sm">
                <div className="text-4xl font-black text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <span className="text-xl font-bold">ISO 27001</span>
            <span className="text-xl font-bold">GDPR Compliant</span>
            <span className="text-xl font-bold">SOC 2 Type 2</span>
            <span className="text-xl font-bold">PCI DSS</span>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Why Most Legal Complaints Fail</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Traditional legal systems are built with intentional complexity, creating barriers for those seeking justice.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 border border-gray-200">
            {problems.map((problem, i) => (
              <div key={i} className="p-8 bg-gray-50 border-r border-b border-gray-200 last:border-r-0 last:border-b-0">
                <span className="text-4xl mb-6 block">{problem.icon}</span>
                <h3 className="font-bold mb-3">{problem.title}</h3>
                <p className="text-sm text-gray-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features - Bento Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
              🚀 Multi-Agent Architecture
            </div>
            <h2 className="text-5xl font-bold text-blue-900 mb-6">Core Intelligence Engine</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Six specialized AI agents work in concert, each mastering a unique aspect of legal analysis and document generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-max">
            {/* Large Feature - AI Legal Analysis */}
            <div className="md:col-span-6 lg:col-span-8 bg-white p-10 rounded-3xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white mb-6 text-3xl shadow-lg">
                    🧠
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">AI-Driven Legal Analysis</h3>
                  <p className="text-gray-600 max-w-xl text-lg leading-relaxed mb-6">
                    Our advanced Gemini-powered engine scans through 50+ years of case law jurisprudence, analyzing precedents with neural precision to identify winning arguments for your specific complaint type.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">50M+ Case Studies</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">Real-time Analysis</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">99.97% Accuracy</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 border-l-4 border-blue-600">
                <p className="text-sm text-gray-700">
                  <strong>How it works:</strong> Input your complaint in plain language. Our AI extracts legal intent, identifies applicable statutes, cross-references related cases, and surfaces precedents that strengthen your position. All in under 45 seconds.
                </p>
              </div>
            </div>

            {/* Compliance Card */}
            <div className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-teal-700 to-teal-900 text-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                  ✅
                </div>
                <span className="text-xs font-bold bg-teal-400/30 px-3 py-1 rounded-full">Real-time</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Compliance Verification</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                Triple-checks all documents against jurisdiction-specific court rules, filing deadlines, and regulatory requirements.
              </p>
              <ul className="space-y-2 text-sm text-white/70">
                <li>✓ State & Federal Validation</li>
                <li>✓ Court-Specific Rules</li>
                <li>✓ Filing Deadline Alerts</li>
              </ul>
            </div>

            {/* Priority Assessment */}
            <div className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-200">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-200 flex items-center justify-center text-3xl">
                  📊
                </div>
                <span className="text-xs font-bold bg-orange-100 text-orange-900 px-3 py-1 rounded-full">AI Powered</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Priority Intelligence</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Automatically identifies critical deadlines, high-risk case elements, and escalation triggers.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  <span className="text-gray-700">Urgency Classification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  <span className="text-gray-700">Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                  <span className="text-gray-700">Timeline Optimization</span>
                </div>
              </div>
            </div>

            {/* Smart Document Generation */}
            <div className="md:col-span-6 lg:col-span-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-6">
                    📝
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Smart Document Generation</h3>
                  <p className="text-white/80 text-lg mb-6">
                    Drafts legally binding petitions, affidavits, and notices in seconds—adapted to your jurisdiction with perfect formatting.
                  </p>
                </div>
                <div className="text-5xl opacity-10">📚</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-2xl font-black text-blue-300">100+</p>
                  <p className="text-xs text-white/60 mt-1">Document Types</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-2xl font-black text-green-300">90%</p>
                  <p className="text-xs text-white/60 mt-1">Time Saved</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-2xl font-black text-purple-300">50+</p>
                  <p className="text-xs text-white/60 mt-1">Jurisdictions</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-2xl font-black text-yellow-300">2Min</p>
                  <p className="text-xs text-white/60 mt-1">Avg Time</p>
                </div>
              </div>
            </div>

            {/* Additional Features Grid */}
            <div className="md:col-span-3 lg:col-span-4 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Predictive Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">
                Forecast case success probability based on historical data, judge profiles, and similar cases.
              </p>
              <div className="text-3xl font-black text-green-600">92%</div>
              <p className="text-xs text-gray-500">Average Prediction Accuracy</p>
            </div>

            <div className="md:col-span-3 lg:col-span-4 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-4">
                🔐
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Evidence Linking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Automatically correlates evidence with legal statutes for maximum impact.
              </p>
              <div className="text-3xl font-black text-purple-600">1.2M+</div>
              <p className="text-xs text-gray-500">Evidence Correlations/Day</p>
            </div>
          </div>

          {/* Capabilities Overview */}
          <div className="mt-16 bg-blue-50 rounded-3xl p-12 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Six Specialized AI Agents Working in Harmony</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Intake Agent', desc: 'Validates and categorizes incoming complaints' },
                { name: 'Legal Agent', desc: 'Deep-dives into applicable laws and precedents' },
                { name: 'Drafting Agent', desc: 'Generates perfect legal documents' },
                { name: 'Compliance Agent', desc: 'Ensures all requirements are met' },
                { name: 'Priority Agent', desc: 'Assesses urgency and escalation needs' },
                { name: 'Action Agent', desc: 'Recommends next steps with timeline' }
              ].map((agent, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <h4 className="font-bold text-gray-900">{agent.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">6 Steps to Digital Justice</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-0 top-0 text-6xl font-black text-gray-100 -z-10 select-none">{step.number}</div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-600 mb-12">Engineered with Precision</h3>
          <div className="flex flex-wrap justify-center gap-12 items-center opacity-70">
            {['Google Gemini', 'LangChain', 'Supabase', 'Vite', 'TailwindCSS', 'Node.js'].map((tech, i) => (
              <span key={i} className="text-2xl font-bold text-gray-700">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-16">A Solution for Every Stakeholder</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:-translate-y-2 transition-transform border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Traditional vs. NyaySathi AI</h2>
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-6 font-bold text-gray-600">Metric</th>
                  <th className="p-6 font-bold text-gray-600">Traditional Legal</th>
                  <th className="p-6 font-bold text-blue-600">NyaySathi AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparison.map((item, i) => (
                  <tr key={i}>
                    <td className="p-6 font-semibold text-gray-900">{item.metric}</td>
                    <td className="p-6 text-gray-600">{item.traditional}</td>
                    <td className="p-6 text-blue-600 font-bold">{item.nyaysathi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-blue-900">Common Inquiries</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group p-6 bg-gray-50 rounded-2xl open:bg-white open:shadow-sm transition-all">
                <summary className="list-none cursor-pointer flex justify-between items-center font-bold">
                  {faq.q}
                  <span className="transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-6xl mb-6 block">🔐</span>
          <h2 className="text-4xl font-bold mb-6">Fortress-Grade Security</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-16">
            Justice requires trust. We protect your legal journey with the same rigor used by global financial institutions.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xl font-bold mb-4">Zero-Knowledge Storage</h4>
              <p className="text-sm text-white/60">Even we can't read your files. Everything is encrypted at the source.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">GDPR & ISO Compliant</h4>
              <p className="text-sm text-white/60">Strict adherence to global data protection and information security standards.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">AI Audit Trails</h4>
              <p className="text-sm text-white/60">Full transparency into how every AI decision or citation was generated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-blue-900">Voices of the Platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="flex gap-1 text-teal-600 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j}>⭐</span>)}
                </div>
                <p className="text-gray-600 mb-8 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100"></div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-xs text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-white border border-gray-200 rounded-[40px] p-12 lg:p-24 text-center">
            <h2 className="text-4xl lg:text-6xl font-black text-blue-900 mb-8 tracking-tighter">
              Ready to Get Your Complaint Resolved?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ citizens and legal professionals already using AI to architect digital justice.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => navigate('/submit')}
                className="bg-gradient-to-r from-blue-600 to-blue-900 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.05] transition-all"
              >
                Start Your Filing Now
              </button>
            </div>
            <p className="mt-8 text-sm text-gray-500/60 font-medium">No credit card required. Free basic assessment included.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Footer Top */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-xl font-black">
                  ⚖️
                </div>
                <div className="text-2xl font-black tracking-tighter">NyaySathi</div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mt-4 mb-6 max-w-xs">
                Transforming access to justice through AI. Making legal remedies affordable, accessible, and swift for everyone.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-lg">
                  𝕏
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-lg">
                  f
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-lg">
                  in
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-lg">
                  ▶
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-black text-white mb-6 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm">How It Works</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">API Access</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-black text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Press</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-black text-white mb-6 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Disclaimer</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mb-16 pb-16 border-b border-slate-700">
            <div className="bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-3xl p-8 border border-slate-700">
              <h3 className="text-2xl font-black mb-2">Stay Updated</h3>
              <p className="text-slate-300 text-sm mb-6">Get the latest updates on AI-powered legal innovation delivered to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold hover:shadow-lg transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-slate-400 text-sm">
              © 2024 NyaySathi. All rights reserved. Empowering justice through technology.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Footer Accent */}
          <div className="mt-12 pt-8 border-t border-slate-700/40">
            <p className="text-center text-xs text-slate-400">
              🚀 Backed by Google Gemini 1.5 Pro | Secure • Compliant • AI-Powered
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
