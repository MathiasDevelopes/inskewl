# inskewl
WIP

## Hva gjør dette?
inskewl skal være et modulbasert userscript som kan legge til funksjoner som ikke normalt finnes i InSchool.

## Hva er inkludert?
Noen få API endpoints er implementert, disse oppdateres foreløpig når min kode trenger de.

## Authentication?
Bruker bare nettleseren sine credentials for fetch requests.

# Building
Det er veldig enkelt å builde dette userscriptet, hvis du vil legge til mer moduler eller bare builde det selv.

### Requirements
- Node
- npm
- git

## Linux/MacOS/Windows
```sh
git clone https://github.com/MathiasDevelopes/inskewl.git
cd inskewl
npm install
npm run build
```

Du vil nå finne `inskewl.user.js` i `dist` mappen i prosjektet.
