const TIMEZONE = "Europe/Amsterdam";
const THURSDAY = 4;

const board = document.getElementById("board");
const closed = document.getElementById("closed");
const status = document.getElementById("status");
const countdown = document.getElementById("countdown");

let categories = [];
const activePlays = new WeakMap();

// Day/time in Amsterdam regardless of the visitor's own timezone.
function amsterdamNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { day: days.indexOf(parts.weekday), hour: +parts.hour, minute: +parts.minute };
}

function isTriggerThursday() {
  const params = new URLSearchParams(location.search);
  if (location.hostname === "localhost" && params.has("force")) return true;
  return amsterdamNow().day === THURSDAY;
}

function timeUntilThursday() {
  const { day, hour, minute } = amsterdamNow();
  const daysLeft = (THURSDAY - day + 7) % 7;
  const totalMinutes = daysLeft * 24 * 60 - (hour * 60 + minute);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return `Nog ${d} dag${d === 1 ? "" : "en"}, ${h} uur en ${m} minuten te gaan.`;
}

function play(sound, button) {
  if (!isTriggerThursday()) return render();
  const audio = new Audio(`/sounds/${sound.file}`);
  activePlays.set(button, (activePlays.get(button) || 0) + 1);
  button.classList.add("playing");
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    const remaining = activePlays.get(button) - 1;
    if (remaining === 0) {
      activePlays.delete(button);
      button.classList.remove("playing");
    } else {
      activePlays.set(button, remaining);
    }
  };
  audio.addEventListener("ended", finish);
  audio.addEventListener("error", finish);
  audio.play().catch((error) => {
    finish();
    console.error(`Could not play sound: ${sound.file}`, error);
  });
}

function wordart(tag, text, className = "") {
  const el = document.createElement(tag);
  el.className = `wordart ${className}`.trim();
  el.dataset.text = text;
  el.textContent = text;
  return el;
}

function buildButton(sound) {
  const button = document.createElement("button");
  button.className = "sound";
  button.type = "button";
  button.append(wordart("span", sound.label));
  button.addEventListener("click", () => play(sound, button));
  return button;
}

function buildBoard() {
  board.replaceChildren(
    ...categories.map(({ category, sounds }) => {
      const section = document.createElement("section");
      section.className = "category";
      const grid = document.createElement("div");
      grid.className = "grid";
      grid.append(...sounds.map(buildButton));
      section.append(wordart("h2", category, "ocean"), grid);
      return section;
    })
  );
}

function render() {
  const open = isTriggerThursday();
  board.hidden = !open;
  closed.hidden = open;
  status.textContent = open ? "Het is Trigger Thursday!" : "";
  status.dataset.text = status.textContent;
  if (!open) countdown.textContent = timeUntilThursday();
}

async function init() {
  const res = await fetch("/sounds.json", { cache: "no-cache" });
  categories = await res.json();
  buildBoard();
  render();
  setInterval(render, 30_000);
}

init();
