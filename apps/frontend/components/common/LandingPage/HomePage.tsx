import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Terminal, Cpu, GitBranch, Github, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import Image from "next/image";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#about", label: "About Us" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500", isScrolled ? "py-3 px-4 sm:px-6" : "py-5 px-0")}>
      <div className={cn("w-full relative transition-all duration-500", isScrolled ? "max-w-6xl" : "max-w-none")}>
        <div
          className={cn(
            "flex items-center justify-between gap-4 px-4 md:px-6 transition-all duration-500 border border-transparent",
            isScrolled
              ? "mx-auto w-full md:w-[80vw] max-w-5xl rounded-3xl bg-white/90 backdrop-blur-2xl border-white/60 shadow-2xl py-4"
              : "w-full rounded-none bg-white/15 backdrop-blur-md border-white/10 shadow-none"
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <svg width="26" height="24" viewBox="0 0 26 24" fill="none" className="text-black">
              <path
                d="M20.5286 3.26811L19.1512 5.65694L22.6328 11.6849C22.6582 11.7306 22.6735 11.7866 22.6735 11.8374C22.6735 11.8882 22.6582 11.9441 22.6328 11.9899L19.1512 18.0229L20.5286 20.4117L25.4791 11.8374L20.5286 3.26303V3.26811ZM18.6176 5.3469L19.995 2.95807H17.2402L15.8628 5.3469H18.6227H18.6176ZM15.8577 5.96697L19.075 11.5324H21.8298L18.6176 5.96697H15.8577ZM18.6176 17.7179L21.8298 12.1474H19.075L15.8577 17.7179H18.6176ZM15.8577 18.338L17.2351 20.7167H19.9899L18.6125 18.338H15.8526H15.8577ZM6.52098 21.3063C6.46507 21.3063 6.41424 21.291 6.3685 21.2656C6.32276 21.2402 6.28209 21.1995 6.25668 21.1538L2.77002 15.1207H0.0152482L4.9657 23.69H14.8615L13.4841 21.3063H6.52606H6.52098ZM14.0178 20.9962L15.3952 23.38L16.7726 20.9911L15.3952 18.6023L14.0178 20.9911V20.9962ZM14.8615 18.2974H8.43712L7.05973 20.6862H13.4841L14.8615 18.2974ZM7.89836 17.9924L4.68108 12.4219L3.30369 14.8107L6.52098 20.3812L7.89836 17.9924ZM0.0101654 14.5007H2.76494L4.14232 12.1118H1.39263L0.0101654 14.5007ZM6.24143 2.5413C6.26685 2.49556 6.30751 2.4549 6.35325 2.42948C6.399 2.40407 6.4549 2.38882 6.50573 2.38882H13.474L14.8514 0H4.95045L0 8.57435H2.75477L6.23127 2.54638L6.24143 2.5413ZM4.14232 11.5782L2.76494 9.18934H0.0101654L1.38755 11.5782H4.14232ZM6.51081 3.31386L3.29861 8.8793L4.67599 11.2681L7.8882 5.70268L6.51081 3.31386ZM13.4791 3.00382H7.04448L8.42187 5.39264H14.8564L13.4791 3.00382ZM15.3952 5.0826L16.7675 2.69886L15.3952 0.310038L14.0178 2.69378L15.3952 5.0826Z"
                fill="currentColor"
              />
            </svg>
            <span className={cn("font-bold text-lg tracking-tight transition-opacity", isScrolled ? "opacity-100" : "opacity-0 md:opacity-100")}>Continue</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </a>
            <a href="https://github.com/continuedev/continue" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>

          <button className="md:hidden z-10 p-2 rounded-full hover:bg-white/60 transition-colors" onClick={() => setIsMobileMenuOpen((prev) => !prev)} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.75rem)] w-full max-w-3xl rounded-2xl bg-white border border-gray-100 shadow-2xl p-6 flex flex-col gap-6"
            >
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-lg font-semibold text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              <Link href="/login" className="text-lg font-medium text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
const Hero = () => {
  const heroStats = [
    { label: "Faster releases", value: "3x" },
    { label: "Time saved / week", value: "18 hrs" },
    { label: "Approval confidence", value: "99%" },
  ];

  const heroHighlights = [
    "AI copilots with human-in-the-loop reviews",
    "Live context from product telemetry and CRM",
    "Safe rollouts with automated guardrails",
    "Ship-ready assets for every prospect channel",
  ];

  const workflowSteps = [
    {
      title: "Monitor Sentry alerts",
      status: "Completed",
      color: "from-indigo-500/10 to-indigo-500/5",
      border: "border-indigo-200",
    },
    {
      title: "Draft outreach with CRM notes",
      status: "Running",
      color: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-200",
    },
    {
      title: "Await human approval",
      status: "Queued",
      color: "from-slate-500/10 to-slate-500/5",
      border: "border-slate-200",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div className="absolute inset-0 bg-linear-to-b from-white via-indigo-50/40 to-white" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-indigo-300/30 blur-[140px]" />
        <div className="absolute right-0 bottom-10 h-64 w-64 rounded-full bg-blue-200/40 blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10 grid items-center gap-14 lg:grid-cols-2">
        <div className="space-y-8 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Outreach OS - Beta
          </span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
            Make every outbound touch feel bespoke.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0">
            Continue blends your product data, CRM notes, and AI copilots to create hyper-relevant sequences in minutes. You stay in control with approvals, insights, and ready-to-ship assets.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-white font-semibold shadow-lg shadow-indigo-200/50 transition-transform hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#docs"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-8 py-3 font-semibold text-slate-900 shadow-sm hover:bg-white"
            >
              <Play className="w-4 h-4" />
              Watch demo
            </Link>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {heroHighlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <p className="text-sm font-medium text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 border-t border-white/70 pt-6 lg:justify-start">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-left">
                <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-sm uppercase tracking-wide text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-xl mx-auto">
          <div className="absolute inset-x-12 -top-8 h-40 rounded-full bg-indigo-200/60 blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-[32px] border border-white/60 bg-white/80 shadow-2xl backdrop-blur-3xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em]">Live run</p>
                <p className="text-xs text-slate-400">Mission Control - Alpha team</p>
              </div>
              <span className="text-xs font-medium text-slate-500">~2m avg</span>
            </div>
            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <motion.div key={step.title} whileHover={{ scale: 1.01 }} className={cn("rounded-2xl border px-4 py-4 shadow-sm bg-linear-to-br", step.color, step.border)}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{step.title}</span>
                    <span className="text-xs text-slate-500">{step.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Autopilot + approvals</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-900 text-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">CLI capture</p>
              <pre className="mt-4 text-[13px] leading-6 font-mono text-white/90">npx continue run outreach --target hyper-mail --approve</pre>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-10 left-4 w-48 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl"
          >
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-[0.2em]">
              <Terminal className="w-4 h-4" /> CLI handoff
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">Approve sequence</p>
            <p className="text-xs text-slate-500">2 waiting steps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-10 right-0 w-40 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
              <Cpu className="w-4 h-4" /> Copilot
            </div>
            <p className="mt-3 text-sm font-semibold">Personalization graph</p>
            <p className="text-xs text-white/70">Live</p>
          </motion.div>
        </div>
      </div>

      <motion.a href="#pricing" className="mt-12 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        Scroll to explore
        <ChevronDown className="w-4 h-4" />
      </motion.a>
    </section>
  );
};
type PlanCardProps = {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  buttonColor: string;
  details: string[];
  isActive: boolean;
  onHover: () => void;
};

const PlanCard = ({ title, subtitle, description, icon: Icon, colorClass, buttonColor, details, isActive, onHover }: PlanCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ease-in-out cursor-pointer flex flex-col border border-transparent",
        isActive ? "flex-2 bg-white shadow-xl border-slate-100" : "flex-1 bg-white/70 hover:bg-white border-white/60 hover:shadow-lg"
      )}
      onMouseEnter={onHover}
      layout
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-3 rounded-2xl bg-white shadow-sm border border-slate-100", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          <p className="text-base font-semibold text-slate-900">{subtitle}</p>
        </div>
      </div>

      <motion.p className="text-slate-500 mb-4" layout="position">
        {description}
      </motion.p>

      <AnimatePresence>
        {isActive && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <ul className="space-y-3 mb-6">
              {details.map((detail) => (
                <li key={detail} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className={cn("w-4 h-4 mt-0.5", colorClass)} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <button className={cn("px-6 py-2 rounded-full text-white font-medium transition-colors", buttonColor)}>Get started</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Plans = () => {
  const [activePlan, setActivePlan] = useState(0);

  const plans = [
    {
      title: "Mission Control",
      subtitle: "Visual workflow studio",
      description: "Launch background agents with guardrails, escalate for approvals, and pipe insights anywhere.",
      icon: Cpu,
      colorClass: "text-purple-600",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      details: ["Blueprint library for sales, success, and ops", "Branching automations tied to live events", "Audit trails and role-based approvals"],
    },
    {
      title: "Continue CLI",
      subtitle: "Terminal-native control",
      description: "Spin up the same flows straight from your shell. Script them, pipe them, automate everything.",
      icon: Terminal,
      colorClass: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      details: ["Watch agent steps in real time", "Manual overrides without leaving tmux", "Preflight checks before merge or deploy"],
    },
    {
      title: "CI/CD pipelines",
      subtitle: "Runs where you work",
      description: "Promote trusted workflows into GitHub Actions, Jenkins, or any runner to keep humans in the loop.",
      icon: GitBranch,
      colorClass: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      details: ["Policy packs for compliance & security", "Secrets management baked in", "Observability hooks for every stage"],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-linear-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Plans</p>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">Less repetitive work. More creative work.</h3>
          <p className="text-slate-500 mt-4">Choose the touchpoint that matches your team. Every plan keeps approvals, observability, and the same AI copilots.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[520px]">
          {plans.map((plan, index) => (
            <PlanCard key={plan.title} {...plan} isActive={activePlan === index} onHover={() => setActivePlan(index)} />
          ))}
        </div>
      </div>
    </section>
  );
};
const FeatureTour = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  const features = [
    {
      id: "01",
      title: "Cloud agents",
      desc: "Set workflows to run automatically on PR opens, schedules, or any event trigger.",
      video: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F690021a6354856be5fa9d6b8_mission-control-1080-2-transcode.mp4",
      poster: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F690021a6354856be5fa9d6b8_mission-control-1080-2-poster-00001.jpg",
    },
    {
      id: "02",
      title: "CLI agents",
      desc: "Watch workflows execute in real time and approve decisions step-by-step from your terminal.",
      video: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F68cb488f0253af8326841f27_cli-sep2025-transcode.mp4",
      poster: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F68cb488f0253af8326841f27_cli-sep2025-poster-00001.jpg",
    },
    {
      id: "03",
      title: "IDE agents",
      desc: "Trigger workflows from VS Code or JetBrains and let agents handle the refactoring while you keep coding.",
      video: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F688c22697ec54277a64a73dc_agent-720-transcode.mp4",
      poster: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf%2F688c22697ec54277a64a73dc_agent-720-poster-00001.jpg",
    },
  ];

  useEffect(() => {
    const duration = 5000;
    const interval = 50;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveFeature((curr) => (curr + 1) % features.length);
          return 0;
        }
        return prev + (interval / duration) * 100;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeFeature, features.length]);

  const handleFeatureClick = (index: number) => {
    setActiveFeature(index);
    setProgress(0);
  };

  return (
    <section id="docs" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Workflow tour</p>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">Preview the control room</h3>
          <p className="text-slate-500 mt-4">Tap into any surface area. Mission Control, CLI, and IDE agents stay in sync so every approval and insight is shared.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 aspect-video bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                <video autoPlay loop muted playsInline poster={features[activeFeature].poster} className="w-full h-full object-cover">
                  <source src={features[activeFeature].video} type="video/mp4" />
                </video>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => handleFeatureClick(index)}
                className={cn("cursor-pointer group relative pl-6 border-l-2 transition-colors duration-300", activeFeature === index ? "border-transparent" : "border-slate-200")}
              >
                {activeFeature === index && (
                  <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-slate-200 overflow-hidden">
                    <motion.div className="w-full bg-slate-900" style={{ height: `${progress}%` }} />
                  </div>
                )}
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 mb-1">{feature.id}</div>
                <h3 className={cn("text-2xl font-semibold mb-2 transition-colors", activeFeature === index ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600")}>{feature.title}</h3>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeFeature === index ? "auto" : 0,
                    opacity: activeFeature === index ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="text-slate-600 text-lg leading-relaxed">{feature.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
const Integrations = () => {
  const integrations = [
    {
      name: "Ollama",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb46d05487e530acdcf2e_Microsoft.VisualStudio.Services.Icons%201.png",
    },
    {
      name: "OpenAI",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb436a91df62431c328c3_openai-icon-2021x2048-4rpe5x7n%201.webp",
    },
    {
      name: "Anthropic",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb436070b230b23be06bf_anthropic-icon-logo-630D0BB290-seeklogo%201.webp",
    },
    {
      name: "Mistral",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb43644745f55240ad07a_132372032%201.webp",
    },
    {
      name: "Sentry",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb1052cd6b3cdfaf8d3f0_folder%20code%201.webp",
    },
    {
      name: "GitHub",
      icon: "https://cdn.prod.website-files.com/663e06c56841363663ffbbcf/664cb0e9a31f7e6bcf0dfadc_file-code-2.webp",
    },
  ];

  const automationSteps = [
    {
      title: "Enrich every prospect",
      desc: "Sync CRM, product usage, and call notes into a single personalization graph.",
      accent: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: "Trigger automations anywhere",
      desc: "Run from PR events, support alerts, or sales signals without rebuilding logic.",
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Loop humans back in",
      desc: "Auto-route approvals to Slack or email before anything reaches a customer.",
      accent: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <section id="about" className="py-24 bg-linear-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Integrations</p>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">Proactive workflows beat reactive coding.</h3>
            <p className="text-slate-500 mt-4 max-w-2xl">
              Plug Continue into the models and tools you already trust. Keep data on your side, and let AI copilots work across the stack with full observability.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10">
              {integrations.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4 border border-slate-100"
                >
                  <Image src={item.icon} alt={item.name} className="w-10 h-10 object-contain opacity-80" height={10} width={10} />
                  <span className="font-medium text-sm text-slate-700">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl">
            <p className="text-sm font-semibold text-slate-500 tracking-[0.3em] uppercase">Automation path</p>
            <div className="mt-6 space-y-6">
              {automationSteps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-slate-100 p-6 bg-slate-50">
                  <span className={cn("text-xs font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full inline-block mb-4", step.accent)}>Step</span>
                  <h4 className="text-lg font-semibold text-slate-900">{step.title}</h4>
                  <p className="text-sm text-slate-500 mt-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CallToAction = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-linear-to-r from-indigo-600 via-blue-600 to-slate-900 p-12 text-center text-white">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 g-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_55%)]" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Create, share, and evolve custom AI code assistants.</h2>
            <p className="text-white/80 text-lg">
              Discover the models, rules, prompts, and docs your team needs to land perfect outreach. Bring your stack, keep your data private, and let Continue handle the busywork.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/hub" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg">
                Continue Hub
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/40 text-white font-semibold">
                Compare plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg width="26" height="24" viewBox="0 0 26 24" fill="none" className="text-white">
                <path
                  d="M20.5286 3.26811L19.1512 5.65694L22.6328 11.6849C22.6582 11.7306 22.6735 11.7866 22.6735 11.8374C22.6735 11.8882 22.6582 11.9441 22.6328 11.9899L19.1512 18.0229L20.5286 20.4117L25.4791 11.8374L20.5286 3.26303V3.26811ZM18.6176 5.3469L19.995 2.95807H17.2402L15.8628 5.3469H18.6227H18.6176ZM15.8577 5.96697L19.075 11.5324H21.8298L18.6176 5.96697H15.8577ZM18.6176 17.7179L21.8298 12.1474H19.075L15.8577 17.7179H18.6176ZM15.8577 18.338L17.2351 20.7167H19.9899L18.6125 18.338H15.8526H15.8577ZM6.52098 21.3063C6.46507 21.3063 6.41424 21.291 6.3685 21.2656C6.32276 21.2402 6.28209 21.1995 6.25668 21.1538L2.77002 15.1207H0.0152482L4.9657 23.69H14.8615L13.4841 21.3063H6.52606H6.52098ZM14.0178 20.9962L15.3952 23.38L16.7726 20.9911L15.3952 18.6023L14.0178 20.9911V20.9962ZM14.8615 18.2974H8.43712L7.05973 20.6862H13.4841L14.8615 18.2974ZM7.89836 17.9924L4.68108 12.4219L3.30369 14.8107L6.52098 20.3812L7.89836 17.9924ZM0.0101654 14.5007H2.76494L4.14232 12.1118H1.39263L0.0101654 14.5007ZM6.24143 2.5413C6.26685 2.49556 6.30751 2.4549 6.35325 2.42948C6.399 2.40407 6.4549 2.38882 6.50573 2.38882H13.474L14.8514 0H4.95045L0 8.57435H2.75477L6.23127 2.54638L6.24143 2.5413ZM4.14232 11.5782L2.76494 9.18934H0.0101654L1.38755 11.5782H4.14232ZM6.51081 3.31386L3.29861 8.8793L4.67599 11.2681L7.8882 5.70268L6.51081 3.31386ZM13.4791 3.00382H7.04448L8.42187 5.39264H14.8564L13.4791 3.00382ZM15.3952 5.0826L16.7675 2.69886L15.3952 0.310038L14.0178 2.69378L15.3952 5.0826Z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-bold text-xl">Continue</span>
            </Link>
            <p className="text-slate-400 text-sm">Ship faster with Continuous AI.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold mb-2">Product</h4>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-slate-400 hover:text-white transition-colors">
              Docs
            </a>
            <a href="/enterprise" className="text-slate-400 hover:text-white transition-colors">
              Enterprise
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold mb-2">Company</h4>
            <a href="#about" className="text-slate-400 hover:text-white transition-colors">
              About Us
            </a>
            <a href="#careers" className="text-slate-400 hover:text-white transition-colors">
              Careers
            </a>
            <a href="/blog" className="text-slate-400 hover:text-white transition-colors">
              Blog
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold">Subscribe to updates</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-white w-full focus:outline-none focus:border-white/60" />
              <button className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium hover:bg-slate-200">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Join our newsletter to learn more.</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">(c) 2025 Continue, Inc.</div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white">
              Privacy Notice
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans bg-white scroll-smooth selection:bg-black selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Plans />
        <FeatureTour />
        <Integrations />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
