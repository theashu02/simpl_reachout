import React from "react";
import { ShieldCheck, UploadCloud, Users, Workflow, Star, LucideIcon } from "lucide-react";
import { dmSans } from "@/lib/utils";

interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

const Card: React.FC<CardProps> = ({ title, description, icon: Icon, colorClass }) => (
  <div className="relative group h-full">
    <div
      className="bg-[#002c2d] h-full p-8 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        clipPath: "polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)",
      }}
    >
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-48 h-64 bg-linear-to-br from-[#e0f7fa] to-[#b2ebf2] opacity-100 z-0"
        style={{
          clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-white mb-4 pr-24 leading-tight">{title}</h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-12 pr-16 md:pr-32">{description}</p>

        <div className="mt-auto flex items-center justify-between">
          <Star className="text-[#4fd1c5] fill-[#4fd1c5] w-5 h-5 animate-pulse" />
        </div>

        <div className="absolute top-1/2 right-4 -translate-y-1/2 md:-right-4 group-hover:scale-110 transition-transform duration-500">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${colorClass} shadow-xl flex items-center justify-center transform rotate-6 border-b-4 border-r-4 border-black/20`}>
            <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function EncryptFileSharePage() {
  const features: CardProps[] = [
    {
      title: "Encrypted File Share",
      description: "Transfer any file directly after authentication. Choose whether you want to send a file or join someone else's room. Each transfer uses a short-lived, peer-to-peer WebRTC room coordinated by our Bun/Elysia signaling service.",
      icon: ShieldCheck,
      colorClass: "bg-gradient-to-br from-emerald-400 to-teal-600",
    },
    {
      title: "Send File",
      description: "Create a secure WebRTC room, upload a file up to 5 GB, and share the generated room ID with your recipient. Continue to start the secure handshake process.",
      icon: UploadCloud,
      colorClass: "bg-gradient-to-br from-blue-400 to-indigo-600",
    },
    {
      title: "Join Room",
      description: "Use the room ID shared with you to join the encrypted session and receive the file directly from the sender. No middleman servers involve storing your data.",
      icon: Users,
      colorClass: "bg-gradient-to-br from-orange-400 to-red-500",
    },
    {
      title: "End-to-end flow",
      description: "1. Authenticate & land on this page. 2. Sender generates a unique room ID & shares securely. 3. Peers establish WebRTC room & exchange encrypted chunks via data channel up to 5 GB.",
      icon: Workflow,
      colorClass: "bg-gradient-to-br from-purple-400 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#eac2ff] p-6 md:p-4 font-sans flex flex-col items-center justify-center overflow-y-auto" style={{ fontFamily: dmSans }}>
      <div className="text-center mb-5 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-[#002c2d] mb-2 tracking-[1px]">Secure Transfer</h1>
        <p className="text-[#004d40] text-xs font-light tracking-widest">Serverless, encrypted, and built for speed.</p>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="h-full min-h-[250px]">
            <Card {...feature} />
          </div>
        ))}
      </div>

      {/* Footer Text */}
      {/* <div className="mt-6 text-center text-[#004d40]/60 text-sm font-semibold tracking-widest uppercase">
        Powered by Blockchain & WebRTC
      </div> */}
    </div>
  );
}
