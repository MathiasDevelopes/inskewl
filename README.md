# inskewl
WIP

## Hva gjør dette?
inskewl skal være et modulbasert userscript som kan legge til funksjoner som ikke normalt fines i InSchool.

## Hva er inkludert?
Foreløpig veldig lite, basic implementasjon av api helpers og noen få endpoints.

## Authentication?
Siden dette kjøres som et userscript, må du bare logge inn på InSchool.

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

## TODO
- [ ] CI for automatisk bygging av UserScript, og GitHub Release på ny versjon.
- [ ] Eksporter timeplan til .ics (modul)
- [ ] Kan jeg ta fravær? (modul)
- [ ] Dokumentasjon om API-et.
