// public/app.js — minimal boot so UI works even before other features
(function () {
  console.log("CST SmartDesk app boot");
  var status = document.getElementById('qaLog');
  if (!status) {
    status = document.createElement('pre');
    status.id = 'qaLog';
    document.body.appendChild(status);
  }
  status.textContent = "Status: Ready (app.js loaded)";
})();