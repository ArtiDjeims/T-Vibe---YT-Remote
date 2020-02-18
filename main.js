// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const express = require('express');
const router = express();
const http = require('http').Server(router);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const localIpV4Address = require("local-ipv4-address");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 500,
    resizable: true,
    frame: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL('http://localhost:3000/home');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  //Windows
  ipcMain.on("changeWindow", function (event, link) {
    mainWindow.loadURL(link);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//Socket

let videoId;

io.on('connection', function (socket) {

  localIpV4Address().then(function (ipAddress) {
    io.emit('myIpV4', ipAddress);
  });

  socket.on('search', function (q) {
    // io.to(socket.id).emit('winner', postKey);
    // socket.broadcast.emit('broadcast', 'sorry');
    console.log("recieved search call");
    io.emit('search', q);
  });

  socket.on('searchResults', function (list) {
    console.log("recieved search results");
    io.emit('searchResults', list);
  });

  socket.on('openVideo', function (url) {
    // console.log("recieved open video command");
    // mainWindow.loadURL(url);
    console.log("got open video req");
    videoId = youtube_parser(url);
    console.log(videoId);
    mainWindow.loadURL("http://localhost:3000/player");
  });

  socket.on('controlVideo', function (command) {
    io.emit('controlVideo', command);
  });


  socket.on('getVideoId', function () {
    console.log("got get video id req")
    io.emit('getVideoId', videoId);
  });

});

function youtube_parser(url) {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

//Routing

// router.use('/public', express.static('public'));

const publicPath = path.resolve(__dirname, '../public');
router.use('/public', express.static(publicPath));

router.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

router.get('/player', function (req, res) {
  res.sendFile(__dirname + '/views/player.html');
});

router.get('/home', function (req, res) {
  res.sendFile(__dirname + '/views/home.html');
});


//Okay, for some reason Static folder dosen't work on Production, but we need to require it from front-end. Werid FLEX but OK
//Quick work around, since we only have 4 files, we are going to require them here...

router.get('/public/css/home.css', function (req, res) {
  res.sendFile(__dirname + '/public/css/home.css');
});

router.get('/public/js/qrcode.min.js', function (req, res) {
  res.sendFile(__dirname + '/public/js/qrcode.min.js');
});

router.get('/public/js/qrcode.min.js', function (req, res) {
  res.sendFile(__dirname + '/public/js/qrcode.min.js');
});

router.get('/public/css/remote.css', function (req, res) {
  res.sendFile(__dirname + '/public/css/remote.css');
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});