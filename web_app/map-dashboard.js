<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MHD Simulator – Map Dashboard</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #0f172a, #1e293b 50%, #111827);
        color: #e2e8f0;
      }
      .app {
        max-width: 1400px;
        margin: 20px auto;
        padding: 20px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-radius: 16px;
        padding: 18px 20px;
        margin-bottom: 20px;
      }
      .header h1 { margin: 0; font-size: 2rem; }
      .meta {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .pill {
        border-radius: 999px;
        padding: 10px 14px;
        font-weight: 700;
      }
      .status { background: #10b981; color: white; }
      .time { background: #3b82f6; color: white; }
      .layout {
        display: grid;
        grid-template-columns: 1.3fr 0.7fr;
        gap: 20px;
      }
      .map-panel, .sidebar {
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 18px;
        padding: 18px;
      }
      .controls {
        display: grid;
        grid-template-columns: repeat(2, minmax(180px, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }
      label {
        display: block;
        color: #94a3b8;
        font-weight: 700;
        margin-bottom: 6px;
      }
      select, button { width: 100%; font: inherit; border-radius: 10px; }
      select {
        background: rgba(15, 23, 42, 0.8);
        color: #e2e8f0;
        padding: 10px 12px;
        border: 1px solid rgba(148, 163, 184, 0.35);
      }
      button {
        cursor: pointer;
        border: none;
        color: white;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        padding: 11px 12px;
        font-weight: 700;
      }
      .map-box {
        position: relative;
        height: 420px;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(96, 165, 250, 0.4);
        background:
          linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,116,144,0.12)),
          linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px),
          linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px);
        background-size: auto, 32px 32px, 32px 32px;
      }
      .route-line {
        position: absolute;
        inset: 0;
      }
      .stop {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #facc15;
        border: 2px solid white;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 0 6px rgba(250, 204, 21, 0.15);
      }
      .bus-marker {
        position: absolute;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: linear-gradient(135deg, #10b981, #059669);
        border: 2px solid white;
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.15);
        transform: translate(-50%, -50%);
      }
      .route-summary {
        margin-top: 16px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .mini-card {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 12px;
        padding: 12px;
      }
      .mini-card small { color: #94a3b8; }
      .mini-card strong { display: block; font-size: 1.2rem; margin-top: 4px; }
      .sidebar .box {
        background: rgba(15, 23, 42, 0.55);
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        padding: 14px;
        margin-bottom: 14px;
      }
      .box h3 { margin-top: 0; }
      .money {
        font-size: 2rem;
        font-weight: 800;
        color: #34d399;
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        padding: 8px 0;
      }
      .stat-row:last-child { border-bottom: none; }
      ul { margin: 0; padding-left: 18px; color: #cbd5e1; }
      li { margin-bottom: 6px; }
      @media (max-width: 980px) {
        .layout { grid-template-columns: 1fr; }
        .controls { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <header class="header">
        <div>
          <h1>MHD Simulator – Map Dashboard</h1>
        </div>
        <div class="meta">
          <div class="pill status" id="routeStatus">V provozu</div>
          <div class="pill time" id="clockDisplay">06:00</div>
        </div>
      </header>

      <main class="layout">
        <section class="map-panel">
          <div class="controls">
            <label>
              Dopravce
              <select id="operatorSelect"></select>
            </label>
            <label>
              Linka
              <select id="routeSelect"></select>
            </label>
          </div>

          <div class="map-box" id="mapBox">
            <svg id="mapSvg" class="route-line" viewBox="0 0 1000 420" preserveAspectRatio="none"></svg>
          </div>

          <div class="route-summary">
            <div class="mini-card">
              <small>Aktualní zastávka</small>
              <strong id="currentStop">-</strong>
            </div>
            <div class="mini-card">
              <small>Další zastávka</small>
              <strong id="nextStop">-</strong>
            </div>
            <div class="mini-card">
              <small>Vozidlo</small>
              <strong id="vehicleName">-</strong>
            </div>
          </div>
        </section>

        <aside class="sidebar">
          <div class="box">
            <h3>Kasa</h3>
            <div class="money" id="cashValue">0 Kč</div>
            <label>
              Typ jízdenky
              <select id="ticketType">
                <option value="normal">Běžná</option>
                <option value="student">Student</option>
                <option value="reduced">Zlevněná</option>
                <option value="monthly">Měsíční</option>
              </select>
            </label>
            <button id="sellTicketBtn" style="margin-top:10px;">Prodat jízdenku</button>
          </div>

          <div class="box">
            <h3>Statistiky</h3>
            <div class="stat-row"><span>Cestující</span><strong id="passengerCount">0</strong></div>
            <div class="stat-row"><span>V autobuse</span><strong id="inBusCount">0</strong></div>
            <div class="stat-row"><span>Výnos</span><strong id="revenue">0 Kč</strong></div>
          </div>

          <div class="box">
            <h3>Jízdní řád</h3>
            <ul id="scheduleList"></ul>
          </div>

          <div class="box">
            <h3>Provozní záznam</h3>
            <ul id="logList"></ul>
          </div>
        </aside>
      </main>
    </div>

    <script src="map-dashboard.js"></script>
  </body>
</html>
