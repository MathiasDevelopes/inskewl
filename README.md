# inskewl

Gjør VIS InSchool litt enklere for elever.

[![GitHub release](https://img.shields.io/github/v/release/MathiasDevelopes/inskewl?style=flat-square&label=versjon)](https://github.com/MathiasDevelopes/inskewl/releases)
[![License](https://img.shields.io/github/license/MathiasDevelopes/inskewl?style=flat-square&label=lisens)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-github%20pages-2ea44f?style=flat-square)](https://mathiasdevelopes.github.io/inskewl/)

`inskewl` er et uoffisielt userscript som legger til ekstra funksjoner i VIS InSchool. Det er laget for elever som vil få bedre oversikt over fravær og timeplan uten å gjøre alt manuelt.

## Hva får du?

- **Fraværskalkulator:** prøv ut fremtidig fravær og se hvordan det kan påvirke fraværsprosenten din.
- **Kalendereksport:** last ned timeplanen som en kalenderfil du kan importere i kalenderappen din.

Fraværskalkulatoren simulerer bare lokalt i nettleseren. Den registrerer ikke fravær og endrer ikke data i VIS InSchool.

## Installer

Du trenger en nettleserutvidelse som kan kjøre userscripts. [Violentmonkey](https://violentmonkey.github.io/) anbefales.

1. Installer [Violentmonkey](https://violentmonkey.github.io/) eller [Tampermonkey](https://www.tampermonkey.net/).
2. Åpne installasjonslenken:

   <https://github.com/MathiasDevelopes/inskewl/releases/latest/download/inskewl.user.js>
3. Trykk **Installer** i fanen som åpnes.
4. Gå til VIS InSchool og refresh siden.

Etter installasjon skal nye valg dukke opp i VIS InSchool når du er inne på dashboardet.

## Brukerveiledning

Full dokumentasjon ligger her:

<https://mathiasdevelopes.github.io/inskewl/>

Start med:

- [Start her](https://mathiasdevelopes.github.io/inskewl/)
- [1. Installer](https://mathiasdevelopes.github.io/inskewl/installasjon/)
- [2. Fraværskalkulator](https://mathiasdevelopes.github.io/inskewl/moduler/fravaerskalkulator/)
- [3. Kalendereksport](https://mathiasdevelopes.github.io/inskewl/moduler/kalendereksport/)
- [Hjelp og feilsøking](https://mathiasdevelopes.github.io/inskewl/hjelp/)

## For utviklere

Prosjektet er bygget med TypeScript, Rollup, Zod og MkDocs. Utviklerdokumentasjon ligger i [docs for utviklere](https://mathiasdevelopes.github.io/inskewl/utvikling/).

Kortversjon:

```bash
npm install
npm run build
```

## Uoffisielt prosjekt

inskewl er ikke tilknyttet Visma eller VIS InSchool. Prosjektet bruker uoffisielle endepunkter og kan måtte oppdateres hvis VIS endrer systemene sine.

## Lisens

[MIT](LICENSE)
