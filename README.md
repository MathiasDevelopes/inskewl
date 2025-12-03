# inskewl
> et modulbasert userscript som 

⚠️**Prosjektstatus:** work in progress (mye kan inneholde feil / mangler)

## Innholdsfortegnelse

## Om prosjektet
**inskewl** er en drop-in addon til inschool. målet er å legge til nyttige ting til InSchool.

prosjektet er bygd rundt:
* et **hjemmelaga API-interface** (med typer)

API mappa er helt selvstendig, så den kan brukes i andre prosjekter.
## Funksjoner
#### API
typed interface til InSchool endpoints

du kan:
* hente data programmatisk
* gjøre handlinger via API-et
* bruke det som standalone bibliotek

## autentisering
userscriptet bruker eksisterende session-cookies, så ingen ekstra login.

# installasjon
## forutsetninger
* en moderne nettleser
* en userscript-manager
  * **Violetmonkey** (anbefalt)
  * Tampermonkey
  * Greasemonkey

## steg for steg
1. åpne `inschool.user.js` i en nettleser.
2. trykk installer på prompten som kommer opp.
3. åpne InSchool, så starter scriptet av seg selv

# Bygging fra kildekode
Hvis du vil bygge scriptet selv.

### Requirements
- Node
- npm
- git

## Kommandoer
```sh
git clone https://github.com/MathiasDevelopes/inskewl.git
cd inskewl
npm install
npm run build
```

Du vil nå finne `inskewl.user.js` i `dist` mappen i prosjektet.

## utviklingsmodus
```sh
npm run dev
```
rebuilder automatisk når du jobber
