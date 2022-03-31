const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const multer = require('multer');
const upload = multer({ dest: '../uploads/'});
const events = require('events');
const waitUntil = require('wait-until');
const emitter = new events.EventEmitter();


const homeDir = '/Users/laurence/Documents/VS Code/Node.js/NodeProj/';
var currentDirectory = homeDir;
const showHidden = false;
const videoList = ['.mp4'];
const imageList = ['.png', ',jpeg', '.jpg']


var app = express();
app.set('views', "../views");
app.engine('.ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.use(express.static('../static'));
app.use(bodyParser.json());

app.locals = {
    title: "",
    currentDirectory: homeDir,
    filelist: "",
    content: "",
    downloadItem: "",
}
 

var getInfo;
function getDirInfo (currentDir){
    var fileList = [];
    fs.readdir(currentDir, function(err, files){
        if (err) {
            return console.error(err);
        }
        files.forEach(function(file){
            if (!showHidden){
                if (file[0] !== "."){
                    fileList.push(file);
                }
            } else {
                fileList.push(file);
            }
        });
        emitter.emit('scan finished'); 
    });
    emitter.once('scan finished', function(){
        result = [];
        result.push(currentDir);
        result.push(fileList);
        getInfo = result;
        emitter.emit('Success');
    });
}



app.get('/', function (req, res){
    fs.stat(currentDirectory, function(err, stats){
        if (err){
            currentDirectory = homeDir;
        }
        getDirInfo(currentDirectory);
        emitter.once("Success", function(){
            var items = "";
            var count = 1;
            for (var i = 0; i < getInfo[1].length; i++){
                var tmp = getInfo[1][i];
                var stats = fs.statSync(currentDirectory + tmp)
                if (tmp.length > 15){
                    displayName = tmp.substring(0, 15) + '...';
                } else {
                    displayName = tmp;
                }
                if (stats.isDirectory()){
                    items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/folder.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                    count++;
                } else {
                    if (videoList.includes(path.extname(currentDirectory + tmp))){
                        items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/video.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                        count++;
                    } else {
                        items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/file.png'><p>"  + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                        count++;
                    }
                }
            }
            res.render('index', {title: "Upload Files",
                currentDirectory: "<h2>" + getInfo[0] + "</h2>",
                filelist: items
            });
        })
    })
})

app.get('/resume', function (req, res){
    res.render('Resume');
})

app.post('/uploadFiles',function(req, res){
    require('./uploadFiles').uploadFile(req, res, currentDirectory);
})

app.get('/changeDir', function(req, res){
    res.redirect('/');
})

app.post('/changeDir', urlencodedParser, function(req, res){
    var response = {
        "request_dir": req.body.requestDir,
    };
    if (req.body.requestDir === "home"){
        currentDirectory = homeDir.substring(0, homeDir.length-1);
    } else {
        len = currentDirectory.split('/').length;
        while (currentDirectory.split('/')[len-1] === ""){
            len -= 1;
        }
        if (currentDirectory.split('/')[len-1] !== response.request_dir){
            currentDirectory +=  response.request_dir;
        }

        currentDirectory = path.resolve(currentDirectory);
    }
    
    fs.stat(currentDirectory, function(err, stats){
        if (err){
            currentDirectory = homeDir;
            res.redirect('/');
            return console.error(err);
        } else {
            if (stats.isDirectory()){
                currentDirectory += '/';
                console.log('Visiting: ' + currentDirectory);
                getDirInfo(currentDirectory);
                emitter.once("Success", function(){
                    var items = "";
                    var count = 1;
                    for (var i = 0; i < getInfo[1].length; i++){
                        var tmp = getInfo[1][i];
                        var stats = fs.statSync(currentDirectory + tmp);
                        if (tmp.length > 15){
                            displayName = tmp.substring(0, 15) + '...'
                        } else {
                            displayName = tmp;
                        }
                        if (stats.isDirectory()){
                            items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/folder.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                            count++;
                        } else {
                            if (videoList.includes(path.extname(currentDirectory + tmp))){
                                items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/video.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                                count++;
                            } else {
                                items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/file.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                                count++;
                            }
                        }
                    }
                    res.render('index', {title: "Upload Files",
                        currentDirectory: "<h2>" + getInfo[0] + "</h2>",
                        filelist: items
                    });
                })
            } else{
                console.log('Trying to fetch file: ' + currentDirectory)
                currentDirectory = path.dirname(currentDirectory) + '/';
                getDirInfo(currentDirectory);
                emitter.once("Success", function(){
                    var items = "";
                    var count = 1;
                    for (var i = 0; i < getInfo[1].length; i++){
                        var tmp = getInfo[1][i];
                        var stats = fs.statSync(currentDirectory + tmp);
                        if (tmp.length > 15){
                            displayName = tmp.substring(0, 15) + '...'
                        } else {
                            displayName = tmp;
                        }
                        if (stats.isDirectory()){
                            items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/folder.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                            count++;
                        } else {
                            if (videoList.includes(path.extname(currentDirectory + tmp))){
                                items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/video.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                                count++;
                            } else {
                                items += "<li><a class='text-decoration-none' href='#' id='"+count+"th-file'><div class='file-item'><img src='/images/file.png'><p>" + displayName + "</p><p style='display: none'>" + tmp + "</p></div></a></li>";
                                count++;
                            }
                        }
                    }
                    res.render('index', {title: "Upload Files",
                        currentDirectory: "<h2>" + getInfo[0] + "</h2>",
                        filelist: items,
                        content: `
                            <script>
                                $.sendConfirm({
                                    title: 'Information',
                                    withNoMinWidth: true,
                                    width: '400px',
                                    content: '<h4 style="margin: 0; margin-bottom: 30px">Do you want to download this file?</h4>',
                                    button: {
                                        confirm: 'Download',
                                        cancel: 'Cancel'
                                    },
                                    onConfirm: function() {
                                        $("#download").submit();
                                    },
                                    onCancel: function() {
                                        console.log('点击取消！');
                                    },
                                    onClose: function() {
                                        console.log('点击关闭！');
                                    }
                                });
                            </script>`,
                        downloadItem: response.request_dir
                    });
                })
            }
        }
    })
    
})

app.post('/download', urlencodedParser, function(req, res){
    var response = {
        "downloadFile": req.body.requestDownload,
    };
    res.download(currentDirectory + response.downloadFile, function(){
        console.log('File downloaded!');
    });
})

var server = app.listen(80, function (){
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server started, listening on http://localhost:%s/ ...\n", port);
})