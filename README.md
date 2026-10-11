# MHD Simulátor

Tento projekt obsahuje dva simulátory MHD:

1. Python desktopový simulátor s grafickým rozhraním (Tkinter)
2. Webový simulátor v HTML/CSS/JavaScript

## Struktura projektu

```text
.
├── README.md
├── requirements.txt
├── python_app/
│   ├── main.py
│   ├── app.py
│   └── __init__.py
├── web_app/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── .gitignore
```

## 1) Python desktopová aplikace

Spuštění:

```bash
cd python_app
python main.py
```

Funkce:
- hlásič zastávek s textovým a logovým výstupem
- simulace trasy a přepínání zastávek
- otevření dveří a výpis „Následující zastávka…“
- kasa pro prodej jízdenek
- záznam výnosů a historie provozu

## 2) Webová aplikace

Spuštění:

```bash
cd web_app
python -m http.server 8000
```

Poté otevřete v prohlížeči adresu:

```text
http://localhost:8000
```

Funkce:
- dynamický hlásič zastávek
- přehled trasy a vozidla
- prodej jízdenek a evidence výnosů
- přepínání směru a simulace jízdy

## Ovládání webové verze

- `Následující zastávka` – posune autobus na další zastávku
- `Otevřít dveře` – přepne dveře
- `Běžný` / `Student` / `Měsíční` – prodej jízdenek
- `Stop` – zastaví simulaci

## Ovládání Python verze

- `Další zastávka` – simulace posunu vozu
- `Otevřít dveře` / `Zavřít dveře` – ovládání dveří
- `Prodej jízdenky` – otevře výběr jízdenky
- `Stop` – pozastaví běh

## Autor

Domiiikkkk7
