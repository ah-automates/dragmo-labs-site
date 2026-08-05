import {
  Bot,
  BrainCircuit,
  Briefcase,
  Code2,
  Cpu,
  Globe,
  LayoutPanelLeft,
  MessageCircle,
  PenTool,
  Rocket,
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
  "pen-tool": PenTool,
  rocket: Rocket,
  "trending-up": TrendingUp,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
