const SEVERITY_WEIGHTS = {
  low: 10,
  medium: 20,
  high: 35
};

function verifyAndScoreReport(parsedJSON, originalText) {
  if (!parsedJSON || !Array.isArray(parsedJSON.findings)) {
    return {
      isValid: false,
      reason: "Geçersiz veya eksik bulgu listesi.",
      report: null
    };
  }

  const verifiedFindings = [];
  const rejectedFindings = [];

  // Metni ve alıntıları karşılaştırma kolaylığı için boşluklardan arındır
  const normalizedSource = originalText.replace(/\s+/g, " ").toLowerCase();

  for (const finding of parsedJSON.findings) {
    if (!finding.quote) continue;
    
    const normalizedQuote = finding.quote.replace(/\s+/g, " ").trim().toLowerCase();

    // Birebir alıntı kontrolü
    if (normalizedSource.includes(normalizedQuote)) {
      verifiedFindings.push(finding);
    } else {
      rejectedFindings.push({
        finding,
        reason: "Alıntı kaynak metinde birebir bulunamadı (Sahte/Değiştirilmiş alıntı)."
      });
    }
  }

  // Deterministik Risk Skoru Hesaplama
  let rawScore = 0;
  verifiedFindings.forEach(item => {
    rawScore += SEVERITY_WEIGHTS[item.severity] || 10;
  });

  // Skor maksimum 100 ile sınırlandırılır
  const finalScore = Math.min(rawScore, 100);

  return {
    isValid: true,
    score: finalScore,
    verifiedFindings,
    rejectedFindings,
    hasUncertainty: verifiedFindings.length === 0 || parsedJSON.uncertainty?.isUncertain === true,
    uncertaintyReason: parsedJSON.uncertainty?.reason || (verifiedFindings.length === 0 ? "Doğrulanmış riskli madde bulunamadı." : null)
  };
}

module.exports = { verifyAndScoreReport };