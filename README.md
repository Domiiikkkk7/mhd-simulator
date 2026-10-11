# MHD Simulátor - Hlásič Zastávek a Kasa

Realistický simulátor městské hromadné dopravy s grafickým rozhraním postavený na Pygame.

## Funkce

- 🚌 **Hlásič zastávek** - zvukový a vizuální systém
- 💳 **Interaktivní kasa** - nákup jízdenek, platby
- 📍 **Jízdní řád** - více tras, různé zastávky
- 🎨 **Grafické rozhraní** - simulátor kabiny vozidla
- 📊 **Statistika** - sledování cestujících a výnosů
- ⏰ **Real-time čas** - reálné jízdní doby

## Instalace

```bash
pip install -r requirements.txt
python main.py
```

## Řídící klávesy

- **MEZERNÍK** - Příště zastávka
- **K** - Otevřít/zavřít dveře
- **P** - Pauza
- **ESC** - Konec
- **M** - Otevřít menu

## Struktura projektu

```
.
├── main.py              # Hlavní aplikace
├── bus.py               # Logika vozidla
├── route.py             # Definice tras a zastávek
├── announcer.py         # Hlásič zastávek
├── cashier.py           # Systém kasy
├── ui/
│   ├── display.py       # Vykreslování displeje
│   ├── keyboard.py      # Zpracování vstupů
│   └── fonts/           # Fonty a grafika
└── data/
    ├── routes.json      # Konfigurace tras
    └── timetable.json   # Jízdní řád
```

## Autor

Domiiikkkk7
