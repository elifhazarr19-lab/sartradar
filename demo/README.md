# ŞartRadar - Sözleşme ve Gizlilik Analiz Aracı

ŞartRadar, kullanıcıların web sitelerindeki uzun ve karmaşık kullanım koşullarını (ToS), gizlilik politikalarını ve abonelik şartlarını analiz ederek anlaşılır bir "Risk Raporu" çıkaran bir Chrome uzantısıdır.

## 📌 Çözülen Problem
Kullanıcılar uzun sözleşmeleri okumadan kabul etmektedir. Bu proje, "Kabul Ediyorum" butonuna basmadan önce kullanıcıyı otomatik abonelikler, veri satışı ve iptal/iade zorlukları gibi riskli maddelere karşı **birebir kanıta (orijinal metinden alıntıya) dayalı** şekilde uyarır.

## ⚙️ Mimari ve Veri Akışı
Sistem "Client-Server" (İstemci-Sunucu) mimarisiyle tasarlanmıştır. Tarayıcı eklentisi sayfayı okur, Backend (Sunucu) ise güvenli doğrulama ve LLM işlemlerini yapar.

```mermaid
graph TD
    A[Kullanıcı Chrome Eklentisi] -->|Sayfa HTML/Metni| B[Express Backend API]
    B --> C[Page Agent Temizleyici]
    C -->|Gürültü filtrelenir| D[LLM İstemi + Anti-Injection]
    D -->|Sadece JSON| E[Gemini AI]
    E -->|Riskler ve Alıntılar| F[JSON Schema & AJV Doğrulayıcı]
    F -->|Geçersizse Reddet| G[Birebir Alıntı Doğrulayıcı]
    G -->|Onaylanmış Bulgular| H[Deterministik Skor Hesaplayıcı]
    H -->|Nihai Rapor| A