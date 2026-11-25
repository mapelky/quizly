# Import modułów 4–7

Źródło: [ITExamAnswers — Ethernet Concepts](https://itexamanswers.net/ccna-1-v7-modules-4-7-ethernet-concepts-exam-answers.html).
Odczyt: 25.11.2026; aktualizacja strony: 17.11.2026.
SHA-256 odczytanego HTML: `394978b8efef4635a3c640fbbb58858df8a46e9fef0fbd32778824ad74480a39`.

Plik `public/questions-4-7.json` zawiera 75 pytań po polsku z `moduleId: "4-7"`:
50 pytań jednokrotnego wyboru, 24 wielokrotnego wyboru i jedno dopasowanie.
Jest osobnym zestawem od modułów 1–3. Aplikacja ładuje oba pliki, a pytania
z lokalnej zapisanej bazy nadal mają pierwszeństwo przy takim samym `id`.

Wykorzystano istniejący w katalogu roboczym, nieśledzony plik JSON.
Zweryfikowano kolejność i identyfikatory wszystkich 75 pozycji oraz liczbę
opcji i klucze wszystkich 74 pytań wyboru względem oznaczeń `correct_answer`
w HTML. Sześć par w pytaniu 5 porównano z tabelą odpowiedzi na stronie.
Wyjaśnienia w JSON są polskimi streszczeniami, z dodatkowymi doprecyzowaniami.
Nie wykonano pełnej ponownej korekty językowej istniejącego tłumaczenia.

Computer Use pokazał otwartą stronę w Zen i początek pytań, ale sterowanie
oknem zwracało `noWindowsAvailable`, a integracja przeglądarkowa była
niedostępna. Dalsze porównanie wykonano na odczytanym HTML strony.

Weryfikacja: 20 testów Node i 14 testów Chromium przeszło, podobnie jak
build Vite. Test nowego zestawu zakończył się wynikiem 40/40; sprawdzono
rozdzielenie zestawów i działanie modułów 1–3 po błędzie pobrania bazy 4–7.
Wszystkie sześć adresów ilustracji zwróciło HTTP 200 i plik obrazu.

## Ograniczenia źródła

- Strona ma 70 numerowanych pozycji i pięć dodatkowych wariantów pytania 60.
  Zachowano sześć wersji tego pytania i luki numeracji; nie dopisywano pytań.
- Pytania 54/55 i 74/76 mają takie same treści, lecz inne opcje; zachowano oba warianty.
- Wariant 6 pytania 60 zawiera tylko dwie opcje i obie są poprawne — zgodnie ze źródłem.
- Pytania 10, 12, 30, 45, 46 i 47 używają zewnętrznych ilustracji HTTPS.
  JSON można przenosić jako jeden plik, ale obrazy wymagają dostępu do Internetu
  i dostępności serwera źródłowego. Dopasowanie z pytania 5 zapisano tekstowo.
- Zadanie 47 wymaga oryginalnej aktywności Packet Tracer ze strony źródłowej.
  JSON zawiera schemat i klucz, lecz nie zawiera pliku `.pka`/`.pkt`.
- Klucze odwzorowują wskazaną stronę; nie są niezależnie zatwierdzonym kluczem Cisco.
