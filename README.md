# inskewl
> Et modulbasert userscript som legger til funksjoner til VIS InSchool

⚠️**Prosjektstatus:** work in progress (mye kan inneholde feil / mangler)

## Innholdsfortegnelse
- [Om prosjektet](#om-prosjektet)
- [Funksjoner](#funksjoner)
- [Installasjon](#installasjon)
  - [Forutsetninger](#forutsetninger)
  - [Steg for steg](#steg-for-steg)
- [For utviklere (skumle greier)](#for-utviklere-skumle-greier)
  - [Autentisering](#autentisering)
  - [Litt om prosjektet](#litt-om-prosjektet)
  - [Funksjoner (API)](#funksjoner-api)
  - [Bygging fra kildekode](#bygging-fra-kildekode)
    - [Requirements](#requirements)
    - [Kommandoer](#kommandoer)
    - [Utviklingsmodus](#utviklingsmodus)


## Om prosjektet
**inskewl** er et userscript som legger til ekstra funksjoner til VIS InSchool

## Funksjoner
KOMMER SNART! :)

# Installasjon
## forutsetninger
* En moderne nettleser (Chrome, Edge, Firefox, Brave, ...)
* En av disse userscript-managerene 
  * **Violetmonkey** (anbefalt)
  * Tampermonkey
  * Greasemonkey

Installer via din nettleser sitt extension-marketplace.

## Steg for steg
1. Dobbeltrykk på `inschool.user.js` i Nedlastinger mappen din.
2. Trykk installer på fanen som kommer opp.
3. Åpne VIS InSchool, så starter scriptet av seg selv.


# For utviklere (skumle greier)

## Autentisering
Userscriptet bruker eksisterende session-cookies, så ingen ekstra login.

## Litt om prosjektet
Prosjektet er bygd rundt:
* et **hjemmelaga API-interface** (med typer)

API mappa er helt selvstendig, så den kan brukes i andre prosjekter.
## Funksjoner
#### API
typed interface til InSchool endpoints

du kan:
* hente data programmatisk
* gjøre handlinger via API-et
* bruke det som standalone bibliotek

## Bygging fra kildekode
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

## Utviklingsmodus
```sh
npm run dev
```
Rebuilder automatisk når du lagrer filen (najs)
