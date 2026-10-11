import tkinter as tk
from tkinter import ttk


class RealisticBusSimulatorApp:
    def __init__(self, root=None):
        self.root = root or tk.Tk()
        self.root.title("MHD simulátor – reálné dopravní podniky")
        self.root.geometry("1100x720")
        self.root.configure(bg="#edf3fb")

        self.operators = {
            "ostrava": {
                "name": "Dopravní podnik Ostrava",
                "short": "DP Ostrava",
                "routes": {
                    "20": ["Náměstí Republiky", "Hlavní nádraží", "Moravská Ostrava", "Muzeum", "Slezská", "Vítkovice", "Poruba"],
                    "30": ["Kosmonautů", "Hlavní nádraží", "Mírové náměstí", "Přívoz", "Borská", "Muglinov"],
                }
            },
            "usti": {
                "name": "DP města Ústí nad Labem",
                "short": "DP Ústí",
                "routes": {
                    "1": ["Náměstí Republiky", "Větrník", "Muzeum", "Kostelní náměstí", "Nádražní", "Předměstí"],
                    "2": ["Město", "ZŠ", "Lužické náměstí", "Pohled", "Koryto", "Hrad"],
                }
            },
            "decin": {
                "name": "DP města Děčína",
                "short": "DP Děčín",
                "routes": {
                    "1": ["Nádražní", "Městské divadlo", "Dlouhá", "Podhorská", "Děčínský park"],
                    "2": ["Lábská", "Křemencová", "Kostelní náměstí", "Náměstí", "Městská nemocnice"],
                }
            },
            "liberec": {
                "name": "Inter Line Liberec",
                "short": "Inter Line",
                "routes": {
                    "1": ["Centrum", "Městský park", "Nádražní", "Jablonecká", "Kříž"],
                    "2": ["Hlavní nádraží", "Nové Město", "Sokolovská", "Vratislavice"],
                }
            }
        }

        self.operator_var = tk.StringVar(value="ostrava")
        self.route_var = tk.StringVar(value="20")
        self.current_stop_index = 0
        self.direction = 1
        self.doors_open = False
        self.running = True
        self.cash = 0.0
        self.passengers = 0
        self.log = []

        self._build_ui()
        self._refresh_routes()
        self._update_status()

    def _build_ui(self):
        self.root.columnconfigure(0, weight=3)
        self.root.columnconfigure(1, weight=2)
        self.root.rowconfigure(0, weight=1)

        left = ttk.Frame(self.root, padding=16)
        left.grid(row=0, column=0, sticky="nsew")

        right = ttk.Frame(self.root, padding=16)
        right.grid(row=0, column=1, sticky="nsew")

        title = ttk.Label(left, text="MHD SIMULÁTOR", font=("Arial", 22, "bold"))
        title.grid(row=0, column=0, columnspan=3, sticky="w", pady=(0, 12))

        ttk.Label(left, text="Dopravní podnik:", font=("Arial", 10, "bold")).grid(row=1, column=0, sticky="w")
        operator_box = ttk.Combobox(left, textvariable=self.operator_var, state="readonly")
        operator_box.grid(row=1, column=1, sticky="ew", padx=(8, 12))
        operator_box.bind("<<ComboboxSelected>>", lambda e: self._refresh_routes())

        ttk.Label(left, text="Linka:", font=("Arial", 10, "bold")).grid(row=1, column=2, sticky="w")
        self.route_box = ttk.Combobox(left, textvariable=self.route_var, state="readonly")
        self.route_box.grid(row=1, column=3, sticky="ew", padx=(8, 0))
        self.route_box.bind("<<ComboboxSelected>>", lambda e: self._select_route())

        self._populate_operator_values()

        state_frame = ttk.LabelFrame(left, text="Stav vozidla", padding=10)
        state_frame.grid(row=2, column=0, columnspan=4, sticky="ew", pady=(12, 12))

        self.stop_var = tk.StringVar(value="")
        ttk.Label(state_frame, text="Aktuální zastávka:", font=("Arial", 11, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(state_frame, textvariable=self.stop_var, font=("Arial", 13, "bold")).grid(row=0, column=1, sticky="w")

        self.doors_var = tk.StringVar(value="Zavřeno")
        ttk.Label(state_frame, text="Dveře:", font=("Arial", 11, "bold")).grid(row=1, column=0, sticky="w")
        ttk.Label(state_frame, textvariable=self.doors_var, font=("Arial", 12, "bold")).grid(row=1, column=1, sticky="w")

        controls = ttk.Frame(left)
        controls.grid(row=3, column=0, columnspan=4, sticky="ew", pady=(0, 10))
        ttk.Button(controls, text="Další zastávka", command=self.next_stop).grid(row=0, column=0, padx=(0, 8), sticky="ew")
        ttk.Button(controls, text="Otevřít dveře", command=self.toggle_doors).grid(row=0, column=1, padx=8, sticky="ew")
        ttk.Button(controls, text="Stop", command=self.toggle_run).grid(row=0, column=2, padx=(8, 0), sticky="ew")

        ttk.Label(left, text="Hlásič zastávek", font=("Arial", 16, "bold")).grid(row=4, column=0, columnspan=4, sticky="w", pady=(8, 6))
        self.announcer = tk.Text(left, height=8, wrap="word", font=("Arial", 11), bg="#ffffff")
        self.announcer.grid(row=5, column=0, columnspan=4, sticky="nsew")
        self.announcer.config(state="disabled")

        self.log_box = tk.Text(left, height=10, wrap="word", font=("Arial", 10), bg="#ffffff")
        self.log_box.grid(row=6, column=0, columnspan=4, sticky="nsew", pady=(12, 0))
        self.log_box.config(state="disabled")

        cash_frame = ttk.LabelFrame(right, text="Kasa", padding=12)
        cash_frame.pack(fill="x", pady=(0, 12))

        self.cash_var = tk.StringVar(value="0,00 Kč")
        ttk.Label(cash_frame, text="Tržba:", font=("Arial", 12, "bold")).pack(anchor="w")
        ttk.Label(cash_frame, textvariable=self.cash_var, font=("Arial", 18, "bold"), foreground="#14532d").pack(anchor="w", pady=(4, 12))

        ticket_types = ["Běžná", "Student", "Zlevněná", "Měsíční"]
        self.ticket_var = tk.StringVar(value=ticket_types[0])
        ttk.Label(cash_frame, text="Typ jízdenky:", font=("Arial", 11, "bold")).pack(anchor="w")
        ticket_menu = ttk.Combobox(cash_frame, textvariable=self.ticket_var, values=ticket_types, state="readonly")
        ticket_menu.pack(fill="x", pady=(4, 10))
        ttk.Button(cash_frame, text="Prodat jízdenku", command=self.sell_ticket).pack(fill="x")

        stats_frame = ttk.LabelFrame(right, text="Statistiky", padding=12)
        stats_frame.pack(fill="x", pady=(12, 0))

        self.passengers_var = tk.StringVar(value="0")
        ttk.Label(stats_frame, text="Počet cestujících:", font=("Arial", 11, "bold")).pack(anchor="w")
        ttk.Label(stats_frame, textvariable=self.passengers_var, font=("Arial", 14)).pack(anchor="w", pady=(4, 10))

    def _populate_operator_values(self):
        values = list(self.operators.keys())
        formatted = [self.operators[v]["name"] for v in values]
        self.operator_var.set(values[0])
        # set combobox values by replacing widget content on the fly
        try:
            self.root.children["!combobox"].configure(values=formatted)
        except Exception:
            pass

    def _refresh_routes(self):
        operator_key = self.operator_var.get()
        routes = list(self.operators[operator_key]["routes"].keys())
        self.route_box.config(values=routes)
        self.route_var.set(routes[0])
        self._select_route()

    def _select_route(self):
        operator_key = self.operator_var.get()
        route_name = self.route_var.get()
        if route_name not in self.operators[operator_key]["routes"]:
            return
        self.current_stop_index = 0
        self.direction = 1
        self.doors_open = False
        self.running = True
        self._update_status()

    def _add_log(self, message):
        self.log.append(message)
        self.log_box.config(state="normal")
        self.log_box.insert("end", message + "\n")
        self.log_box.see("end")
        self.log_box.config(state="disabled")

    def _announce(self, text):
        self.announcer.config(state="normal")
        self.announcer.delete("1.0", "end")
        self.announcer.insert("end", text + "\n")
        self.announcer.config(state="disabled")

    def _current_route(self):
        operator_key = self.operator_var.get()
        route_key = self.route_var.get()
        return self.operators[operator_key]["routes"][route_key]

    def toggle_run(self):
        self.running = not self.running
        self._add_log("Vozidlo bylo " + ("spuštěno" if self.running else "pozastaveno") + ".")

    def toggle_doors(self):
        self.doors_open = not self.doors_open
        self._add_log(f"Dveře {'otevřeny' if self.doors_open else 'zavřeny'}.")
        self._update_status()

    def next_stop(self):
        route = self._current_route()
        if not self.running:
            self._add_log("Vozidlo je zastaveno, nelze jet dál.")
            return

        if self.current_stop_index + self.direction >= len(route) or self.current_stop_index + self.direction < 0:
            self.direction *= -1
            self._add_log("Konec trasy, směr se mění.")

        self.current_stop_index += self.direction
        self.passengers += 2
        stop = route[self.current_stop_index]
        self._announce(f"{self.operators[self.operator_var.get()]['name']}, linka {self.route_var.get()}. Příští zastávka: {stop}. Vystupujte a nastupujte, prosím.")
        self._add_log(f"Vozidlo dorazilo na zastávku: {stop}.")
        self._update_status()

    def sell_ticket(self):
        ticket_price = {
            "Běžná": 30,
            "Student": 20,
            "Zlevněná": 15,
            "Měsíční": 500,
        }[self.ticket_var.get()]
        self.cash += ticket_price
        self.passengers += 1
        self._add_log(f"Prodána {self.ticket_var.get().lower()} jízdenka za {ticket_price} Kč.")
        self._update_status()

    def _update_status(self):
        route = self._current_route()
        if not route:
            return

        self.stop_var.set(route[self.current_stop_index])
        self.doors_var.set("Otevřeno" if self.doors_open else "Zavřeno")
        self.cash_var.set(f"{self.cash:,.2f} Kč")
        self.passengers_var.set(str(self.passengers))

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = RealisticBusSimulatorApp()
    app.run()
