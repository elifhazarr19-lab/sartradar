const fs = require('fs');
const dataset = require('./dataset.json');

async function runMiniEval() {
  console.log("\n=======================================================");
  console.log("📊 ŞARTRADAR MİNİ EVAL (Precision, Recall, F1)");
  console.log("=======================================================\n");

  let totalExpected = 0; // Referans risk sayısı (Gerçekte olan)
  let totalFound = 0;    // Sistemin bulduğu risk sayısı
  let truePositives = 0; // Sistemin doğru bulduğu (Doğru eşleşme)

  for (const doc of dataset) {
    console.log(`▶️ Analiz ediliyor: ${doc.source}`);
    
    try {
      const response = await fetch("http://localhost:3001/api/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: doc.text, title: doc.source })
      });
      
      const result = await response.json();
      
      const foundCount = result.analysis?.verifiedFindings?.length || 0;
      const foundCategories = result.analysis?.verifiedFindings?.map(f => f.category) || [];
      
      let docTP = 0;
      doc.expectedCategories.forEach(cat => {
        if (foundCategories.includes(cat)) docTP++;
      });

      console.log(`   - İnsan Referansı (Beklenen): ${doc.expectedRiskCount} risk (${doc.expectedCategories.join(", ") || "Yok"})`);
      console.log(`   - Sistem Çıktısı (Bulunan): ${foundCount} risk (${foundCategories.join(", ") || "Yok"})`);
      console.log(`   - Doğru Eşleşen (TP): ${docTP}\n`);

      totalExpected += doc.expectedRiskCount;
      totalFound += foundCount;
      truePositives += docTP;

    } catch (err) {
      console.error(`❌ İstek hatası: ${err.message}\n`);
    }
  }

  // Metriklerin Hesaplanması
  const falsePositives = totalFound - truePositives; 
  const falseNegatives = totalExpected - truePositives; 

  const precision = totalFound === 0 ? 0 : (truePositives / (truePositives + falsePositives));
  const recall = totalExpected === 0 ? 0 : (truePositives / (truePositives + falseNegatives));
  const f1Score = (precision + recall) === 0 ? 0 : (2 * (precision * recall) / (precision + recall));

  console.log("=======================================================");
  console.log("📈 DEĞERLENDİRME SONUÇLARI (EVAL METRICS)");
  console.log("=======================================================");
  console.log(`Toplam Referans Risk (Beklenen) : ${totalExpected}`);
  console.log(`Sistemin Toplam Bulduğu       : ${totalFound}`);
  console.log(`Doğru Yakalanan (True Positive) : ${truePositives}`);
  console.log(`Yanlış Alarm (False Positive)   : ${falsePositives}`);
  console.log(`Kaçırılan (False Negative)      : ${falseNegatives}`);
  console.log("-------------------------------------------------------");
  console.log(`🎯 Precision (Kesinlik) : ${(precision * 100).toFixed(2)}%`);
  console.log(`🎯 Recall (Duyarlılık)  : ${(recall * 100).toFixed(2)}%`);
  console.log(`🏆 F1 Skoru            : ${(f1Score * 100).toFixed(2)}%`);
  console.log("=======================================================\n");
}

runMiniEval();