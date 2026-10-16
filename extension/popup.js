document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const btn = document.getElementById("analyzeBtn");
  const loading = document.getElementById("loading");
  const resultArea = document.getElementById("resultArea");
  
  // UI Temizliği
  btn.disabled = true;
  loading.style.display = "block";
  resultArea.style.display = "none";
  document.getElementById("uncertaintyArea").style.display = "none";
  document.getElementById("scoreArea").style.display = "none";
  document.getElementById("findingsList").innerHTML = "";
  document.getElementById("summaryArea").innerText = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }, async (results) => {
      
      if (chrome.runtime.lastError || !results || !results[0]) {
        showUncertainty("Hata: Bu sayfanın yapısı okunmaya uygun değil veya kısıtlı bir sayfadasınız.");
        resetUI();
        return;
      }

      const { title, text } = results[0].result;

      try {
        // Backend'e istek at
        const response = await fetch("http://localhost:3001/api/process-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: text, title: title })
        });

        if (!response.ok) throw new Error("Sunucu bağlantı hatası");

        const data = await response.json();

        // 1. Durum: Belirsizlik (Metin çok kısa veya güvenilir analiz yok)
        if (data.success === false && data.uncertainty && data.uncertainty.isUncertain) {
          showUncertainty(data.uncertainty.reason);
        } 
        // 2. Durum: Başarılı Analiz
        else if (data.success === true && data.analysis) {
          renderAnalysis(data.analysis);
        } else {
          showUncertainty("Beklenmeyen bir hata oluştu.");
        }

      } catch (err) {
        showUncertainty("Backend sunucusuna ulaşılamadı. Sunucunun çalıştığından (node server.js) emin olun.");
      }
      
      resetUI();
    });
  } catch (err) {
    showUncertainty("Beklenmeyen bir tarayıcı hatası.");
    resetUI();
  }

  function resetUI() {
    btn.disabled = false;
    loading.style.display = "none";
    resultArea.style.display = "block";
  }

  function showUncertainty(message) {
    const box = document.getElementById("uncertaintyArea");
    box.style.display = "block";
    box.innerHTML = `<strong>Belirsiz Durum:</strong><br>${message}`;
  }

  function renderAnalysis(analysis) {
    // Belirsizlik varsa en üste uyarı koy
    if (analysis.uncertainty.isUncertain) {
      showUncertainty(analysis.uncertainty.reason);
    }

    // Skor ve Özet
    document.getElementById("scoreArea").style.display = "block";
    document.getElementById("riskScoreValue").innerText = analysis.riskScore;
    document.getElementById("summaryArea").innerText = analysis.summaryTr || "Rapor özeti bulunamadı.";

    // Bulguları (Riskleri) listele
    const list = document.getElementById("findingsList");
    if (analysis.verifiedFindings && analysis.verifiedFindings.length > 0) {
      analysis.verifiedFindings.forEach(f => {
        const item = document.createElement("div");
        item.className = "finding-card";
        item.innerHTML = `
          <div class="finding-title">Risk Kategorisi: ${f.category} (${f.severity})</div>
          <div class="finding-quote">"${f.quote}"</div>
          <div class="finding-desc"><strong>Açıklama:</strong> ${f.explanationTr} <br> <strong>Etkisi:</strong> ${f.whyItMattersTr}</div>
        `;
        list.appendChild(item);
      });
    } else {
      list.innerHTML = `<div style="font-size:12px; color:#666;">Doğrulanmış spesifik bir riskli madde bulunamadı.</div>`;
    }
  }
});