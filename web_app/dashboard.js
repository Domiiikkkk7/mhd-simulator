let operatorDatabase = null;

const ticketPrices = {
  normal: 30,
  student: 20,
  reduced: 15,
  monthly: 500
};

const state = {
  operator: null,
  operatorData: null,
  routeKey: null,
  route: null,
  currentIndex: 0,
  direction: 1,
  doorsOpen: false,
  running: true,
  cash: 0,
  totalPassengers: 0,
  passengersInBus: 0,
  passengersAtStop: 0,
  log: [],
  clock: 6 * 60,
  autoTick: null
};

const DOM = {
  operatorSelect: document.getElementById('operatorSelect'),
  routeSelect: document.getElementById('routeSelect'),
  currentStopEl: document.getElementById('currentStop'),
  nextStopEl: document.getElementById('nextStop'),
  doorsStateEl: document.getElementById('doorsState'),
  passengersInBusEl: document.getElementById('passengersInBus'),
  routeStatusEl: document.getElementById('routeStatus'),
  cashValueEl: document.getElementById('cashValue'),
  revenueEl: document.getElementById('revenue'),
  totalPassengersEl: document.getElementById('totalPassengers'),
  inBusCountEl: document.getElementById('inBusCount'),
  vehicleNameEl: document.getElementById('vehicleName'),
  routeBadgeEl: document.getElementById('routeBadge'),
  operatorBadgeEl: document.getElementById('operatorBadge'),
  clockDisplayEl: document.getElementById('clockDisplay'),
  announcerTextEl: document.getElementById('announcerText'),
  logListEl: document.getElementById('logList'),
  scheduleListEl: document.getElementById('scheduleList'),
  nextStopBtn: document.getElementById('nextStopBtn'),
  doorBtn: document.getElementById('doorBtn'),
  toggleRunBtn: document.getElementById('toggleRunBtn'),
  sellTicketBtn: document.getElementById('sellTicketBtn')
};

function formatClock(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatMoney(value) {
  return `${value.toLocaleString('cs-CZ')} Kč`;
}

async function loadOperators() {
  try {
    const response = await fetch('data/operators.json');
    operatorDatabase = await response.json();
    populateOperators();
  } catch (error) {
    console.error('Chyba při načítání dat:', error);
  }
}

function populateOperators() {
  if (!operatorDatabase || !operatorDatabase.operators) return;
  
  DOM.operatorSelect.innerHTML = operatorDatabase.operators
    .map(op => `<option value="${op.id}">${op.name}</option>`)
    .join('');
  
  state.operator = operatorDatabase.operators[0].id;
  selectOperator(state.operator);
}

function selectOperator(operatorId) {
  state.operatorData = operatorDatabase.operators.find(op => op.id === operatorId);
  if (!state.operatorData) return;
  
  state.operator = operatorId;
  populateRoutes();
}

function populateRoutes() {
  if (!state.operatorData || !state.operatorData.routes) return;
  
  DOM.routeSelect.innerHTML = state.operatorData.routes
    .map(route => `<option value="${route.id}">${route.number} – ${route.name}</option>`)
    .join('');
  
  selectRoute(state.operatorData.routes[0].id);
}

function selectRoute(routeId) {
  state.route = state.operatorData.routes.find(r => r.id === routeId);
  if (!state.route) return;
  
  state.routeKey = routeId;
  state.currentIndex = 0;
  state.direction = 1;
  state.doorsOpen = false;
  state.running = false;
  state.passengersInBus = 0;
  state.passengersAtStop = 0;
  
  renderSchedule();
  updateView();
  addLog(`${state.operatorData.name} – Linka ${state.route.number} vybrána.`);
}

function renderSchedule() {
  DOM.scheduleListEl.innerHTML = state.route.schedule
    .map(time => `<li>${time}</li>`)
    .join('');
}

function updateView() {
  const stop = state.route.stops[state.currentIndex];
  const nextIdx = state.currentIndex + state.direction;
  const nextStop = nextIdx >= 0 && nextIdx < state.route.stops.length 
    ? state.route.stops[nextIdx] 
    : state.route.stops[0];
  
  DOM.currentStopEl.textContent = stop;
  DOM.nextStopEl.textContent = nextStop;
  DOM.doorsStateEl.textContent = state.doorsOpen ? '🟢 Otevřeno' : '🔴 Zavřeno';
  DOM.passengersInBusEl.textContent = `${state.passengersInBus} osob`;
  DOM.routeStatusEl.textContent = state.running ? '✅ V provozu' : '⏸ Zastaveno';
  
  DOM.routeBadgeEl.textContent = `Linka ${state.route.number}`;
  DOM.operatorBadgeEl.textContent = state.operatorData.shortName;
  DOM.vehicleNameEl.textContent = state.route.vehicleType.toUpperCase();
  
  DOM.cashValueEl.textContent = formatMoney(state.cash);
  DOM.revenueEl.textContent = formatMoney(state.cash);
  DOM.totalPassengersEl.textContent = state.totalPassengers;
  DOM.inBusCountEl.textContent = state.passengersInBus;
  DOM.clockDisplayEl.textContent = formatClock(state.clock);
  
  DOM.toggleRunBtn.textContent = state.running ? '⏸ Pauza' : '▶ Start';
  DOM.doorBtn.textContent = state.doorsOpen ? '🚪 Zavřít' : '🚪 Otevřít';
}

function announce(text) {
  DOM.announcerTextEl.textContent = text;
}

function addLog(message) {
  state.log.unshift(`[${formatClock(state.clock)}] ${message}`);
  if (state.log.length > 10) state.log.pop();
  DOM.logListEl.innerHTML = state.log.map(item => `<li>${item}</li>`).join('');
}

function nextStop() {
  if (!state.running) {
    announce('Vozidlo je zastaveno.');
    return;
  }
  
  const nextIdx = state.currentIndex + state.direction;
  if (nextIdx < 0 || nextIdx >= state.route.stops.length) {
    state.direction *= -1;
    addLog('🔄 Konec trasy, směr se mění.');
  }
  
  state.currentIndex += state.direction;
  if (state.currentIndex < 0) state.currentIndex = 0;
  if (state.currentIndex >= state.route.stops.length) state.currentIndex = state.route.stops.length - 1;
  
  state.clock += Math.floor(Math.random() * 4) + 3; // +3 až +6 minut
  
  // Nástup/výstup cestujících
  const exitPassengers = Math.floor(state.passengersInBus * Math.random() * 0.3);
  state.passengersInBus -= exitPassengers;
  
  const enterPassengers = Math.floor(Math.random() * 5) + 1;
  state.passengersInBus += enterPassengers;
  state.totalPassengers += enterPassengers;
  
  const stop = state.route.stops[state.currentIndex];
  announce(`Příští zastávka: ${stop}. Vystupujte a nastupujte prosím.`);
  addLog(`📍 Dorazilo na zastávku ${stop}. Vstoupilo ${enterPassengers}, vystoupilo ${exitPassengers}.`);
  
  updateView();
}

function toggleDoors() {
  state.doorsOpen = !state.doorsOpen;
  addLog(state.doorsOpen ? '🚪 Dveře otevřeny.' : '🚪 Dveře zavřeny.');
  updateView();
}

function toggleRunning() {
  state.running = !state.running;
  addLog(state.running ? '▶ Vozidlo opět jede.' : '⏸ Vozidlo zastaveno.');
  updateView();
}

function sellTicket() {
  const ticketType = document.getElementById('ticketType').value;
  const price = ticketPrices[ticketType] || 0;
  
  state.cash += price;
  state.totalPassengers += 1;
  state.passengersInBus += 1;
  
  const typeNames = { normal: 'běžná', student: 'studentská', reduced: 'zlevněná', monthly: 'měsíční' };
  addLog(`💳 Prodána ${typeNames[ticketType]} jízdenka za ${price} Kč.`);
  
  updateView();
}

function autoTick() {
  if (state.running && state.clock % 10 === 0) {
    // Každých 10 minut (přibližně každých 5 sekund) nový nástup
    const randomEntry = Math.floor(Math.random() * 3);
    if (randomEntry > 0) {
      state.passengersInBus += randomEntry;
      state.totalPassengers += randomEntry;
    }
  }
  
  state.clock += 1;
  DOM.clockDisplayEl.textContent = formatClock(state.clock);
}

// Event listeners
DOM.operatorSelect.addEventListener('change', (e) => {
  selectOperator(e.target.value);
});

DOM.routeSelect.addEventListener('change', (e) => {
  selectRoute(e.target.value);
});

DOM.nextStopBtn.addEventListener('click', nextStop);
DOM.doorBtn.addEventListener('click', toggleDoors);
DOM.toggleRunBtn.addEventListener('click', toggleRunning);
DOM.sellTicketBtn.addEventListener('click', sellTicket);

// Spuštění
loadOperators();
setInterval(autoTick, 500);
