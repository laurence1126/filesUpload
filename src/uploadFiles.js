const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const events = require('events'); 

const isAllowCoverageFile = true;
const emitter = new events.EventEmitter(); 

function mkdirSync(dir, callback){
    let pathinfo = path.parse(dir);
    if (!fs.existsSync(pathinfo.dir)){
        mkdirSync(pathinfo.dir, function(){
            console.log('Making New Directory: ' + pathinfo.dir);
            fs.mkdirSync(pathinfo.dir);
        })
    }
    callback && callback();
}

exports.uploadFile = function(req, res, upDir){
    console.log("Files Uploading...\n");

    if (!fs.existsSync(upDir)){
        fs.mkdirSync(upDir)
    }

    const options = {
        uploadDir: upDir,
        multiples: true,
        keepExtensions: true,
        maxFileSize:  200 * 1024 * 1024 * 1024,
    }
    let form = new formidable.IncomingForm(options);

    form.on("error", function (e) {
        res.end("Files Size Exceeds Limit! Error: ", e);
        return;
    });

    form.on('end', () => {
        emitter.once('upload finished', function(){
            console.log("\nUpload Finifhed!");
        })
        res.render('infoDialog', {content: '<h1 style="margin: 0; margin-bottom: 30px"> Successfully Uploaded </h1>'});
    })

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log("Error: ", err);
            res.end('Upload Failure: ' + JSON.stringify(err));
            return;
        }

        for (let key in files) {
            rename(files[key], key);
        }

        function rename(fileItem, name) {
            let fileArr = fileItem;
            if (Object.prototype.toString.call(fileItem) === '[object Object]') {
                fileArr = [fileItem];
            }

            for (let file of fileArr) {
                var fileName;
                if (name === 'defaultUploadFileKey'){
                    fileName = file.originalFilename;
                } else {
                    fileName = name;
                }

                let suffix = path.extname(fileName);
                let oldPath = file.filepath;
                let newPath = path.join(upDir, fileName);

                mkdirSync(newPath);

                if (!isAllowCoverageFile) {
                    if (fs.existsSync(newPath)) {
                        newPath = newPath.replace(suffix,"") + '-' + Date.now() + '-' + Math.trunc(Math.random() * 1000) + suffix;
                    }
                }

                if (fs.existsSync(newPath)) {
                    console.log("File with same name exists (" + fileName + ")! Override.");
                } else{
                    console.log("File: " + fileName + " has been uploaded to " + path.dirname(newPath) + '/');
                }
                
                fs.rename(oldPath, newPath, function (err) {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        }
        emitter.emit('upload finished');
    });
}

