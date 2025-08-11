// app.js — minimal boot so UI works even before other features
(function () {
  console.log("CST SmartDesk app boot");
  const status = document.getElementById('qaLog') || document.body.appendChild(Object.assign(document.createElement('pre'),{id:'qaLog'}));
  status.textContent = "Status: Ready (app.js loaded)";
})();