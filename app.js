const modal = document.getElementById("editorModal");
const openEditor = () => { modal.hidden = false; document.body.style.overflow = "hidden"; };
const closeEditor = () => { modal.hidden = true; document.body.style.overflow = ""; };
document.getElementById("heroCreate").addEventListener("click", openEditor);
document.getElementById("topCreate").addEventListener("click", openEditor);
document.getElementById("closeEditor").addEventListener("click", closeEditor);
modal.addEventListener("click", event => { if (event.target === modal) closeEditor(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeEditor(); });

const filterButtons = [...document.querySelectorAll(".filter-chip")];
const templateCards = [...document.querySelectorAll(".template-card")];
filterButtons.forEach(button => button.addEventListener("click", () => {
  filterButtons.forEach(item => item.classList.toggle("active", item === button));
  const filter = button.dataset.filter;
  templateCards.forEach(card => { card.hidden = filter !== "all" && card.dataset.category !== filter; });
}));

document.querySelectorAll(".choose-template").forEach(button => button.addEventListener("click", () => {
  openEditor();
  document.getElementById("editorTitle").textContent = "Make this design yours.";
  document.getElementById("namesInput").focus();
}));

const form = document.getElementById("inviteForm");
const names = document.getElementById("namesInput");
const date = document.getElementById("dateInput");
const venue = document.getElementById("venueInput");
function refreshPreview() {
  document.getElementById("previewNames").textContent = names.value.trim() || "Your names";
  const parsed = date.value ? new Date(date.value + "T12:00:00") : null;
  document.getElementById("previewDate").textContent = parsed && !Number.isNaN(parsed.valueOf())
    ? parsed.toLocaleDateString("en-IN", {day:"2-digit", month:"long", year:"numeric"}).toUpperCase()
    : "YOUR WEDDING DATE";
  document.getElementById("previewVenue").textContent = venue.value.trim().toUpperCase() || "YOUR VENUE";
}
form.addEventListener("submit", event => { event.preventDefault(); refreshPreview(); });
[names,date,venue].forEach(field => field.addEventListener("input", refreshPreview));
document.querySelectorAll(".choose-template").forEach(button => button.addEventListener("click", refreshPreview));

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}