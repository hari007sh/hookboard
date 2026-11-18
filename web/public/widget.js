/* Hookboard embed: <script src="https://YOUR-HOOKBOARD/widget.js" data-niche="home baking" async></script> */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var origin = new URL(script.src).origin;
  var frame = document.createElement("iframe");
  var niche = script.getAttribute("data-niche") || "";
  frame.src = origin + "/embed" + (niche ? "?niche=" + encodeURIComponent(niche) : "");
  frame.title = "Hookboard hook generator";
  frame.loading = "lazy";
  frame.style.cssText = "width:100%;max-width:480px;height:420px;border:0;border-radius:20px;box-shadow:0 8px 30px rgba(30,21,48,.15);";
  script.parentNode.insertBefore(frame, script.nextSibling);

  window.addEventListener("message", function (event) {
    if (event.origin !== origin || event.source !== frame.contentWindow) return;
    var data = event.data;
    if (data && data.type === "hookboard:height" && typeof data.height === "number") {
      frame.style.height = Math.min(Math.max(data.height, 300), 1400) + "px";
    }
  });
})();
