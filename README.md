# Grafik Çizim ve Veri Analizi Web Uygulaması

Modern, full-stack veri görselleştirme uygulaması. 10 farklı grafik türü, R ve Python entegrasyonu ile güçlendirilmiştir.

## 🎨 Özellikler

### 10 Grafik Türü (Her biri 10 puan)
1. **Boxplot** - Veri dağılımı ve aykırı değer analizi
2. **Scatter Plot** - İki değişken arası korelasyon
3. **Line Chart** - Zaman serisi ve trend görselleştirme
4. **Bar Chart** - Kategorik veri karşılaştırması
5. **Histogram** - Frekans dağılımı
6. **Violin Plot** - Dağılım yoğunluğu analizi
7. **Density Plot** - Sürekli olasılık dağılımı
8. **Heatmap** - Korelasyon matrisi
9. **Ridgeline Plot** - Çoklu dağılım karşılaştırması
10. **Pie Chart** - Oran ve yüzde gösterimi

### Veri Yükleme
- CSV dosyası desteği
- Excel (.xlsx) dosyası desteği
- Görsel yükleme (PNG, JPG)
- Ses dosyası yükleme (MP3, WAV)


## 📖 Kullanım

1. **Veri Yükleme**: Ana sayfada "Veri Yükle" butonuna tıklayın ve CSV/Excel dosyanızı seçin
2. **Grafik Seçimi**: 10 grafik türünden birini seçin
3. **Sütun Seçimi**: Grafikte kullanılacak sütunları belirleyin
4. **Grafik Oluştur**: "Grafik Oluştur" butonuna tıklayın
5. **Görsel/Ses Yükleme**: İsteğe bağlı olarak görsel veya ses dosyası ekleyin

## 🔧 API Endpoints

### Veri Yükleme
- `POST /api/upload/data` - CSV/Excel veri yükleme
- `POST /api/upload/image` - Görsel yükleme
- `POST /api/upload/audio` - Ses dosyası yükleme

### Grafik Oluşturma
- `POST /api/chart/boxplot` - Boxplot oluştur
- `POST /api/chart/scatter` - Scatter plot oluştur
- `POST /api/chart/line` - Line chart oluştur
- `POST /api/chart/bar` - Bar chart oluştur
- `POST /api/chart/histogram` - Histogram oluştur
- `POST /api/chart/violin` - Violin plot oluştur
- `POST /api/chart/density` - Density plot oluştur
- `POST /api/chart/heatmap` - Heatmap oluştur
- `POST /api/chart/ridgeline` - Ridgeline plot oluştur
- `POST /api/chart/pie` - Pie chart oluştur

## 📊 Örnek Veri

Titanic dataset örneği:
```csv
PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Fare
1,0,3,"Braund, Mr. Owen Harris",male,22,1,0,7.25
2,1,1,"Cumings, Mrs. John Bradley",female,38,1,0,71.2833
```

## 🎯 Teknoloji Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Grafik Motoru**: R (ggplot2) / Python (matplotlib, seaborn)
- **Veri İşleme**: csv-parser, xlsx

