const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to execute R script
function executeRScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const argsString = args.map(arg => `"${arg}"`).join(' ');
        const command = `Rscript "${scriptPath}" ${argsString}`;

        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error('R Script Error:', stderr);
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });
    });
}

// Helper function to execute Python script
function executePythonScript(scriptPath, params) {
    return new Promise((resolve, reject) => {
        // Write params to a temporary file to avoid Windows quote issues
        const tempParamsFile = path.join('temp', `params_${Date.now()}.json`);
        fs.writeFileSync(tempParamsFile, JSON.stringify(params));

        const command = `python "${scriptPath}" "${tempParamsFile}"`;

        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            // Clean up temp file
            try {
                fs.unlinkSync(tempParamsFile);
            } catch (e) {
                // Ignore cleanup errors
            }

            if (error) {
                console.error('Python Script Error:', stderr);
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });
    });
}

// Generic chart creation endpoint
async function createChart(req, res, chartType) {
    try {
        const { dataPath, xColumn, yColumn, groupColumn, title, useR } = req.body;

        if (!dataPath) {
            return res.status(400).json({ error: 'Veri dosyası belirtilmedi!' });
        }

        // Read data
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Generate output filename
        const outputFilename = `chart_${Date.now()}.png`;
        const outputPath = path.join('temp', outputFilename);

        // Prepare parameters
        const params = {
            chartType,
            dataPath,
            outputPath,
            xColumn,
            yColumn,
            groupColumn,
            title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
        };

        let imagePath;

        if (useR === true) { // Only use R if explicitly requested, otherwise default to Python since R is often missing
            // Try R first
            try {
                const rScriptPath = path.join('r_scripts', 'chart_generator.R');
                await executeRScript(rScriptPath, [
                    JSON.stringify(params)
                ]);
                imagePath = outputPath;
            } catch (rError) {
                console.log('R failed, trying Python...', rError.message);
                // Fallback to Python
                const pyScriptPath = path.join('python_scripts', 'chart_generator.py');
                await executePythonScript(pyScriptPath, params);
                imagePath = outputPath;
            }
        } else {
            // Use Python
            const pyScriptPath = path.join('python_scripts', 'chart_generator.py');
            await executePythonScript(pyScriptPath, params);
            imagePath = outputPath;
        }

        // Read generated image
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        res.json({
            success: true,
            message: 'Grafik başarıyla oluşturuldu!',
            chartType,
            image: `data:image/png;base64,${base64Image}`,
            imagePath: `/${imagePath}`
        });

    } catch (error) {
        console.error(`${chartType} oluşturma hatası:`, error);
        res.status(500).json({
            error: 'Grafik oluşturulurken hata oluştu!',
            details: error.message
        });
    }
}

// 1. Boxplot
router.post('/boxplot', (req, res) => createChart(req, res, 'boxplot'));

// 2. Scatter Plot
router.post('/scatter', (req, res) => createChart(req, res, 'scatter'));

// 3. Line Chart
router.post('/line', (req, res) => createChart(req, res, 'line'));

// 4. Bar Chart
router.post('/bar', (req, res) => createChart(req, res, 'bar'));

// 5. Histogram
router.post('/histogram', (req, res) => createChart(req, res, 'histogram'));

// 6. Violin Plot
router.post('/violin', (req, res) => createChart(req, res, 'violin'));

// 7. Density Plot
router.post('/density', (req, res) => createChart(req, res, 'density'));

// 8. Heatmap
router.post('/heatmap', (req, res) => createChart(req, res, 'heatmap'));

// 9. Ridgeline Plot
router.post('/ridgeline', (req, res) => createChart(req, res, 'ridgeline'));

// 10. Pie Chart
router.post('/pie', (req, res) => createChart(req, res, 'pie'));

module.exports = router;
