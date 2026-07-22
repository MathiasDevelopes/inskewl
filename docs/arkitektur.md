# Arkitektur

`inskewl` er bygget som et modulært userscript. Hver funksjon ligger i en egen modul, mens felles kode for lasting, DOM-injisering og API-kall ligger i egne mapper.

## Overordnet flyt

1. Userscriptet lastes inn på VIS InSchool.
2. `main.ts` oppretter modulene.
3. `UrlWatcher` følger med på hvilken side brukeren er på.
4. `ModuleLoader` bestemmer hvilke moduler som skal være aktive.
5. Modulene injiserer knapper, paneler eller annen UI ved behov.

## Moduler

Moduler arver fra en felles `VismaModule`-struktur og kan definere:

- når modulen skal lastes
- hvilke elementer som skal injiseres
- hva som skal skje når siden endres
- opprydding når modulen fjernes

Dette gjør at funksjoner som fraværskalkulator og kalendereksport kan utvikles hver for seg.

## API-lag

API-koden ligger i `src/api`. Endepunktene er delt etter fagområde, for eksempel calendar, timetable og attendance.

Prosjektet bruker Zod for runtime-validering av data fra VIS InSchool. Det betyr at dataene ikke bare types i TypeScript, men også sjekkes når de kommer fra API-et.

Siden API-et er udokumentert og ustabilt, er valideringen funksjonsdrevet:

- Endepunktene bygger bare forespørsler (URL, parametere, pålogging). De tar imot et Zod-schema som et påkrevd argument og validerer svaret mot det.
- Schemaene i `src/api/types` er en katalog over kjente felt i API-et, ikke en kontrakt som håndheves for hele svaret.
- Hver modul har en egen `schemas.ts` som plukker (`pick`) feltene den faktisk bruker fra katalogen. Transformeringer og feltdokumentasjon følger med.

En endring i et felt ingen moduler bruker, ødelegger derfor ingenting. En endring i et felt en modul bruker, feiler umiddelbart og synlig — bare for den modulen. `testAllApiSchemas()` (se Utvikling) sjekker hele katalogen mot det virkelige API-et og fanger opp endringer i feltene ingen bruker ennå.

## DOM-injisering

Modulene legger UI inn i eksisterende VIS InSchool-sider. Dette skjer gjennom felles DOM-hjelpere og injectables.

## Hvorfor modulær struktur?

Fordeler:

- Nye funksjoner kan legges til uten å endre hele prosjektet.
- Feil i én modul trenger ikke nødvendigvis å ødelegge andre moduler.
- Koden blir enklere å teste og forklare.
- Felles funksjoner kan flyttes til `utils` eller API-laget når flere moduler trenger dem.
