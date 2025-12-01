import { FileText, UploadCloud, Share2, Mail, Settings, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/products/EncryptFileShare",
    icon: FileText,
  },
  {
    label: "Send File",
    href: "/products/EncryptFileShare/send",
    icon: UploadCloud,
  },
  {
    label: "Join Room",
    href: "/products/EncryptFileShare/join",
    icon: Share2,
  },
  {
    label: "Messages",
    href: "/products/EncryptFileShare/messages",
    icon: Mail,
    disabled: true,
  },
  {
    label: "Settings",
    href: "/products/EncryptFileShare/settings",
    icon: Settings,
    disabled: true,
  },
];
