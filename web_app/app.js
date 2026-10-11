const route = [
  'Náměstí',
  'Hlavní nádraží',
  'Muzeum',
  'Kostel',
  'Tř. Míru',
  'Park',
  'ZŠ Na Nábřeží',
  'Sídliště Jih',
  'Křižovatka',
  'Nádražní okruh',
];

const prices = {
  normal: 30,
  student: 20,
  monthly: 500,
};

const state = {
  currentIndex: 0,
  direction: 1,
  doorsOpen: false,
  running: true,
  cash: 0,
  passengerCount: 0,
  log: [],
};

const currentStopEl = document.getElementById('currentStop');
const nextStopEl = document.getElementById('nextStop');
const doorsStateEl = document.getElementById('doorsState');
const directionBadgeEl = document.getElementById('directionBadge');
const announcerTextEl = document.getElementById('announcerText');
const cashValueEl = document.getElementById('cashValue');
const passengerCountEl = document.getElementById('passengerCount');
const revenueEl = document.getElementById('revenue');
const logListEl = document.getElementById('logList');
const routeStatusEl = document.getElementById('routeStatus');

function formatMoney(value) {
  return `${value} Kč`;
}

function addLog(message) {
  state.log.unshift(message);
  if (state.log.length > 8) {
    state.log.pop();
  }

  logListEl.innerHTML = state.log
    .map((item) => `<li>${item}</li>`)
    .join('');
}

function announce(message) {
  announcerTextEl.textContent = message;
}

function updateView() {
  const currentStop = route[state.currentIndex];
  const nextIndex = state.currentIndex + state.direction;
  const nextStop = nextIndex >= 0 && nextIndex < route.length ? route[nextIndex] : route[0];

  currentStopEl.textContent = currentStop;
  nextStopEl.textContent = nextStop;
  doorsStateEl.textContent = state.doorsOpen ? 'Otevřeno' : 'Zavřeno';
  directionBadgeEl.textContent = state.direction > 0 ? 'Směr: vpřed' : 'Směr: zpět';
  cashValueEl.textContent = formatMoney(state.cash);
  passengerCountEl.textContent = state.passengerCount;
  revenueEl.textContent = formatMoney(state.cash);
  routeStatusEl.textContent = state.running ? 'V provozu' : 'Zastaveno';
}

function nextStop() {
  if (!state.running) {
    addLog('Vozidlo je zastaveno.');
    return;
  }

  const nextIndex = state.currentIndex + state.direction;
  if (nextIndex < 0 || nextIndex >= route.length) {
    state.direction *= -1;
    addLog('Konec trasy, směr se mění.');
  }

  state.currentIndex += state.direction;
  if (state.currentIndex < 0) state.currentIndex = 0;
  if (state.currentIndex >= route.length) state.currentIndex = route.length - 1;

  state.passengerCount += 2;
  const currentStop = route[state.currentIndex];
  announce(`Příští zastávka: ${currentStop}. Vystupujte a nastupujte, prosím.`);
  addLog(`Autobus dorazil na zastávku ${currentStop}.`);
  updateView();
}

function toggleDoors() {
  state.doorsOpen = !state.doorsOpen;
  addLog(`Dveře ${state.doorsOpen ? 'otevřeny' : 'zavřeny'}.`);
  announce(
    state.doorsOpen
      ? `Dveře jsou otevřené. Prosím, vystupujte a nastupujte.`
      : `Dveře jsou zavřené. Jedeme dál.`
  );
  updateView();
}

function toggleRun() {
  state.running = !state.running;
  const button = document.getElementById('toggleRunBtn');
  button.textContent = state.running ? 'Stop' : 'Spustit';
  addLog(state.running ? 'Vozidlo opět jede.' : 'Vozidlo je zastaveno.');
  updateView();
}

function sellTicket() {
  const typeSelect = document.getElementById('ticketType');
  const selected = typeSelect.value;
  const ticketPrice = prices[selected];

  state.cash += ticketPrice;
  state.passengerCount += 1;
  addLog(`Prodána ${selected === 'normal' ? 'běžná' : selected === 'student' ? 'studentská' : 'měsíční'} jízdenka za ${ticketPrice} Kč.`);
  announce(`Prodána jízdenka. Převzetí platby ${ticketPrice} Kč.`);
  updateView();
}

document.getElementById('nextStopBtn').addEventListener('click', nextStop);
document.getElementById('doorBtn').addEventListener('click', toggleDoors);
document.getElementById('toggleRunBtn').addEventListener('click', toggleRun);
document.getElementById('sellTicketBtn').addEventListener('click', sellTicket);

addLog('Vozidlo je připraveno k jízdě.');
updateView();
