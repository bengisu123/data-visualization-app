// Global state
let uploadedData = null;
let selectedChartType = null;
let dataPath = null;

// API base URL
const API_URL = 'http://localhost:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Data file upload
    const dataFile = document.getElementById('dataFile');
    const dataUploadArea = document.getElementById('dataUploadArea');

    dataFile.addEventListener('change', handleDataUpload);

    // Drag and drop
    dataUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dataUploadArea.classList.add('dragover');
    });

    dataUploadArea.addEventListener('dragleave', () => {
        dataUploadArea.classList.remove('dragover');
    });

    dataUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dataUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            dataFile.files = files;
            handleDataUpload();
        }
    });

    // Chart type selection
    const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
    chartTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chartTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedChartType = btn.dataset.type;
            updateColumnSelection();
        });
    });

    // Generate chart button
    document.getElementById('generateBtn').addEventListener('click', generateChart);

    // Image upload
    document.getElementById('imageFile').addEventListener('change', handleImageUpload);

    // Audio upload
    document.getElementById('audioFile').addEventListener('change', handleAudioUpload);
}

// Handle data file upload
async function handleDataUpload() {
    const fileInput = document.getElementById('dataFile');
    const file = fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('dataFile', file);

    showLoading('Veri yükleniyor...');

    try {
        const response = await fetch(`${API_URL}/upload/data`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            uploadedData = result;
            dataPath = result.dataPath;
            showToast('Veri başarıyla yüklendi!', 'success');
            displayDataInfo(result);
            updateColumnSelects(result.columns);
        } else {
            showToast(result.error || 'Veri yüklenemedi!', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Veri yükleme hatası!', 'error');
    } finally {
        hideLoading();
    }
}

// Display data info
function displayDataInfo(data) {
    const dataInfo = document.getElementById('dataInfo');
    dataInfo.style.display = 'block';
    dataInfo.innerHTML = `
        <div style="background: rgba(72, 187, 120, 0.1); padding: 1rem; border-radius: 12px; border-left: 4px solid #48bb78;">
            <strong>✅ ${data.filename}</strong><br>
            <small>${data.rowCount} satır, ${data.columns.length} sütun</small>
        </div>
    `;

    // Show info section
    const infoSection = document.getElementById('infoSection');
    const dataInfoGrid = document.getElementById('dataInfoGrid');
    infoSection.style.display = 'block';

    dataInfoGrid.innerHTML = `
        <div class="info-item">
            <div class="label">Toplam Satır</div>
            <div class="value">${data.rowCount}</div>
        </div>
        <div class="info-item">
            <div class="label">Toplam Sütun</div>
            <div class="value">${data.columns.length}</div>
        </div>
        <div class="info-item">
            <div class="label">Dosya Adı</div>
            <div class="value" style="font-size: 1rem;">${data.filename}</div>
        </div>
    `;
}

// Update column selects
function updateColumnSelects(columns) {
    const xColumn = document.getElementById('xColumn');
    const yColumn = document.getElementById('yColumn');
    const groupColumn = document.getElementById('groupColumn');

    // Clear existing options
    xColumn.innerHTML = '';
    yColumn.innerHTML = '';
    groupColumn.innerHTML = '<option value="">Seçiniz...</option>';

    // Add columns
    columns.forEach(col => {
        xColumn.add(new Option(col, col));
        yColumn.add(new Option(col, col));
        groupColumn.add(new Option(col, col));
    });

    // Auto-select first two columns
    if (columns.length >= 2) {
        yColumn.selectedIndex = 1;
    }
}

// Update column selection based on chart type
function updateColumnSelection() {
    const columnSelection = document.getElementById('columnSelection');
    const yColumnGroup = document.getElementById('yColumnGroup');
    const groupColumnGroup = document.getElementById('groupColumnGroup');

    if (!uploadedData || !selectedChartType) return;

    columnSelection.style.display = 'block';

    // Show/hide columns based on chart type
    if (selectedChartType === 'histogram' || selectedChartType === 'density') {
        yColumnGroup.style.display = 'none';
        groupColumnGroup.style.display = 'block';
    } else if (selectedChartType === 'heatmap') {
        yColumnGroup.style.display = 'none';
        groupColumnGroup.style.display = 'none';
    } else if (selectedChartType === 'pie') {
        yColumnGroup.style.display = 'none';
        groupColumnGroup.style.display = 'none';
    } else {
        yColumnGroup.style.display = 'block';
        groupColumnGroup.style.display = 'block';
    }
}

// Generate chart
async function generateChart() {
    if (!uploadedData || !selectedChartType) {
        showToast('Lütfen veri yükleyin ve grafik türü seçin!', 'error');
        return;
    }

    const xColumn = document.getElementById('xColumn').value;
    const yColumn = document.getElementById('yColumn').value;
    const groupColumn = document.getElementById('groupColumn').value;
    const title = document.getElementById('chartTitle').value || `${selectedChartType.charAt(0).toUpperCase() + selectedChartType.slice(1)} Chart`;

    showLoading('Grafik oluşturuluyor...');

    try {
        const response = await fetch(`${API_URL}/chart/${selectedChartType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataPath: dataPath,
                xColumn: xColumn,
                yColumn: yColumn,
                groupColumn: groupColumn,
                title: title
            })
        });

        const result = await response.json();

        if (result.success) {
            displayChart(result.image);
            showToast('Grafik başarıyla oluşturuldu!', 'success');
        } else {
            showToast(result.error || 'Grafik oluşturulamadı!', 'error');
        }
    } catch (error) {
        console.error('Chart generation error:', error);
        showToast('Grafik oluşturma hatası!', 'error');
    } finally {
        hideLoading();
    }
}

// Display chart
function displayChart(imageData) {
    const chartPreview = document.getElementById('chartPreview');
    chartPreview.innerHTML = `<img src="${imageData}" alt="Generated Chart">`;
}

// Handle image upload
async function handleImageUpload() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('imageFile', file);

    showLoading('Görsel analiz ediliyor...');

    try {
        const response = await fetch(`${API_URL}/upload/image`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            let message = 'Görsel başarıyla yüklendi!';

            // Display chart type detection results
            const chartPreview = document.getElementById('chartPreview');
            let detectionHTML = `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 16px; color: white; margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 1rem 0;">📊 Grafik Analizi</h3>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                        <strong>Dosya:</strong> ${result.originalName}<br>
                        <strong>Boyut:</strong> ${(result.size / 1024).toFixed(2)} KB
                    </div>
            `;

            if (result.detectedChartType) {
                detectionHTML += `
                    <div style="background: rgba(72, 187, 120, 0.2); padding: 1rem; border-radius: 12px; border-left: 4px solid #48bb78;">
                        <h4 style="margin: 0 0 0.5rem 0;">✅ Tespit Edilen Grafik Türü</h4>
                        <p style="margin: 0; font-size: 1.2rem;"><strong>${result.detectedChartType.name}</strong></p>
                    </div>
                `;
                message = `Görsel yüklendi! ${result.detectedChartType.name} tespit edildi.`;
            } else {
                detectionHTML += `
                    <div style="background: rgba(237, 137, 54, 0.2); padding: 1rem; border-radius: 12px; border-left: 4px solid #ed8936;">
                        <h4 style="margin: 0 0 0.5rem 0;">❓ Grafik Türü Tespit Edilemedi</h4>
                        <p style="margin: 0;">Dosya adında grafik türü belirtin (örn: bar_chart.png, line_graph.png)</p>
                    </div>
                `;
            }

            detectionHTML += `
                    <div style="margin-top: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0;">📋 Desteklenen Grafik Türleri:</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem;">
            `;

            result.supportedChartTypes.forEach(chart => {
                const isDetected = result.detectedChartType && result.detectedChartType.type === chart.type;
                detectionHTML += `
                    <div style="background: rgba(255,255,255,${isDetected ? '0.3' : '0.1'}); padding: 0.5rem; border-radius: 8px; ${isDetected ? 'border: 2px solid #48bb78;' : ''}">
                        ${isDetected ? '✅ ' : ''}${chart.name}
                    </div>
                `;
            });

            detectionHTML += `
                        </div>
                    </div>
                </div>
                <img src="${result.path}" alt="Uploaded Image" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            `;

            chartPreview.innerHTML = detectionHTML;
            showToast(message, 'success');
        } else {
            showToast(result.error || 'Görsel yüklenemedi!', 'error');
        }
    } catch (error) {
        console.error('Image upload error:', error);
        showToast('Görsel yükleme hatası!', 'error');
    } finally {
        hideLoading();
    }
}

// Handle audio upload
async function handleAudioUpload() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('audioFile', file);

    showLoading('Ses dosyası yükleniyor...');

    try {
        const response = await fetch(`${API_URL}/upload/audio`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showToast('Ses dosyası başarıyla yüklendi!', 'success');

            // Display audio player
            const chartPreview = document.getElementById('chartPreview');
            chartPreview.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎵</div>
                    <h3 style="margin-bottom: 1rem;">Ses Dosyası Yüklendi</h3>
                    <p style="color: #718096; margin-bottom: 2rem;">${result.filename}</p>
                    <audio controls style="width: 100%; max-width: 400px;">
                        <source src="${result.path}" type="audio/mpeg">
                        <source src="${result.path}" type="audio/wav">
                        <source src="${result.path}" type="audio/mp3">
                        Tarayıcınız ses elementini desteklemiyor.
                    </audio>
                </div>
            `;
        } else {
            showToast(result.error || 'Ses dosyası yüklenemedi!', 'error');
        }
    } catch (error) {
        console.error('Audio upload error:', error);
        showToast('Ses dosyası yükleme hatası!', 'error');
    } finally {
        hideLoading();
    }
}

// Show loading
function showLoading(message = 'Yükleniyor...') {
    const chartPreview = document.getElementById('chartPreview');
    chartPreview.innerHTML = `
        <div style="text-align: center;">
            <div class="loading"></div>
            <p style="margin-top: 1rem; color: #718096;">${message}</p>
        </div>
    `;
}

// Hide loading
function hideLoading() {
    const chartPreview = document.getElementById('chartPreview');
    // Only clear if it still contains the loading spinner
    if (chartPreview.querySelector('.loading')) {
        chartPreview.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #718096;">
                <p>Veri yüklendi. Grafik oluşturmak için bir tür seçin.</p>
            </div>
        `;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
