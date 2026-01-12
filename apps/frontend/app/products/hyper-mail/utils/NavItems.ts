import { FileText, UploadCloud, Share2, Mail, Settings, ScanSearch, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/products/hyper-mail",
    icon: FileText,
  },
  {
    label: "Send File",
    href: "/products/hyper-mail/send",
    icon: UploadCloud,
  },
  {
    label: "Integrations",
    href: "/products/hyper-mail/integrations",
    icon: Share2,
  },
  {
    label: "Finder",
    href: "/products/hyper-mail/finder",
    icon: ScanSearch,
  },
  {
    label: "Generate ID",
    href: "/products/hyper-mail/generateid",
    icon: Settings,
  },
  {
    label: "Messages",
    href: "/products/hyper-mail/messages",
    icon: Mail,
    disabled: true,
  }
];
