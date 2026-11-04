# Quizly

Minimalistyczna aplikacja React JS do nauki Cisco CCNA 1 (ITN v7.0).
Interfejs oparty na HeroUI v3, lokalny font Hanken Grotesk i interaktywna ilustracja Hairline. Wszystkie widoki mają ciemną estetykę home, przyciski akcji Specular Button i tło Dither z React Bits.

## Uruchomienie

Wymagany Node.js 22.12+ lub 24 LTS i npm. W folderze projektu:

```sh
npm install
npm run dev
```

Otwórz adres wypisany przez Vite (domyślnie http://127.0.0.1:5173).

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

`build` tworzy statyczne pliki w `dist/`. Aplikacja nie wymaga backendu,
kluczy API, kont ani bazy danych. Dostęp sieciowy potrzebny jest tylko do
ładowania zdalnych obrazów, jeśli zawiera je zaimportowana baza.

## Widoki

- `/` — jeden nagłówek, przyciski „Losuj 40 pytań” i „Losuj 1 pytanie” oraz wyspa LAN z komputerem, serwerem, routerem i switchem na wspólnej podstawie na tle Dither (`colorNum=16`, `scale=0.6`, `waveFrequency=3.1`). Pakiet płynie przez router i switch do komputera lub serwera. Najechanie lekko unosi wybrane urządzenie i wyróżnia jego połączenie. Przy ograniczeniu ruchu transmisja zatrzymuje się; poza ekranem pętla zasypia.
- `/moduly` — sprawdzian z modułów 1–3, liczba dostępnych pytań, podgląd treści i odpowiedzi oraz ćwiczenia. Stopka: © 2026 Mateusz Jeżykowski. Widok nie zawiera importu ani opisów pochodzenia bazy.
- Bez dostępnej bazy przyciski na home prowadzą do strony modułów. Krótsza pula w teście oznacza wszystkie dostępne pytania.

Routing używa zwykłych linków. Hosting statyczny musi przekierowywać `/moduly` do `index.html` (fallback SPA); Vite dev/preview obsługuje ten adres.

Ilustrację utworzono za pomocą [hairline-create](https://github.com/lucasmarkes/hairline/tree/main/skills/hairline-create). Niezmieniony silnik i jego licencja MIT znajdują się w `public/hairline/`; autorska figura to `network.js`. Przy braku pliku lub błędzie uruchomienia ilustracji home wyświetla jej statyczny odpowiednik SVG, a quiz nadal działa. Edytowalne prototypy i instrukcja odtworzenia podglądów znajdują się w [design/network](design/network/README.md), poza plikami publikowanymi.

Komponenty [React Bits](https://reactbits.dev/) są zapisane lokalnie w `src/components/react-bits/` wraz z licencją źródła. Kopia pełnej licencji jest publikowana jako `/licenses/react-bits-LICENSE.txt`. WebGL2 renderuje Dither i światło na przyciskach. Tło animuje się tylko na home; moduły, quiz i wyniki wyświetlają przyciemnioną, nieruchomą klatkę bez animacji wejścia. Przy ograniczeniu ruchu efekty pozostają statyczne; bez WebGL lub po utracie kontekstu przyciski zachowują szklaną ramkę CSS, a tło jest jednolite. Usuwane komponenty zwalniają kontekst WebGL; odroczenie zwolnienia o jeden obrót pętli pozwala React StrictMode ponownie uruchomić efekt na tym samym canvasie.

## Wyłączone indeksowanie

`index.html` zawiera statyczne `noindex, nofollow`, widoczne także bez JavaScriptu. Vite dev i preview dodają `X-Robots-Tag: noindex, nofollow` do odpowiedzi, w tym plików bazy i ilustracji. `public/_headers`, kopiowany do `dist/_headers`, ustawia tę samą regułę na wszystkich ścieżkach hostingu [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/headers/) i [Netlify](https://docs.netlify.com/manage/routing/headers/).

`robots.txt` pozwala pobrać strony, żeby robot mógł przeczytać `noindex` — blokada crawlowania uniemożliwiłaby odczyt tej dyrektywy ([dokumentacja Google](https://developers.google.com/search/docs/crawling-indexing/block-indexing)). Nie dodawaj `Disallow: /` jako zamiennika `noindex`.

Na innym hostingu ustaw globalny nagłówek `X-Robots-Tag: noindex, nofollow` w jego konfiguracji. Po wdrożeniu sprawdź `curl -I https://domena/`, `/moduly` i `/questions.json`. Lokalny test nie potwierdza konfiguracji przyszłego serwera. `noindex` nie ogranicza dostępu do aplikacji ani bazy pytań.

## Co jest gotowe

- Wspólna pula na home oraz sprawdzian 1–3 z podglądem pytań na osobnej stronie.
- Test: 40 pytań bez powtórek, a dla krótszej puli wszystkie dostępne.
  Nawigacja wstecz, przechodzenie do wybranego pytania, wynik procentowy
  i przegląd odpowiedzi dopiero po zakończeniu. Brak odpowiedzi to błąd.
- Szybkie pytanie: ocena po zatwierdzeniu, poprawne odpowiedzi i wyjaśnienie,
  jeśli znajduje się w bazie. Następne pytanie unika bezpośredniego powtórzenia,
  jeśli pula zawiera co najmniej dwa pytania.
- Jednokrotny i wielokrotny wybór oraz dopasowania. Wielokrotny wybór
  wymaga dokładnego zestawu odpowiedzi; nie ma częściowych punktów.
- Walidacja JSON przy ładowaniu bazy. Wcześniej zapisana baza własna w
  `localStorage` pozostaje dostępna obok wbudowanych pytań.

## Stan bazy

`public/questions.json` zawiera **75 pytań po polsku do sprawdzianu z modułów 1–3**,
przetłumaczonych z dostarczonego przez użytkownika pliku `modul1-3.pdf`.
Zachowano wszystkie pozycje z PDF: 58 pytań jednokrotnego wyboru, 10 wielokrotnego
wyboru i 7 dopasowań. Źródło pomija numer 60; identyfikatory zachowują oryginalne
numery. Nie dołączono pytań z pozostałych zakresów.

Schematy i konfiguracje do pytań 18, 43, 52 i 54 znajdują się lokalnie w
`public/images/moduly-1-3/`. Pytanie 52 wymaga niedołączonego do PDF pliku
Packet Tracer; informacja o tym jest widoczna przy pytaniu. Wyjaśnienia są
polskimi streszczeniami. Szczegóły zgodności, klucze i uwagi do źródła opisuje
[raport importu](docs/moduly-1-3-import.md).

Podział tematyczny odpowiada [wskazanemu zakresowi kursu](https://itexamanswers.net/ccna-1-v7-exam-answers-introduction-to-networks-v7-0-itn.html).
Wspólna pula łączy dostępne pytania modułów i sprawdzianów;
nie jest oddzielną bazą egzaminu końcowego.

Gotowy polski JSON znajduje się w `public/questions.json`. W tym pliku można
aktualizować pytania wbudowane. Import pliku z poziomu interfejsu został usunięty.

Wbudowana i zapisana wcześniej baza własna są łączone bez zapisywania zmian do
`localStorage`. Przy takim samym identyfikatorze pierwszeństwo ma pytanie z bazy
własnej, aby zachować modyfikacje użytkownika. Moduły 1–17 pozostają obsługiwane
w formacie danych dla zgodności z wcześniejszymi zapisami, ale nie są wyświetlane
na liście modułów.
Wyniki i odpowiedzi z sesji nie są zapisywane. Przy odświeżeniu lub opuszczeniu strony z rozpoczętymi, nieocenionymi odpowiedziami przeglądarka ostrzega przed ich utratą. Ostrzeżenie obejmuje częściowe dopasowania, ale nie puste wybory, ocenione szybkie pytanie ani ukończony test. Zamknięcie aplikacji przez system, szczególnie na telefonie, może ominąć zdarzenie `beforeunload`.

## Format JSON

Kompletny [przykład formatu](public/example-bank.json) zawiera **3 autorskie pytania
wyłącznie do sprawdzenia działania**. Nie jest kopią ani tłumaczeniem
ITExamAnswers.

Korzeń pliku: `version: 1`, `questions: [...]`, opcjonalnie tekst `description`.
Maksymalnie 5 MB i 5000 pytań. W każdym pytaniu:

| Pole | Znaczenie |
| --- | --- |
| `id` | Unikalny identyfikator w całej bazie, maks. 80 znaków |
| `moduleId` | Liczba całkowita od 1 do 17 albo tekst `"1-3"` dla wspólnego sprawdzianu |
| `type` | `single_select`, `multiple_select` lub `matching` |
| `prompt` | Treść pytania jako zwykły tekst |
| `explanation` | Opcjonalne wyjaśnienie jako zwykły tekst |
| `image` | Opcjonalny obiekt `{ "src": "/images/schemat.png", "alt": "Opis schematu" }` |

Identyfikatory pytań, odpowiedzi i par zaczynają się literą ASCII lub cyfrą;
dalsze znaki: litery ASCII, cyfry, `-` i `_`. Teksty: maks. 10 000 znaków,
opis bazy: 2000 znaków. Treści nie są wykonywane jako HTML.

### Wybór odpowiedzi

`options` zawiera od 2 do 32 obiektów `{ "id": "a", "text": "Treść odpowiedzi" }`.
`correctOptionIds` zawiera identyfikatory poprawnych opcji: dokładnie jeden
dla `single_select`, co najmniej dwa dla `multiple_select`.

### Dopasowania

`pairs` zawiera od 2 do 32 obiektów:

```json
{ "id": "dns", "prompt": "DNS", "answer": "Rozwiązywanie nazw domenowych" }
```

Aplikacja tworzy listę wyboru z prawych stron par, posortowanych alfabetycznie.
Opcjonalne `choices` jest tablicą 2–32 unikalnych tekstów: zawiera wszystkie
poprawne odpowiedzi i może zawierać odpowiedzi niewykorzystane. Bez `choices`
obowiązuje dotychczasowa lista tworzona z par. Ta sama odpowiedź może pasować
do kilku elementów, jeśli tak określono bazę.

### Obrazy

Pliki lokalne umieść w `public/images/`; w JSON użyj `/images/nazwa.png`.
Dozwolone lokalne rozszerzenia: PNG, JPG, JPEG, WEBP, GIF, SVG.
Zdalne obrazy wymagają HTTPS. Opis `alt` jest obowiązkowy.
Obrazy nie są częścią importu JSON i nie są pobierane do lokalnej kopii.

## Zakres weryfikacji

`npm test` sprawdza kontrakt danych, losowanie, punktację i wymagane pliki publikacji.
`npm run test:e2e` buduje aplikację i uruchamia izolowane serwery na portach 5184
(build produkcyjny) i 5185 (dev z React StrictMode). Testy Chromium obejmują
blokadę indeksowania, awarie Hairline, pełny test 40 pytań z trzema typami
odpowiedzi, 25 kolejnych szybkich pytań, cykl życia WebGL, brak GPU, utratę
kontekstu, ostrzeganie przed odświeżeniem oraz fokus i pozycję po ocenie.
Pliki diagnostyczne po niepowodzeniu trafiają do `test-results/`.
Testy nie potwierdzają konfiguracji publicznego hostingu ani merytorycznej
kompletności zewnętrznych pytań.

Aplikacja jest niezależnym narzędziem edukacyjnym; nie jest produktem Cisco ani Apple.
