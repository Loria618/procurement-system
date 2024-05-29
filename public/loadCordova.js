// public/loadCordova.js
if (window.location.protocol === 'file:') {
    var script = document.createElement('script');
    script.src = 'cordova.js';
    document.head.appendChild(script);
}
