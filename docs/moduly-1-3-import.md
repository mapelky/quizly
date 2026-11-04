# Import modułów 1–3

Źródło: dostarczony przez użytkownika `modul1-3.pdf`, 46 stron, eksport 04.11.2026.
Tytuł: CCNA 1 v7 Modules 1 - 3: Basic Network Connectivity and Communications Exam Answers.
SHA-256 PDF: `912039da1ecbc3e01e005dea921514b9949dd56c0e16ca581e5439af1f4abe3f`.

Wynik: `public/questions.json`, 75 pytań po polsku, moduleId `"1-3"`.
Zachowano wszystkie warianty, kolejność opcji i poprawne odpowiedzi.
Klucze 68 pytań wyboru porównano z czerwonymi oznaczeniami w PDF.
Siedem zadań dopasowania zweryfikowano na wyrenderowanych ilustracjach i tabelach.
Obrazy z zadań 18, 43, 52 i 54 wyodrębniono do `public/images/moduly-1-3/`.
Nazwy urządzeń, polecenia IOS, hasła i adresy IP pozostają niezmienione.
Wyjaśnienia zapisano jako polskie streszczenia; nie są pełnym przekładem akapitów źródłowych.

Weryfikacja 04.11.2026: 16 testów Node oraz build Vite przeszły. W Chromium
sprawdzono wczytanie wszystkich 75 pytań, cztery lokalne ilustracje,
niewykorzystane opcje dopasowań i pełny test 40 pytań zakończony wynikiem 40/40.
Sprawdzono też szybką odpowiedź, zachowanie własnej bazy po odświeżeniu
i po nieudanym pobraniu bazy wbudowanej oraz szerokości 320, 390, 768 i 1440 px.

## Uwagi do źródła i adaptacji

- W PDF po pytaniu 59 jest 61: pytanie 60 nie występuje. Nie dodano treści zastępczej.
- Pytania 65 i 68 mają ten sam temat, lecz inne opcje odpowiedzi. Oba zachowano.
- Zadanie 52 wymaga oryginalnego pliku Packet Tracer (.pka/.pkt). PDF zawiera tylko schemat i klucz 192.168.5.10. Informację o brakującym pliku umieszczono w pytaniu i wyjaśnieniu; nie dorabiano konfiguracji.
- Zadanie 5 zachowuje dwie niewykorzystane odpowiedzi, a zadanie 36 niewykorzystaną organizację EIA jako `choices`.
- W zadaniu 27 sześć opisów dopasowuje się do trzech trybów IOS; odpowiedzi mogą się powtarzać. Niewykorzystany opis o ustawianiu hasła VTY zachowano po polsku w wyjaśnieniu zamiast tworzyć parę bez odpowiedzi.
- Polecenia w zadaniu 19 zapisano tekstowo z pełną maską 255.255.255.0; PDF ucina końcówkę wiersza. Pełną maskę potwierdzono w [oryginale, pytanie 19](https://itexamanswers.net/ccna-1-v7-modules-1-3-basic-network-connectivity-and-communications-exam-answers.html).
- W zadaniu 74 oczywistą literówkę „Fire optic cable” przełożono jako „kabel światłowodowy”, zgodnie z wyjaśnieniem źródłowym.
- Wyjaśnienie zadania 32 doprecyzowuje, że zapis konfiguracji bieżącej do startowej jest osobną czynnością; nie zmienia klucza.
- Wyjaśnienie zadania 35 określa NAT jako mechanizm, nie jako protokół aplikacji; nie zmienia klucza.
- Zachowano podaną w źródle odpowiedź w zadaniu 34 (C). Ogólne określenie „dane” w opcji A może być szeroko interpretowane, dlatego należy czytać to zadanie w kontekście nazw PDU.

## Zgodność numeracji i kluczy

Numery stron wskazują początek pytania w PDF. Litery odnoszą się do zachowanej kolejności opcji. Dla dopasowań klucz jest zapisany w `pairs` w JSON.

| Numer w PDF | Strona PDF | Typ | Klucz |
| --- | --- | --- | --- |
| 1 | 1 | single_select | C |
| 2 | 2 | single_select | C |
| 3 | 2 | single_select | C |
| 4 | 3 | single_select | C |
| 5 | 3 | matching | 3 par |
| 6 | 4 | single_select | A |
| 7 | 5 | single_select | C |
| 8 | 5 | single_select | C |
| 9 | 6 | matching | 4 par |
| 10 | 7 | multiple_select | C, E |
| 11 | 7 | single_select | C |
| 12 | 8 | multiple_select | A, C |
| 13 | 8 | multiple_select | A, B, E |
| 14 | 9 | single_select | C |
| 15 | 9 | single_select | D |
| 16 | 10 | single_select | A |
| 17 | 10 | single_select | B |
| 18 | 11 | single_select | C |
| 19 | 12 | single_select | B |
| 20 | 12 | single_select | B |
| 21 | 13 | multiple_select | B, C |
| 22 | 13 | multiple_select | B, E |
| 23 | 14 | single_select | B |
| 24 | 14 | matching | 4 par |
| 25 | 15 | multiple_select | B, E, F |
| 26 | 16 | single_select | D |
| 27 | 17 | matching | 6 par |
| 28 | 17 | matching | 5 par |
| 29 | 18 | single_select | B |
| 30 | 19 | single_select | B |
| 31 | 19 | single_select | D |
| 32 | 20 | single_select | B |
| 33 | 20 | single_select | B |
| 34 | 21 | single_select | C |
| 35 | 21 | multiple_select | B, C, D |
| 36 | 22 | matching | 3 par |
| 37 | 23 | single_select | E |
| 38 | 23 | single_select | B |
| 39 | 24 | single_select | A |
| 40 | 24 | single_select | A |
| 41 | 25 | matching | 4 par |
| 42 | 25 | single_select | B |
| 43 | 26 | multiple_select | D, E |
| 44 | 27 | single_select | D |
| 45 | 27 | single_select | A |
| 46 | 28 | multiple_select | A, C |
| 47 | 28 | single_select | C |
| 48 | 29 | single_select | A |
| 49 | 29 | single_select | B |
| 50 | 30 | single_select | B |
| 51 | 30 | single_select | A |
| 52 | 31 | single_select | A |
| 53 | 32 | single_select | C |
| 54 | 32 | single_select | C |
| 55 | 33 | single_select | A |
| 56 | 33 | single_select | A |
| 57 | 34 | single_select | A |
| 58 | 35 | single_select | A |
| 59 | 35 | single_select | A |
| 61 | 36 | single_select | A |
| 62 | 37 | single_select | A |
| 63 | 37 | single_select | A |
| 64 | 38 | single_select | A |
| 65 | 38 | single_select | A |
| 66 | 38 | single_select | A |
| 67 | 39 | single_select | A |
| 68 | 40 | single_select | A |
| 69 | 40 | single_select | C |
| 70 | 41 | single_select | A |
| 71 | 41 | single_select | A |
| 72 | 42 | single_select | A |
| 73 | 43 | single_select | A |
| 74 | 43 | single_select | B |
| 75 | 43 | multiple_select | B, C |
| 76 | 44 | single_select | D |
