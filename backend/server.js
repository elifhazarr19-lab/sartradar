const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { cleanAndExtractLegalText } = require("./pageAgentHelper");
const { analyzeLegalTextWithLLM } = require("./llmService");
const { verifyAndScoreReport } = require("./verifier");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "ŞartRadar Backend", timestamp: new Date() });
});

app.post("/api/process-text", async (req, res) => {
  try {
    const { rawText, title } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "Girdi metni boş olamaz." });
    }

    // 1. Adım: Page Agent Temizlik Modülü
    const parsedData = cleanAndExtractLegalText(rawText, title);

    if (!parsedData.isSufficient) {
      return res.json({
        success: false,
        uncertainty: {
          isUncertain: true,
          reason: "Sayfadaki metin hukuki bir analiz yapmak için yetersiz veya okunamıyor."
        },
        data: parsedData
      });
    }

    // 2. Adım: LLM Analizi ve JSON Schema Doğrulaması
    const llmResult = await analyzeLegalTextWithLLM(parsedData.cleanedText, title);

    if (!llmResult.success) {
      return res.json({
        success: false,
        error: "LLM çıktısı doğrulanamadı.",
        details: llmResult.error
      });
    }

    // 3. Adım: Birebir Alıntı Doğrulaması ve Deterministik Skor Hesaplama
    const verification = verifyAndScoreReport(llmResult.data, parsedData.cleanedText);

    res.json({
      success: true,
      analysis: {
        documentType: llmResult.data.documentType,
        summaryTr: llmResult.data.summaryTr,
        riskScore: verification.score,
        verifiedFindings: verification.verifiedFindings,
        rejectedFindings: verification.rejectedFindings,
        uncertainty: {
          isUncertain: verification.hasUncertainty,
          reason: verification.uncertaintyReason
        }
      }
    });

  } catch (error) {
    console.error("Analiz sürecinde hata:", error);
    res.status(500).json({ error: "Sunucu tarafında işlem hatası oluştu." });
  }
});

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`🚀 [ŞartRadar Backend V2] Çalışıyor`);
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`=================================\n`);
});