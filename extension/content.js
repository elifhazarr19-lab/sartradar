// Bu kod doğrudan kullanıcının girdiği web sitesinin (DOM) içinde çalışır
function getPageText() {
  const pageTitle = document.title;
  
  // Şimdilik en basit yöntemle sayfanın tüm görünen metnini alıyoruz.
  // Daha sonra bu metni Page-Agent ile daha akıllıca temizleyeceğiz.
  const rawText = document.body.innerText;
  
  return {
    title: pageTitle,
    text: rawText
  };
}

// Fonksiyonu çalıştır ve sonucu popup.js'e geri yolla
getPageText();