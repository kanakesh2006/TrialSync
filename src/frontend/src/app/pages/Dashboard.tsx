import { UserButton, useUser } from "@clerk/clerk-react";
import { FlaskConical, User, Bot, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Dashboard() {
  const { user } = useUser();

  const navigationCards = [
    {
      title: "Patient Portal",
      description: "Manage your medical records and seamlessly seek active clinical trial matches.",
      icon: User,
      href: "/patient",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20 hover:border-primary/50"
    },
    {
       title: "Anamnesis AI Agent",
       description: "Chat with our medical AI to securely extract and format your health history.",
       icon: Bot,
       href: "/patient-chatbot",
       color: "text-[#0A7F8A]",
       bg: "bg-[#0A7F8A]/10",
       border: "border-[#0A7F8A]/20 hover:border-[#0A7F8A]/50"
    },
    {
      title: "Researcher Hub",
      description: "Claim clinical trials from public registries and review eligible patient pool matches.",
      icon: Microscope,
      href: "/researcher",
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20 hover:border-secondary/50"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header do Dashboard */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              TrialMatch
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.firstName || "User"}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center max-w-5xl mx-auto w-full p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-3xl w-full"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Select Your Space, {user?.firstName}</h1>
            <p className="text-muted-foreground text-lg">
              Where would you like to navigate today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navigationCards.map((card) => (
              <Link to={card.href} key={card.title} className={`block p-8 rounded-2xl bg-card border-2 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${card.border}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.bg}`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <h3 className="font-bold text-xl mb-3">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}