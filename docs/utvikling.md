# Utvikling

Denne siden samler utvikleroppsett, build-kommandoer og nyttige debug-verktøy.

## Krav

- [Node.js](https://nodejs.org/) og `npm`
- `git`
- Python og `pip` hvis du skal bygge eller serve MkDocs

## Kom i gang

```bash
git clone https://github.com/MathiasDevelopes/inskewl.git
cd inskewl
npm install
```

## Bygg userscriptet

```bash
npm run build
```

Den ferdige userscript-filen legges i:

```text
dist/inskewl.user.js
```

## Utviklingsmodus

```bash
npm run dev
```

Dette starter Rollup i watch-modus, slik at userscriptet bygges på nytt når kildekoden endres.

## Lage en modul

Se [Lage en enkel modul](modul-eksempel.md) for et komplett eksempel på en
liten modul med TypeScript, DOM-injisering, registrering i `main.ts` og et
valgfritt API-kall.

## Dokumentasjon

Installer Python-avhengigheter først:

```bash
python -m pip install -r requirements.txt
```

Kjør dokumentasjonen lokalt:

```bash
npm run docs:serve
```

Bygg dokumentasjonen strengt:

```bash
npm run docs:build
```

## Testing av API-schemas

Hvis VIS endrer API-et sitt, kan Zod-schemaene feile. Prosjektet eksponerer derfor en testfunksjon i nettleseren.

1. Logg inn på VIS InSchool.
2. Åpne utviklerverktøyet i nettleseren.
3. Gå til **Console**.
4. Kjør:

```javascript
testAllApiSchemas()
```

Kommandoen tester kjente API-endepunkter og skriver resultatet i konsollen.

## Runtime debug-info

Prosjektet eksponerer også en enkel diagnosefunksjon i nettleseren. Den kan
brukes ved teknisk feilsøking for å kontrollere hvilken versjon av userscriptet
som kjører, om siden er en gyldig VIS-tenant, og hvilken skole-/innloggingsinfo
`login-page`-endepunktet returnerer.

1. Logg inn på VIS InSchool.
2. Åpne utviklerverktøyet i nettleseren.
3. Gå til **Console**.
4. Kjør:

```javascript
debugInfo()
```

Funksjonen skriver resultatet i konsollen. Hvis `login-page`-kallet feiler,
logges feilen sammen med resten av diagnoseinformasjonen.

## Metadata for CI-builds

Builden kan overstyre deler av userscript-metablocken med miljøvariabler. Dette brukes for CI og release-builds uten å endre `meta.json`.

| Variabel | Brukes til | Standardverdi |
| --- | --- | --- |
| `BUILD_VERSION` | Setter `@version` i userscriptet | `version` fra `package.json` |
| `UPDATE_URL` | Setter `@updateURL` i userscriptet | Verdien fra `meta.json` |
| `DOWNLOAD_URL` | Setter `@downloadURL` i userscriptet | Verdien fra `UPDATE_URL`, ellers `meta.json` |

Eksempel:

```bash
BUILD_VERSION=1.1.3-dev.abc1234 \
UPDATE_URL=https://mathiasdevelopes.github.io/inskewl/dev/inskewl.user.js \
npm run build
```
