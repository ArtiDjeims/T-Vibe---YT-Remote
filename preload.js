// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require("electron");

const io = require('socket.io-client');

window.onload = function () {
  let socket = io.connect("http://localhost:3000");
  console.log(socket);

  socket.on('newTheme', function (theme) {
    console.log(theme);
  });

  socket.on('search', function (q) {
    ipcRenderer.send("changeWindow", `https://www.youtube.com/results?search_query=${q}`);
  });

  if (window.location.pathname == "/results") {
    let list = [];
    let links = document.querySelectorAll("[id='video-title']");
    for (let i = 0; i < links.length; i++) {
      list.push({ title: links[i].title, link: links[i].href })
    }
    socket.emit('searchResults', list);
  }

};
