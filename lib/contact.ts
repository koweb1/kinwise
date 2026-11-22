export const CONTACT_EMAIL = "Kinwisegraphic@gmail.com";
export const WHATSAPP_NUMBER = "2349136150692";
export const WHATSAPP_DISPLAY = "+234 913 615 0692";

export const SERVICE_OPTIONS = [
  { id: "graphic-design", label: "Graphic Design" },
  { id: "branding", label: "Branding & Visual Identity" },
  { id: "motion-design", label: "Motion Design" },
  { id: "video-editing", label: "Video Editing" },
  { id: "not-sure", label: "Not sure yet" },
] as const;

export type ServiceId = (typeof SERVICE_OPTIONS)[number]["id"];

// Placeholder ranges: replace them with the client's real ones
export const BUDGET_OPTIONS = [
  "Under ₦100,000",
  "₦100,000 – ₦300,000",
  "₦300,000 – ₦700,000",
  "₦700,000 – ₦1,500,000",
  "₦1,500,000+",
] as const;

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/kinwise.editz/" },
  { label: "TikTok", href: "https://www.tiktok.com/@kinwise.1" },
  { label: "Facebook", href: "https://www.facebook.com/share/19wxrvroSH/" },
];

export const serviceLabel = (id: string) =>
  SERVICE_OPTIONS.find((option) => option.id === id)?.label ?? id;

export type InquiryDetails = {
  name?: string;
  services: ServiceId[];
  budget?: string;
  message?: string;
};

// Builds the click-to-chat link: WhatsApp opens with this message already typed in
export function buildWhatsAppUrl(details: InquiryDetails) {
  const lines = ["Hi Kinwise, I’d like to start a project."];

  if (details.name?.trim()) lines.push("", `Name: ${details.name.trim()}`);
  if (details.services.length > 0) {
    lines.push(`Services: ${details.services.map(serviceLabel).join(", ")}`);
  }
  // The budget only counts when a single service is chosen
  if (details.services.length === 1 && details.budget) {
    lines.push(`Budget: ${details.budget}`);
  }
  if (details.message?.trim()) lines.push("", details.message.trim());

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}