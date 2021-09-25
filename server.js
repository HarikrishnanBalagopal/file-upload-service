const fs = require('fs');                   // Classic fs
const path = require('path');               // Used for manipulation with path
const express = require('express');         // Express Web Server
const busboy = require('connect-busboy');   // Middleware to handle the file upload https://github.com/mscdex/connect-busboy
const sanitize = require("sanitize-filename");
const uploadPath = path.join(__dirname, 'uploaded-files');

const uploaded = [];

function main() {
    const port = 8080;
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    } else {
        uploaded.push(...fs.readdirSync(uploadPath).filter(f => !f.startsWith('.')));
        console.log('the uploaded files are:', uploaded);
    }
    const app = express();
    app.use(express.static('public'));
    app.use('/up', express.static('uploaded-files'));
    app.use(busboy({ highWaterMark: 2 * 1024 * 1024 }));
    app.get('/uploaded', (req, res) => res.json(uploaded));
    app.post('/upload', (req, res) => {
        req.pipe(req.busboy);
        req.busboy.on('file', (fieldname, file, origFilename) => {
            const filename = sanitize(origFilename);
            if (filename === "") {
                console.log('invalid filename:', origFilename);
                return res.redirect('/');
            }
            console.log(`Upload of '${filename}' started`);
            const fstream = fs.createWriteStream(path.join(uploadPath, filename));
            file.pipe(fstream);
            fstream.on('close', () => {
                uploaded.push(filename);
                console.log(`Upload of '${filename}' finished`);
                res.redirect('/');
            });
        });
    });
    app.listen(port, () => console.log(`Listening on port ${port}`));
}

main();
