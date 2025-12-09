const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'dataFile') {
            uploadPath += 'data/';
        } else if (file.fieldname === 'imageFile') {
            uploadPath += 'images/';
        } else if (file.fieldname === 'audioFile') {
            uploadPath += 'audio/';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload data file (CSV or Excel)
router.post('/data', upload.single('dataFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Dosya yüklenmedi!' });
        }

        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let data = [];
        let columns = [];

        if (ext === '.csv') {
            // Parse CSV
            data = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', reject);
            });

            if (data.length > 0) {
                columns = Object.keys(data[0]);
            }
        } else if (ext === '.xlsx' || ext === '.xls') {
            // Parse Excel
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length > 0) {
                columns = Object.keys(data[0]);
            }
        } else {
            return res.status(400).json({ error: 'Desteklenmeyen dosya formatı! (.csv veya .xlsx kullanın)' });
        }

        // Save parsed data as JSON for easy access
        const jsonPath = filePath.replace(path.extname(filePath), '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

        res.json({
            success: true,
            message: 'Veri başarıyla yüklendi!',
            filename: req.file.filename,
            rowCount: data.length,
            columns: columns,
            preview: data.slice(0, 5),
            dataPath: jsonPath
        });
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        res.status(500).json({ error: 'Veri işlenirken hata oluştu!', details: error.message });
    }
});

// Helper function to detect chart type from filename
function detectChartType(filename) {
    const lowerFilename = filename.toLowerCase();

    const chartTypes = {
        'bar': { name: 'Bar Chart', keywords: ['bar', '막대', '막대그래프'] },
        'line': { name: 'Line Chart', keywords: ['line', 'çizgi', 'trend'] },
        'scatter': { name: 'Scatter Plot', keywords: ['scatter', 'nokta', 'dağılım'] },
        'pie': { name: 'Pie Chart', keywords: ['pie', 'pasta', 'dilim'] },
        'histogram': { name: 'Histogram', keywords: ['histogram', 'dağılım', 'frekans'] },
        'boxplot': { name: 'Box Plot', keywords: ['box', 'kutu', 'boxplot'] },
        'violin': { name: 'Violin Plot', keywords: ['violin', 'keman'] },
        'heatmap': { name: 'Heatmap', keywords: ['heat', 'ısı', 'heatmap'] },
        'density': { name: 'Density Plot', keywords: ['density', 'yoğunluk'] },
        'area': { name: 'Area Chart', keywords: ['area', 'alan', 'alansal'] }
    };

    for (const [type, info] of Object.entries(chartTypes)) {
        for (const keyword of info.keywords) {
            if (lowerFilename.includes(keyword)) {
                return { type, name: info.name };
            }
        }
    }

    return null;
}

// Upload image file
router.post('/image', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Görsel yüklenmedi!' });
        }

        // Detect chart type from filename
        const detectedChart = detectChartType(req.file.originalname);

        const supportedCharts = [
            { type: 'bar', name: 'Bar Chart (Sütun Grafik)' },
            { type: 'line', name: 'Line Chart (Çizgi Grafik)' },
            { type: 'scatter', name: 'Scatter Plot (Nokta Grafik)' },
            { type: 'pie', name: 'Pie Chart (Pasta Grafik)' },
            { type: 'histogram', name: 'Histogram (Dağılım Grafik)' },
            { type: 'boxplot', name: 'Box Plot (Kutu Grafik)' },
            { type: 'violin', name: 'Violin Plot (Keman Grafik)' },
            { type: 'heatmap', name: 'Heatmap (Isı Haritası)' },
            { type: 'density', name: 'Density Plot (Yoğunluk Grafik)' },
            { type: 'area', name: 'Area Chart (Alan Grafik)' }
        ];

        res.json({
            success: true,
            message: 'Görsel başarıyla yüklendi!',
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: `/uploads/images/${req.file.filename}`,
            size: req.file.size,
            detectedChartType: detectedChart,
            supportedChartTypes: supportedCharts,
            info: detectedChart
                ? `✅ Bu bir ${detectedChart.name} gibi görünüyor!`
                : '❓ Grafik türü tespit edilemedi. Dosya adında grafik türü belirtin (örn: bar_chart.png)'
        });
    } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        res.status(500).json({ error: 'Görsel yüklenirken hata oluştu!', details: error.message });
    }
});

// Upload audio file
router.post('/audio', upload.single('audioFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Ses dosyası yüklenmedi!' });
        }

        res.json({
            success: true,
            message: 'Ses dosyası başarıyla yüklendi!',
            filename: req.file.filename,
            path: `/uploads/audio/${req.file.filename}`,
            size: req.file.size
        });
    } catch (error) {
        console.error('Ses yükleme hatası:', error);
        res.status(500).json({ error: 'Ses dosyası yüklenirken hata oluştu!', details: error.message });
    }
});

module.exports = router;
