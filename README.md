# inskewl
> Et modulbasert userscript som gjør VIS InSchool bedre

**Status:** Work in progress (ting er i aktiv utvikling, ingen GitHub releases enda)

## Innholdsfortegnelse
- [Om prosjektet](#om-prosjektet)
- [Funksjoner](#funksjoner)
  - [Planlagt](#planlagt)
- [Installasjon](#installasjon)
  - [Forutsetninger](#forutsetninger)
  - [Installasjonssteg](#installasjonssteg)
- [For utviklere (skumle greier)](#for-utviklere-skumle-greier)
  - [Bygg fra kildekode](#bygg-fra-kildekode)
    - [Requirements](#requirements)
    - [Kommandoer](#kommandoer)
    - [Utviklingsmodus](#utviklingsmodus)


## Om prosjektet
**inskewl** er et userscript som legger til grunnleggende funksjonalitet som ikke er der fra starten av.

Opprinnelig laget fordi at VIS InSchool kun støtter eksport av timeplanen din i PDF (i store 2026 🙏)

## Funksjoner
- [X] Eksportere timeplanen din for halvåret til en universell `.ics`-kalenderfil
      (kompatibel med Microsoft Exchange, Google Calendar, Apple Calendar, osv.)
### Planlagt
Neste ting jeg irriterer meg over

# Installasjon
## Forutsetninger
* En moderne nettleser (Chrome, Edge, Firefox, Brave, ...)
* En av disse userscript-managerene 
  * **Violetmonkey** (anbefalt)
  * Tampermonkey
  * Greasemonkey

## Installasjonssteg
1. Last ned nyeste utgave av `inschool.user.js` fra [Releases](https://github.com/MathiasDevelopes/inskewl/releases)
2. Dobbeltrykk på `inschool.user.js` i Nedlastinger mappen din.
3. Trykk installer på fanen som kommer opp.
4. Åpne VIS InSchool, så starter scriptet av seg selv.

# For utviklere (skumle greier)

Vil du bidra eller lage din egen modul? Sjekk ut [wikien](https://github.com/MathiasDevelopes/inskewl/wiki)!

**Kort versjon:**
- Basert på et reverse-engineered, uoffisielt VIS InSchool API
- Sterk typing + runtime validation via Zod
- Moduler er selvstendige, så det er lett å legge til nye funksjoner.
- API-en kan også brukes som standalone bibliotek i andre prosjekter (må fikse autentisering selv).

## Testing API Schemas

For å hjelpe med å rapportere feil i API-schemas, kan du teste alle API-funksjoner direkte i nettleserkonsollen:

1. Åpne VIS InSchool i nettleseren din (du må være logget inn)
2. Åpne Developer Tools (F12)
3. Skriv følgende i konsollen:
   ```javascript
   testAllApiSchemas()
   ```

Dette vil:
- Kalle alle API-endepunkter
- Validere svarene mot Zod-schemas
- Vise en ryddig oppsummering av hvilke tester som passerte/feilet
- Logge detaljerte Zod-feil for eventuelle schema-mismatch

Bruk denne funksjonen for å rapportere tilbakemelding om feil eller manglende Zod-schemas i API-en.

## Bygg fra kildekode

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

Du vil nå finne `inskewl.user.js` i `dist` mappen etterpå.

## Utviklingsmodus
```sh
npm run dev
```
Rebuilder automatisk når du lagrer filer (najs)
