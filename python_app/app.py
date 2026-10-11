import tkinter as tk
from tkinter import ttk, messagebox


class BusSimulatorApp:
    def __init__(self, root=None):
        self.root = root or tk.Tk()
        self.root.title("MHD simulátor - hlásič zastávek a kasa")
        self.root.geometry("1100x700")
        self.root.configure(bg="#f1f5f9")

        self.route = [
            "Náměstí",
            "Hlavní nádraží",
            "Muzeum",
            "Kostel",
            "Tř. Míru",
            "Park",
            "ZŠ Na Nábřeží",
            "Sídliště Jih",
            "Krizovatka",
            "Nádražní okruh",
        ]
        self.current_stop_index = 0
        self.direction = 1
        self.doors_open = False
        self.running = True
        self.cash = 0.0
        self.total_passengers = 0
        self.log = []

        self._build_ui()
        self.update_status()

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

        state_frame = ttk.LabelFrame(left, text="Stav vozidla", padding=10)
        state_frame.grid(row=1, column=0, columnspan=3, sticky="ew", pady=(0, 12))
        state_frame.columnconfigure(0, weight=1)
        state_frame.columnconfigure(1, weight=1)

        self.stop_var = tk.StringVar(value=self.route[self.current_stop_index])
        ttk.Label(state_frame, text="Aktuální zastávka:", font=("Arial", 11, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(state_frame, textvariable=self.stop_var, font=("Arial", 13, "bold"), foreground="#0f172a").grid(row=0, column=1, sticky="w")

        self.door_var = tk.StringVar(value="Zavřeno")
        ttk.Label(state_frame, text="Dveře:", font=("Arial", 11, "bold")).grid(row=1, column=0, sticky="w")
        ttk.Label(state_frame, textvariable=self.door_var, font=("Arial", 12, "bold"), foreground="#0f172a").grid(row=1, column=1, sticky="w")

        self.direction_var = tk.StringVar(value="Směr: vpřed")
        ttk.Label(state_frame, text="Směr:", font=("Arial", 11, "bold")).grid(row=2, column=0, sticky="w")
        ttk.Label(state_frame, textvariable=self.direction_var, font=("Arial", 12, "bold")).grid(row=2, column=1, sticky="w")

        controls = ttk.Frame(left)
        controls.grid(row=2, column=0, columnspan=3, sticky="ew", pady=(0, 12))
        controls.columnconfigure(0, weight=1)
        controls.columnconfigure(1, weight=1)
        controls.columnconfigure(2, weight=1)

        ttk.Button(controls, text="Další zastávka", command=self.next_stop).grid(row=0, column=0, padx=(0, 8), sticky="ew")
        ttk.Button(controls, text="Otevřít dveře", command=self.toggle_doors).grid(row=0, column=1, padx=8, sticky="ew")
        ttk.Button(controls, text="Stop", command=self.toggle_run).grid(row=0, column=2, padx=(8, 0), sticky="ew")

        announcer_label = ttk.Label(left, text="Hlásič zastávek", font=("Arial", 16, "bold"))
        announcer_label.grid(row=3, column=0, columnspan=3, sticky="w", pady=(0, 8))

        self.announcer_text = tk.Text(left, height=8, wrap="word", font=("Arial", 11), bg="#ffffff")
        self.announcer_text.grid(row=4, column=0, columnspan=3, sticky="nsew")
        self.announcer_text.insert("end", "Příprava vozidla...\n")
        self.announcer_text.config(state="disabled")

        log_label = ttk.Label(left, text="Záznam provozu", font=("Arial", 16, "bold"))
        log_label.grid(row=5, column=0, columnspan=3, sticky="w", pady=(8, 8))

        self.log_box = tk.Text(left, height=10, wrap="word", font=("Arial", 10), bg="#ffffff")
        self.log_box.grid(row=6, column=0, columnspan=3, sticky="nsew")
        self.log_box.config(state="disabled")

        cash_frame = ttk.LabelFrame(right, text="Kasa", padding=12)
        cash_frame.pack(fill="x", pady=(0, 12))

        self.cash_var = tk.StringVar(value="0,00 Kč")
        ttk.Label(cash_frame, text="Tržba:", font=("Arial", 12, "bold")).pack(anchor="w")
        ttk.Label(cash_frame, textvariable=self.cash_var, font=("Arial", 18, "bold"), foreground="#14532d").pack(anchor="w", pady=(4, 12))

        ticket_types = ["Běžná", "Student", "Měsíční"]
        self.ticket_var = tk.StringVar(value=ticket_types[0])
        ttk.Label(cash_frame, text="Typ jízdenky:", font=("Arial", 11, "bold")).pack(anchor="w")
        ticket_menu = ttk.Combobox(cash_frame, textvariable=self.ticket_var, values=ticket_types, state="readonly")
        ticket_menu.pack(fill="x", pady=(4, 10))

        ttk.Button(cash_frame, text="Prodat jízdenku", command=self.sell_ticket).pack(fill="x")

        stats_frame = ttk.LabelFrame(right, text="Statistiky", padding=12)
        stats_frame.pack(fill="x", pady=(12, 0))

        self.passengers_var = tk.StringVar(value="0")
        self.revenue_var = tk.StringVar(value="0,00 Kč")

        ttk.Label(stats_frame, text="Počet cestujících:", font=("Arial", 11, "bold")).pack(anchor="w")
        ttk.Label(stats_frame, textvariable=self.passengers_var, font=("Arial", 14)).pack(anchor="w", pady=(4, 10))
        ttk.Label(stats_frame, text="Výnos:", font=("Arial", 11, "bold")).pack(anchor="w")
        ttk.Label(stats_frame, textvariable=self.revenue_var, font=("Arial", 14)).pack(anchor="w", pady=(4, 0))

    def _add_log(self, message):
        self.log.append(message)
        self.log_box.config(state="normal")
        self.log_box.insert("end", message + "\n")
        self.log_box.see("end")
        self.log_box.config(state="disabled")

    def _announce(self, text):
        self.announcer_text.config(state="normal")
        self.announcer_text.delete("1.0", "end")
        self.announcer_text.insert("end", text + "\n")
        self.announcer_text.config(state="disabled")

    def toggle_run(self):
        self.running = not self.running
        if self.running:
            self._add_log("Vozidlo opět v provozu.")
        else:
            self._add_log("Vozidlo bylo pozastaveno.")

    def toggle_doors(self):
        self.doors_open = not self.doors_open
        self._add_log(f"Dveře {'otevřeny' if self.doors_open else 'zavřeny'}.")
        self.update_status()

    def next_stop(self):
        if not self.running:
            self._add_log("Vozidlo je pozastaveno, nelze jet dál.")
            return

        if self.current_stop_index + self.direction >= len(self.route) or self.current_stop_index + self.direction < 0:
            self.direction *= -1
            self._add_log("Konec směru, otáčení vozu.")

        self.current_stop_index += self.direction
        self.total_passengers += 2

        current = self.route[self.current_stop_index]
        previous = self.route[self.current_stop_index - self.direction] if self.current_stop_index - self.direction >= 0 and self.current_stop_index - self.direction < len(self.route) else "začátek trasy"

        self._announce(f"Příští zastávka: {current}.\nVystupujte a nastupujte, prosím.")
        self._add_log(f"Vozidlo dorazilo na zastávku: {current}. Předchozí: {previous}.")
        self.update_status()

    def sell_ticket(self):
        type_name = self.ticket_var.get()
        prices = {"Běžná": 30, "Student": 20, "Měsíční": 500}
        amount = prices[type_name]
        self.cash += amount
        self.total_passengers += 1
        self._add_log(f"Prodána {type_name.lower()} jízdenka za {amount} Kč.")
        self.update_status()

    def update_status(self):
        self.stop_var.set(self.route[self.current_stop_index])
        self.door_var.set("Otevřeno" if self.doors_open else "Zavřeno")
        self.direction_var.set("Směr: vpřed" if self.direction > 0 else "Směr: zpět")
        self.cash_var.set(f"{self.cash:,.2f} Kč")
        self.passengers_var.set(str(self.total_passengers))
        self.revenue_var.set(f"{self.cash:,.2f} Kč")

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    app = BusSimulatorApp()
    app.run()
