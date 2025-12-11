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
  - [Litt om prosjektet](#litt-om-prosjektet)
  - [Autentisering](#autentisering)
  - [Funksjoner (API)](#funksjoner-api)
  - [Bygging fra kildekode](#bygging-fra-kildekode)
    - [Requirements](#requirements)
    - [Kommandoer](#kommandoer)
    - [Utviklingsmodus](#utviklingsmodus)


## Om prosjektet
**inskewl** er et userscript som legger til ekstra funksjoner til VIS InSchool

## Funksjoner
### Planlagt
- [ ] Eksportere timeplanen din til en universell `.ics`-kalenderfil  
      (kompatibel med Microsoft Exchange, Google Calendar, Apple Calendar, osv.)
- [ ] Visma Wrapped, oppsummering av skoleåret.

# Installasjon
## Forutsetninger
* En moderne nettleser (Chrome, Edge, Firefox, Brave, ...)
* En av disse userscript-managerene 
  * **Violetmonkey** (anbefalt)
  * Tampermonkey
  * Greasemonkey

Installer en av disse via din nettleser sitt extension-marketplace.

## Steg for steg
1. Last ned nyeste utgave av `inschool.user.js` fra [Releases](https://github.com/MathiasDevelopes/inskewl/releases)
2. Dobbeltrykk på `inschool.user.js` i Nedlastinger mappen din.
3. Trykk installer på fanen som kommer opp.
4. Åpne VIS InSchool, så starter scriptet av seg selv.

# For utviklere (skumle greier)

## Litt om prosjektet
Prosjektet er bygd rundt:
* et **hjemmelaga API-interface** (med typer, data validation)

## Autentisering
Userscriptet bruker eksisterende session-cookies, så ingen ekstra login.

API mappa er helt selvstendig, så den kan brukes i andre prosjekter.
## Funksjoner
#### API
typed interface til InSchool endpoints

du kan:
* hente data programmatisk
* gjøre handlinger via API-et
* bruke det som standalone bibliotek (du må selv fikse autentisering)

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
