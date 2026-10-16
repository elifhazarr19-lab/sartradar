/**
 * Page Agent Temizlik ve Ayrıştırma Modülü
 * Girdiyi güvenilmeyen veri (untrusted input) olarak kabul eder.
 */
function cleanAndExtractLegalText(rawText, title = "") {
  if (!rawText || typeof rawText !== "string") {
    return { cleanedText: "", isSufficient: false, wordCount: 0 };
  }

  // 1. Satır başı ve fazla boşluk temizliği
  let lines = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  // 2. Navigasyon gürültülerini (Ana Sayfa, Keşfet, Kitaplık, Menü, Cookie vb.) filtrele
  const noiseKeywords = [
    "ana sayfa", "keşfet", "kitaplık", "oynatma listesi", "giriş yap",
    "kaydol", "menu", "search", "ara", "privacy policy", "terms of service",
    "cookie settings", "çerez tercihleri", "tüm hakları saklıdır"
  ];

  const filteredLines = lines.filter(line => {
    // 5 kelimeden kısa ve bilinen gürültü kelimesi içeren satırları süz
    const lower = line.toLowerCase();
    const isShort = line.split(/\s+/).length <= 4;
    const containsNoise = noiseKeywords.some(keyword => lower.includes(keyword));
    return !(isShort && containsNoise);
  });

  const cleanedText = filteredLines.join("\n");
  const wordCount = cleanedText.split(/\s+/).length;

  // Hukuki metnin yeterli uzunlukta olup olmadığını kontrol et (En az 30 kelime)
  const isSufficient = wordCount >= 30;

  return {
    title,
    cleanedText,
    wordCount,
    isSufficient
  };
}

module.exports = { cleanAndExtractLegalText };