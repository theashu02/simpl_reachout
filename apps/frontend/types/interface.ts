import { EncryptSharing, EncryptSocial, HyperMail } from "@/lib/utils";

export interface FeatureTheme {
  surface: string;
  text: string;
  hoverGradient: string;
  accent: string;
}

export interface FeatureDefinition {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  description: string;
  image: string;
  theme: FeatureTheme;
}

export type Feature = (typeof features)[number];

export interface FeatureCardProps {
  feature: Feature;
}

export const features = [
  {
    id: "encrypt-file-hare",
    title: "Start Building",
    subtitle: "Encrypt File Hare",
    route: "/products/EncryptFileShare",
    description: "Secure your sensitive documents with military-grade encryption instantly.",
    image: EncryptSharing,
    theme: {
      surface: "from-[#130644] via-[#1f0f64] to-[#2d1b7c]",
      text: "text-white",
      hoverGradient: "from-[#6ff6ff]/90 via-[#a377ff]/90 to-[#ff6ffa]/90",
      accent: "text-white/80",
    },
  },
  {
    id: "hyper-mail",
    title: "Explore the Ecosystem",
    subtitle: "Hyper Mail",
    route: "/products/hyper-mail",
    description: "The fastest, most secure decentralized messaging protocol engineered for scale.",
    image: HyperMail,
    theme: {
      surface: "from-[#20005a] via-[#31048e] to-[#4a11c9]",
      text: "text-white",
      hoverGradient: "from-[#62d2ff]/80 via-[#8a7dff]/80 to-[#ff8cfa]/80",
      accent: "text-white/75",
    },
  },
  {
    id: "encrypt-social",
    title: "Institutional Inquiries",
    subtitle: "Encrypt Social",
    route: "/products/encrypt-social",
    description: "Social networking reimagined with end-to-end encryption and privacy at the core.",
    image: EncryptSocial,
    theme: {
      surface: "from-[#ffd8ff] via-[#f4baff] to-[#f4a4ff]",
      text: "text-[#1a1133]",
      hoverGradient: "from-[#ffd993]/80 via-[#ffb1df]/80 to-[#f5a7ff]/80",
      accent: "text-[#2b1952]/70",
    },
  },
] as const satisfies FeatureDefinition[];