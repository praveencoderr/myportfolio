import { SiWhatsapp } from "react-icons/si";

function normalizePhone(phone?: string) {
  return phone?.replace(/\D/g, "");
}

const FloatingWhatsApp = ({
  phone,
  message,
}: {
  phone?: string;
  message?: string;
}) => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const href = message
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${normalizedPhone}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[5000] inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400 text-black-100 shadow-lg shadow-emerald-950/30 transition hover:-translate-y-1 hover:bg-emerald-300 md:bottom-8 md:right-8"
    >
      <SiWhatsapp className="h-6 w-6" />
    </a>
  );
};

export default FloatingWhatsApp;
