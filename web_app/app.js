const operatorData = {
  ostrava: {
    name: 'Dopravní podnik Ostrava',
    short: 'DP Ostrava',
    bus: 'Bus 20',
    color: '#1d4ed8',
    routes: {
      '20': ['Náměstí Republiky', 'Hlavní nádraží', 'Moravská Ostrava', 'Muzeum', 'Slezská', 'Vítkovice', 'Poruba', 'Černá louka'],
      '30': ['Kosmonautů', 'Hlavní nádraží', 'Přívoz', 'Nová Valašská', 'Mírové náměstí', 'Borská', 'Muglinov'],
      '52': ['Dolní Vítkovice', 'Vítkovice', 'Fifejdy', 'Slezská', 'Černá louka', 'Přívoz', 'Nádražní']
    }
  },
  usti: {
    name: 'DP města Ústí nad Labem',
    short: 'DP Ústí',
    bus: 'Bus 3',
    color: '#f59e0b',
    routes: {
      '1': ['Náměstí Republiky', 'Větrník', 'Muzeum', 'Kostelní náměstí', 'Nádražní', 'Předměstí', 'Krupka'],
      '2': ['Město', 'Základní škola', 'Lužické náměstí', 'Pohled', 'Koryto', 'Jeskyně', 'Hrad'],
      '8': ['Ústí centrum', 'Větrník', 'Hasina', 'Sídliště', 'Lesní cesta', 'Velké náměstí']
    }
  },
  decin: {
    name: 'DP města Děčína',
    short: 'DP Děčín',
    bus: 'Bus 5',
    color: '#16a34a',
    routes: {
      '1': ['Nádražní', 'Městské divadlo', 'Dlouhá', 'Podhorská', 'Děčínský park', 'Březiny'],
      '2': ['Lábská', 'Křemencová', 'Kostelní náměstí', 'Náměstí', 'Černý vrch', 'Městská nemocnice'],
      '10': ['Botanická', 'Kostelní', 'Děčín centrum', 'Křižovatka', 'Vltava', 'Česká']
    }
  },
  liberec: {
    name: 'Inter Line Liberec',
    short: 'Inter Line',
    bus: 'Bus 1',
    color: '#7c3aed',
    routes: {
      '1': ['Centrum', 'Městský park', 'Nádražní', 'Jablonecká', 'Lidická', 'Kříž', 'Riegrova'],
      '2': ['Liberec hlavní', 'Nábřeží', 'Nové Město', 'Sokolovská', 'Křižovatka', 'Vratislavice'],
      '5': ['Muzeum', 'Kostel', 'U školy', 'Kruh', 'Vesnice', 'Hřbitov', 'Lomnice']
    }
  }
};

const ticketPrices = {
  normal: 30,
  student: 20,
  monthly: 500,
  reduced: 15
};

const state = {
  operator: 'ostrava',
  routeKey: '20',
  currentIndex: 0,
  direction: 1,
  doorsOpen: false,
  running: true,
  cash: 0,
  passengerCount: 0,
  log: []
};

const operatorSelect = document.getElementById('operatorSelect');
const routeSelect = document.getElementById('routeSelect');
const currentStopEl = document.getElementById('currentStop');
const nextStopEl = document.getElementById('nextStop');
const doorsStateEl = document.getElementById('doorsState');
const announcerTextEl = document.getElementById('announcerText');
const cashValueEl = document.getElementById('cashValue');
const passengerCountEl = document.getElementById('passengerCount');
const revenueEl = document.getElementById('revenue');
const routeStatusEl = document.getElementById('routeStatus');
const logListEl = document.getElementById('logList');
const operatorBadgeEl = document.getElementById('operatorBadge');
const routeBadgeEl = document.getElementById('routeBadge');
const busCardEl = document.getElementById('busCard');
const vehicleNameEl = document.getElementById('vehicleName');

function getActiveRoute() {
  return operatorData[state.operator].routes[state.routeKey];
}

function formatMoney(value) {
  return `${value} Kč`;
}

function addLog(message) {
  state.log.unshift(message);
  if (state.log.length > 8) state.log.pop();

  logListEl.innerHTML = state.log.map((item) => `<li>${item}</li>`).join('');
}

function announce(message) {
  announcerTextEl.textContent = message;
}

function populateOperators() {
  operatorSelect.innerHTML = Object.entries(operatorData)
    .map(([key, value]) => `<option value="${key}">${value.name}</option>`)
    .join('');
  operatorSelect.value = state.operator;
}

function populateRoutes() {
  const routes = Object.keys(operatorData[state.operator].routes);
  routeSelect.innerHTML = routes
    .map((route) => `<option value="${route}">Linka ${route}</option>`)
    .join('');
  routeSelect.value = state.routeKey;
}

function updateRouteState() {
  const operator = operatorData[state.operator];
  state.currentIndex = 0;
  state.direction = 1;
  state.doorsOpen = false;
  state.running = true;
  document.getElementById('toggleRunBtn').textContent = 'Stop';
  routeBadgeEl.textContent = `Linka ${state.routeKey}`;
  operatorBadgeEl.textContent = operator.short;
  vehicleNameEl.textContent = operator.bus;
  busCardEl.dataset.operator = state.operator;

  announce(`Vítejte v dopravě ${operator.name}. Linka ${state.routeKey} je připravena k jízdě.`);
  addLog(`${operator.name} – linka ${state.routeKey} byla aktivována.`);
  updateView();
}

function updateView() {
  const route = getActiveRoute();
  const currentStop = route[state.currentIndex];
  const nextIndex = state.currentIndex + state.direction;
  const nextStop = nextIndex >= 0 && nextIndex < route.length ? route[nextIndex] : route[0];

  currentStopEl.textContent = currentStop;
  nextStopEl.textContent = nextStop;
  doorsStateEl.textContent = state.doorsOpen ? 'Otevřeno' : 'Zavřeno';
  cashValueEl.textContent = formatMoney(state.cash);
  passengerCountEl.textContent = state.passengerCount;
  revenueEl.textContent = formatMoney(state.cash);
  routeStatusEl.textContent = state.running ? 'V provozu' : 'Zastaveno';
  routeBadgeEl.textContent = `Linka ${state.routeKey}`;
  operatorBadgeEl.textContent = operatorData[state.operator].short;
}

function nextStop() {
  const route = getActiveRoute();
  if (!state.running) {
    addLog('Vozidlo je zastaveno, nelze pokračovat v jízdě.');
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
  const operatorName = operatorData[state.operator].name;

  announce(`${operatorName}, linka ${state.routeKey}. Příští zastávka: ${currentStop}. Vystupujte a nastupujte, prosím.`);
  addLog(`Autobus dorazil do zastávky ${currentStop}.`);
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
  addLog(state.running ? 'Vozidlo opět jede.' : 'Vozidlo je pozastaveno.');
  updateView();
}

function sellTicket() {
  const selected = document.getElementById('ticketType').value;
  const amount = ticketPrices[selected] || 0;
  state.cash += amount;
  state.passengerCount += 1;
  addLog(`Prodána ${selected === 'normal' ? 'běžná' : selected === 'student' ? 'studentská' : selected === 'monthly' ? 'měsíční' : 'zlevněná'} jízdenka za ${amount} Kč.`);
  announce(`Prodána jízdenka. Převzetí platby ${amount} Kč.`);
  updateView();
}

operatorSelect.addEventListener('change', (event) => {
  state.operator = event.target.value;
  state.routeKey = Object.keys(operatorData[state.operator].routes)[0];
  populateRoutes();
  updateRouteState();
});

routeSelect.addEventListener('change', (event) => {
  state.routeKey = event.target.value;
  updateRouteState();
});

document.getElementById('nextStopBtn').addEventListener('click', nextStop);
document.getElementById('doorBtn').addEventListener('click', toggleDoors);
document.getElementById('toggleRunBtn').addEventListener('click', toggleRun);
document.getElementById('sellTicketBtn').addEventListener('click', sellTicket);

populateOperators();
populateRoutes();
updateRouteState();
addLog('Vozidlo je připraveno k jízdě.');
updateView();
