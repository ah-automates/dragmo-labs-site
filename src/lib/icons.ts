import {
  Bot,
  BrainCircuit,
  Briefcase,
  Code2,
  Cpu,
  Globe,
  LayoutPanelLeft,
  MessageCircle,
  MessageSquareText,
  PenTool,
  PhoneCall,
  Receipt,
  Rocket,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon components cannot cross the server/client boundary as props, so
 * server components pass a string key and client components resolve it here.
 */
export const iconMap = {
  bot: Bot,
  "brain-circuit": BrainCircuit,
  briefcase: Briefcase,
  code: Code2,
  cpu: Cpu,
  globe: Globe,
  "layout-panel-left": LayoutPanelLeft,
  "message-circle": MessageCircle,
  "message-square-text": MessageSquareText,
  "pen-tool": PenTool,
  "phone-call": PhoneCall,
  receipt: Receipt,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  "trending-up": TrendingUp,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
