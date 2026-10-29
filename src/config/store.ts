export const store = {
  name: "Rafinha Tabacaria",
  whatsappNumber: "5593991529171",
  phoneDisplay: "(93) 99152-9171",
  instagramHandle: "rafinhatbc",
} as const;

export function getWhatsAppUrl(message = "Olá! Vim pelo site da Rafinha Tabacaria.") {
  return `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const instagramUrl = `https://www.instagram.com/${store.instagramHandle}/`;
