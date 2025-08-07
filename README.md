# 📝 Quick Note

> **Hızlı ve Modern Masaüstü Not Alma Uygulaması**

Quick Note, Windows için geliştirilmiş minimal ve güçlü bir not alma uygulamasıdır. Global kısayollarla anında erişim, gerçek zamanlı senkronizasyon ve kullanıcı dostu arayüzü ile günlük notlarınızı kolayca yönetin.

![Quick Note Demo](https://via.placeholder.com/800x400/0f0f23/ffffff?text=Quick+Note+Demo)

## ✨ Özellikler

### 🚀 **Hızlı Erişim**
- **Global Kısayollar:** `Ctrl+Shift+N` ile anında not penceresi
- **Geçmiş Erişimi:** `Ctrl+Alt+N` ile not geçmişi
- **Sistem Tray:** Arka planda sessizce çalışır
- **Otomatik Başlatma:** PC açılışında otomatik başlar

### 💾 **Akıllı Kaydetme**
- **Otomatik Kaydetme:** 1 saniye gecikmeyle otomatik kayıt
- **Manuel Kaydetme:** `Ctrl+Enter` ile kaydet ve kapat
- **Gerçek Zamanlı Sync:** Notlar anında geçmişe eklenir
- **Güvenli Depolama:** Yerel JSON dosyasında güvenle saklanır

### 🎨 **Modern Arayüz**
- **Glassmorphism Tasarım:** Şık ve modern görünüm
- **Responsive UI:** Pencere boyutlandırma desteği
- **Smooth Animasyonlar:** Akıcı geçişler ve efektler
- **Dark Theme:** Göz dostu koyu tema

### 🏷️ **Gelişmiş Özellikler**
- **Hashtag Desteği:** `#etiket` formatında etiketleme
- **Arama Fonksiyonu:** Notlarda ve etiketlerde arama
- **Düzenleme Modu:** Inline not düzenleme
- **Silme Koruması:** Onay diyalogu ile güvenli silme

## 🛠️ Teknoloji Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Desktop:** Electron 30
- **Build:** electron-builder
- **Styling:** CSS-in-JS + CSS Variables
- **Data:** Local JSON Storage

## 📦 Kurulum

### Option 1: Setup Dosyası (Önerilen)
1. [Releases](https://github.com/samet/quicknote/releases) sayfasından en son sürümü indirin
2. `Quick Note-Windows-X.X.X-Setup.exe` dosyasını çalıştırın
3. Kurulum tamamlandıktan sonra uygulama otomatik başlatılacak

### Option 2: Kaynak Koddan Build
```bash
# Repository'yi klonlayın
git clone https://github.com/samet/quicknote.git
cd quicknote

# Bağımlılıkları yükleyin
npm install

# Development modunda çalıştırın
npm run dev

# Production build
npm run build
```

## 🎮 Kullanım

### **Temel Kısayollar**
| Kısayol | Açıklama |
|---------|----------|
| `Ctrl+Shift+N` | Hızlı not penceresi aç/kapat |
| `Ctrl+Alt+N` | Geçmiş penceresini aç |
| `Ctrl+Enter` | Notu kaydet ve pencereyi kapat |
| `Ctrl+H` | Geçmiş penceresini aç (not penceresinden) |
| `Ctrl+N` | Yeni not oluştur (geçmiş penceresinden) |
| `Esc` | Pencereyi kapat |

### **Not Yazma İpuçları**
- Yazdığınız notlar otomatik olarak 1 saniye sonra kaydedilir
- `#etiket` formatında etiketler ekleyebilirsiniz
- Geçmiş penceresinde etiketlere tıklayarak filtreleme yapabilirsiniz
- Notlar tarih sırasına göre otomatik sıralanır

## 📱 Sistem Gereksinimleri

- **İşletim Sistemi:** Windows 10/11 (x64)
- **RAM:** 100 MB
- **Disk Alanı:** 150 MB
- **.NET Framework:** Gerekli değil

## 🔄 Changelog

### v0.0.4 (En Son) - Geçmiş Sorunu Düzeltildi ⚡
- ✅ **Ana Düzeltme:** Geçmiş kısmında "localeCompare" hatası çözüldü
- ✅ **Migration System:** Eski notlar otomatik güncelleniyor
- ✅ **Güvenli Sıralama:** Eksik tarih alanları için fallback
- ✅ **Debug Logları:** Sorun tespiti için detaylı loglar
- ✅ **Gerçek Zamanlı Sync:** Notlar anında geçmişte görünüyor

### v0.0.3 - Event System İyileştirmesi 🔧
- ✅ IPC event listening sorunu düzeltildi
- ✅ Real-time history update eklendi
- ✅ Tray icon geri eklendi
- ✅ Auto-start functionality

### v0.0.2 - UI/UX İyileştirmeleri 🎨
- ✅ Modern glassmorphism tasarım
- ✅ Geçmiş penceresine "Yeni Not" butonu
- ✅ Keyboard shortcuts (Ctrl+N)
- ✅ Refined note saving behavior

### v0.0.1 - İlk Sürüm 🚀
- ✅ Temel not alma functionality
- ✅ Global shortcuts (Ctrl+Shift+N, Ctrl+Alt+N)
- ✅ Otomatik kaydetme
- ✅ JSON tabanlı local storage
- ✅ Hashtag desteği

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen şu adımları takip edin:

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 👤 Geliştirici

**Samet GURTUNA** - [GitHub](https://github.com/sametgurtuna)

## 🙏 Teşekkürler

- [Electron](https://electronjs.org/) - Desktop app framework
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [electron-builder](https://www.electron.build/) - Package and distribute

---

<div align="center">
  <strong>🚀 Quick Note ile not almayı hızlandırın!</strong>
  <br><br>
  <a href="https://github.com/sametgurtuna/QuickNote/releases">💾 Download</a> |
  <a href="#">🐛 Report Bug</a> |
  <a href="#">💡 Request Feature</a>
</div>
