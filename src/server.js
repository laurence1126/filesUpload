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


const homeDir = '/Users/laurence/Documents/VS Code/Node.js/FilesUpload/';
var currentDirectory = homeDir;
var prevDirectory = [];
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
 

function getDirInfo (currentDir){
    var fileList = [];
    files = fs.readdirSync(currentDir)
    files.forEach(function(file){
        if (!showHidden){
            if (file[0] !== "."){
                fileList.push(file);
            }
        } else {
            fileList.push(file);
        }
    });
    result = [];
    result.push(currentDir);
    result.push(fileList);
    return result;
}



app.get('/', function (req, res){
    currentDirectory = homeDir;
    getInfo = getDirInfo(currentDirectory);
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

app.get('/resume', function (req, res){
    res.render('Resume');
})

app.post('/uploadFiles',function(req, res){
    require('./uploadFiles').uploadFile(req, res, currentDirectory);
})

app.get('/loadDir', function(req, res){
    res.redirect('/');
})

app.post('/loadDir', urlencodedParser, function(req, res){
    var response = {
        "request_dir": req.body.requestDir,
    };
    if (response.request_dir === "home"){
        currentDirectory = homeDir.substring(0, homeDir.length-1);
    } else if (response.request_dir === "forward"){
        if (prevDirectory.length > 0){
            currentDirectory = prevDirectory.pop();
        }
    } else {
        if (response.request_dir !== './'){
            prevDirectory.push(currentDirectory);
        }
        len = currentDirectory.split('/').length;
        while (currentDirectory.split('/')[len-1] === ""){
            len -= 1;
        }
        if (currentDirectory.split('/')[len-1] !== response.request_dir){
            currentDirectory +=  response.request_dir;
        }
    }
    currentDirectory = path.resolve(currentDirectory);
    fs.stat(currentDirectory, function(err, stats){
        if (err){
            currentDirectory = homeDir;
            res.redirect('/');
            return console.error(err);
        } else {
            if (stats.isDirectory()){
                currentDirectory += '/';
                console.log('Visiting: ' + currentDirectory);
                getInfo = getDirInfo(currentDirectory);
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
            } else{
                console.log('Trying to fetch file: ' + currentDirectory)
                currentDirectory = path.dirname(currentDirectory) + '/';
                getInfo = getDirInfo(currentDirectory);
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
    console.log("Server started, listening on " + "\x1B[33m" + "http://localhost:%s/ " + "\x1B[0m" + "...\n", port);
})