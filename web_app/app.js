const operatorData = {
  ostrava: {
    name: 'Dopravní podnik Ostrava',
    short: 'DP Ostrava',
    bus: 'Bus 20',
    color: '#1d4ed8',
    routes: {
      '20': {
        stops: ['Náměstí Republiky', 'Hlavní nádraží', 'Moravská Ostrava', 'Muzeum', 'Slezská', 'Vítkovice', 'Poruba', 'Černá louka'],
        schedule: ['05:40', '06:15', '06:55', '07:35', '08:15', '09:00', '09:50', '10:35']
      },
      '30': {
        stops: ['Kosmonautů', 'Hlavní nádraží', 'Přívoz', 'Nová Valašská', 'Mírové náměstí', 'Borská', 'Muglinov'],
        schedule: ['05:50', '06:30', '07:20', '08:10', '09:00', '09:50', '10:40']
      }
    }
  },
  usti: {
    name: 'DP města Ústí nad Labem',
    short: 'DP Ústí',
    bus: 'Bus 3',
    color: '#f59e0b',
    routes: {
      '1': {
        stops: ['Náměstí Republiky', 'Větrník', 'Muzeum', 'Kostelní náměstí', 'Nádražní', 'Předměstí', 'Krupka'],
        schedule: ['05:45', '06:20', '07:00', '07:45', '08:35', '09:20', '10:10']
      },
      '2': {
        stops: ['Město', 'ZŠ', 'Lužické náměstí', 'Pohled', 'Koryto', 'Hrad'],
        schedule: ['06:00', '06:45', '07:35', '08:25', '09:15', '10:05']
      }
    }
  },
  decin: {
    name: 'DP města Děčína',
    short: 'DP Děčín',
    bus: 'Bus 5',
    color: '#16a34a',
    routes: {
      '1': {
        stops: ['Nádražní', 'Městské divadlo', 'Dlouhá', 'Podhorská', 'Děčínský park', 'Březiny'],
        schedule: ['05:55', '06:35', '07:20', '08:10', '09:00', '09:50']
      },
      '2': {
        stops: ['Lábská', 'Křemencová', 'Kostelní náměstí', 'Náměstí', 'Městská nemocnice'],
        schedule: ['06:10', '06:55', '07:45', '08:35', '09:30']
      }
    }
  },
  liberec: {
    name: 'Inter Line Liberec',
    short: 'Inter Line',
    bus: 'Bus 1',
    color: '#7c3aed',
    routes: {
      '1': {
        stops: ['Centrum', 'Městský park', 'Nádražní', 'Jablonecká', 'Kříž', 'Riegrova'],
        schedule: ['05:35', '06:20', '07:10', '08:00', '08:50', '09:40']
      },
      '2': {
        stops: ['Liberec hlavní', 'Nábřeží', 'Nové Město', 'Sokolovská', 'Křižovatka', 'Vratislavice'],
        schedule: ['05:50', '06:35', '07:25', '08:15', '09:05', '10:00']
      }
    }
  },
  arriva: {
    name: 'ARRIVA MORAVA',
    short: 'ARRIVA',
    bus: 'Bus 204',
    color: '#dc2626',
    routes: {
      '204': {
        stops: ['Olomouc, Hlavní nádraží', 'Cyrilometodějská', 'Smetanova', 'Náměstí 8. května', 'Univerzitní kampus', 'Přerovská', 'Křelov'],
        schedule: ['05:45', '06:20', '07:05', '08:00', '08:50', '09:40', '10:30']
      },
      '210': {
        stops: ['Brno, Ústřední nádraží', 'Kobližná', 'Křenová', 'Sokolská', 'Slatina', 'Mladá Boleslavská', 'Přízřenice'],
        schedule: ['06:00', '06:50', '07:40', '08:30', '09:20', '10:10', '11:00']
      }
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
  log: [],
  clockMinutes: 6 * 60
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
const scheduleListEl = document.getElementById('scheduleList');
const clockDisplayEl = document.getElementById('clockDisplay');

function getActiveRoute() {
  return operatorData[state.operator].routes[state.routeKey];
}

function formatMoney(value) {
  return `${value} Kč`;
}

function formatClock(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

function renderSchedule() {
  const route = getActiveRoute();
  const departures = route.schedule || [];
  scheduleListEl.innerHTML = departures
    .map((time) => `<li>${time}</li>`)
    .join('');
}

function updateRouteState() {
  const operator = operatorData[state.operator];
  const route = getActiveRoute();
  state.currentIndex = 0;
  state.direction = 1;
  state.doorsOpen = false;
  state.running = true;
  document.getElementById('toggleRunBtn').textContent = 'Stop';
  routeBadgeEl.textContent = `Linka ${state.routeKey}`;
  operatorBadgeEl.textContent = operator.short;
  vehicleNameEl.textContent = operator.bus;
  busCardEl.dataset.operator = state.operator;
  state.clockMinutes = 6 * 60;

  announce(`Vítejte v dopravě ${operator.name}. Linka ${state.routeKey} je připravena k jízdě.`);
  addLog(`${operator.name} – linka ${state.routeKey} byla aktivována.`);
  renderSchedule();
  updateView();
}

function updateView() {
  const route = getActiveRoute();
  const currentStop = route.stops[state.currentIndex];
  const nextIndex = state.currentIndex + state.direction;
  const nextStop = nextIndex >= 0 && nextIndex < route.stops.length ? route.stops[nextIndex] : route.stops[0];

  currentStopEl.textContent = currentStop;
  nextStopEl.textContent = nextStop;
  doorsStateEl.textContent = state.doorsOpen ? 'Otevřeno' : 'Zavřeno';
  cashValueEl.textContent = formatMoney(state.cash);
  passengerCountEl.textContent = state.passengerCount;
  revenueEl.textContent = formatMoney(state.cash);
  routeStatusEl.textContent = state.running ? 'V provozu' : 'Zastaveno';
  routeBadgeEl.textContent = `Linka ${state.routeKey}`;
  operatorBadgeEl.textContent = operatorData[state.operator].short;
  clockDisplayEl.textContent = formatClock(state.clockMinutes);
}

function nextStop() {
  const route = getActiveRoute();
  if (!state.running) {
    addLog('Vozidlo je zastaveno, nelze pokračovat v jízdě.');
    return;
  }

  const nextIndex = state.currentIndex + state.direction;
  if (nextIndex < 0 || nextIndex >= route.stops.length) {
    state.direction *= -1;
    addLog('Konec trasy, směr se mění.');
  }

  state.currentIndex += state.direction;
  if (state.currentIndex < 0) state.currentIndex = 0;
  if (state.currentIndex >= route.stops.length) state.currentIndex = route.stops.length - 1;

  state.clockMinutes += 6;
  state.passengerCount += 2;
  const currentStop = route.stops[state.currentIndex];
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
  const keys = Object.keys(operatorData[state.operator].routes);
  state.routeKey = keys[0];
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
