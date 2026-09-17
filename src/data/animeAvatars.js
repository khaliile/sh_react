export function getAvatarPath(id) {
  if (!id) return '';
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}avatars/${id}.jpg`;
}

export const ANILIST_FALLBACK_URLS = {
  // === One Piece ===
  luffy: 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
  zoro: 'https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png',
  law: 'https://s4.anilist.co/file/anilistcdn/character/large/b13767-U604OJN9dxCn.jpg',
  ace: 'https://s4.anilist.co/file/anilistcdn/character/large/b2072-Lc6jEdsueJUK.jpg',
  shanks: 'https://s4.anilist.co/file/anilistcdn/character/large/b727-wUJx7M1z5xON.png',
  sanji: 'https://s4.anilist.co/file/anilistcdn/character/large/b305-6lisPmHtCnLT.png',
  nami: 'https://s4.anilist.co/file/anilistcdn/character/large/b723-vp5hPptgnNEC.png',
  robin: 'https://s4.anilist.co/file/anilistcdn/character/large/b61-ywXUyyocEEqt.png',
  kaido: 'https://s4.anilist.co/file/anilistcdn/character/large/b123616-V0V64v8wE827.jpg',
  whitebeard: 'https://s4.anilist.co/file/anilistcdn/character/large/b2075-K9Kz5G8hT9U3.png',
  teach: 'https://s4.anilist.co/file/anilistcdn/character/large/b2076-0M7NfB8XF1xU.png',

  // === Jujutsu Kaisen ===
  gojo: 'https://s4.anilist.co/file/anilistcdn/character/large/b127506-cTxY2vjAOmH8.png',
  sukuna: 'https://s4.anilist.co/file/anilistcdn/character/large/b131980-V5K6YyQ4V4w7.png',
  nanami: 'https://s4.anilist.co/file/anilistcdn/character/large/b133703-xH4J2hJ1X2k8.png',
  itadori: 'https://s4.anilist.co/file/anilistcdn/character/large/b127508-l4B4Y6v3n2x9.png',
  megumi: 'https://s4.anilist.co/file/anilistcdn/character/large/b127509-U7g6Y2v1x8n4.png',
  nobara: 'https://s4.anilist.co/file/anilistcdn/character/large/b127510-t4K6Y8v2x1n5.png',
  toji: 'https://s4.anilist.co/file/anilistcdn/character/large/b144246-k8J2h4X1n7v3.png',
  geto: 'https://s4.anilist.co/file/anilistcdn/character/large/b133702-M4K6Y8v2x1n5.png',

  // === Naruto ===
  itachi: 'https://s4.anilist.co/file/anilistcdn/character/large/b14-w4N0K3s0K2s0.png',
  madara: 'https://s4.anilist.co/file/anilistcdn/character/large/b17336-X8h2K4v1n7v3.png',
  kakashi: 'https://s4.anilist.co/file/anilistcdn/character/large/b85-w4N0K3s0K2s0.png',
  naruto: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-w4N0K3s0K2s0.png',
  sasuke: 'https://s4.anilist.co/file/anilistcdn/character/large/b13-w4N0K3s0K2s0.png',
  minato: 'https://s4.anilist.co/file/anilistcdn/character/large/b1548-w4N0K3s0K2s0.png',
  pain: 'https://s4.anilist.co/file/anilistcdn/character/large/b3180-w4N0K3s0K2s0.png',

  // === Solo Leveling ===
  jinwoo: 'https://s4.anilist.co/file/anilistcdn/character/large/b125927-V0V64v8wE827.jpg',
  cha_hae_in: 'https://s4.anilist.co/file/anilistcdn/character/large/b134633-K8J2h4X1n7v3.png',

  // === Death Note ===
  light: 'https://s4.anilist.co/file/anilistcdn/character/large/b80-V0V64v8wE827.png',
  l: 'https://s4.anilist.co/file/anilistcdn/character/large/b71-V0V64v8wE827.png',

  // === Bleach ===
  ichigo: 'https://s4.anilist.co/file/anilistcdn/character/large/b5-a7bkJgjhhigE.png',
  aizen: 'https://s4.anilist.co/file/anilistcdn/character/large/b1086-qR9218BjZTC0.png',
  rukia: 'https://s4.anilist.co/file/anilistcdn/character/large/b6-25WoBeWMZXBc.png',
  byakuya: 'https://s4.anilist.co/file/anilistcdn/character/large/b907-kgnDKeMtEN5y.png',
  urahara: 'https://s4.anilist.co/file/anilistcdn/character/large/b210-mw01NrQfRjzT.png',
  kenpachi: 'https://s4.anilist.co/file/anilistcdn/character/large/b909-slhoFBon7oiH.jpg',

  // === Attack on Titan ===
  levi: 'https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png',
  eren: 'https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg',
  mikasa: 'https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png',
  erwin: 'https://s4.anilist.co/file/anilistcdn/character/large/b46496-Mu86MENd5wNB.png',
  armin: 'https://s4.anilist.co/file/anilistcdn/character/large/b46494-g7xYYuBtYPnO.png',

  // === Hunter x Hunter ===
  killua: 'https://s4.anilist.co/file/anilistcdn/character/large/b27-Z5O02kQUydpT.jpg',
  chrollo: 'https://s4.anilist.co/file/anilistcdn/character/large/b58-USOmsz3nursi.jpg',
  gon: 'https://s4.anilist.co/file/anilistcdn/character/large/b30-lyFExKyDhefc.jpg',
  kurapika: 'https://s4.anilist.co/file/anilistcdn/character/large/b28-ivA7UGnfE40a.png',
  hisoka: 'https://s4.anilist.co/file/anilistcdn/character/large/b31-FZckOuu7L1un.png',
  meruem: 'https://s4.anilist.co/file/anilistcdn/character/large/b24888-K8J2h4X1n7v3.png',

  // === Demon Slayer ===
  tanjiro: 'https://s4.anilist.co/file/anilistcdn/character/large/b126071-K8J2h4X1n7v3.png',
  nezuko: 'https://s4.anilist.co/file/anilistcdn/character/large/b126072-K8J2h4X1n7v3.png',
  rengoku: 'https://s4.anilist.co/file/anilistcdn/character/large/b138123-K8J2h4X1n7v3.png',
  giyu: 'https://s4.anilist.co/file/anilistcdn/character/large/b127532-K8J2h4X1n7v3.png',

  // === Dragon Ball ===
  goku: 'https://s4.anilist.co/file/anilistcdn/character/large/b246-K8J2h4X1n7v3.png',
  vegeta: 'https://s4.anilist.co/file/anilistcdn/character/large/b247-K8J2h4X1n7v3.png',
};