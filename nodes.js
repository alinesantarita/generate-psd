const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/generate-psd', (req, res) => {
    const filename = req.body.filename.replace(/[^a-zA-Z0-9_]/g, "_");
    const artboards = req.body.width.map((width, index) => ({
        width: width,
        height: req.body.height[index]
    }));

    // Gera script JSX para Photoshop
    let jsxScript = `
        var doc = app.documents.add();
        doc.name = "${filename}";
    `;

    artboards.forEach((artboard, i) => {
        jsxScript += `
            var artboard${i + 1} = doc.artboards.add(new Rect(0, 0, ${artboard.width}, ${artboard.height}));
            artboard${i + 1}.name = "${filename}_${artboard.width}x${artboard.height}px";
        `;
    });

    const scriptPath = path.join(__dirname, `${filename}.jsx`);
    fs.writeFileSync(scriptPath, jsxScript);

    res.download(scriptPath, `${filename}.jsx`, () => {
        fs.unlinkSync(scriptPath); // Remove o arquivo temporário após o download
    });
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
