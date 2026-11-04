export const modules = [
  ['Sieci dzisiaj', 'Urządzenia, topologie i współczesny Internet'],
  ['Pierwsza konfiguracja', 'Przełączniki, hosty i podstawy Cisco IOS'],
  ['Protokoły i modele', 'Komunikacja w modelach OSI i TCP/IP'],
  ['Warstwa fizyczna', 'Sygnały, przewody i media transmisyjne'],
  ['Systemy liczbowe', 'Zapis binarny, dziesiętny i szesnastkowy'],
  ['Warstwa łącza danych', 'Ramki, dostęp do medium i topologie'],
  ['Przełączanie Ethernet', 'Adresy MAC i działanie przełączników'],
  ['Warstwa sieciowa', 'Pakiety IP i wybór drogi przez sieć'],
  ['Rozwiązywanie adresów', 'Protokoły ARP i IPv6 Neighbor Discovery'],
  ['Konfiguracja routera', 'Interfejsy, bramy i podstawy routingu'],
  ['Adresowanie IPv4', 'Podsieci, maski i planowanie adresacji'],
  ['Adresowanie IPv6', 'Adresy, prefiksy i konfiguracja IPv6'],
  ['ICMP', 'Ping, traceroute i diagnostyka połączeń'],
  ['Warstwa transportowa', 'TCP, UDP, porty i niezawodność transmisji'],
  ['Warstwa aplikacji', 'Usługi DNS, DHCP, HTTP i poczta'],
  ['Podstawy bezpieczeństwa', 'Zagrożenia i ochrona urządzeń sieciowych'],
  ['Budowa małej sieci', 'Projektowanie, konfiguracja i diagnostyka'],
].map(([title, description], index) => ({ id: index + 1, title, description }));

modules.push({ id: '1-3', title: 'Łączność i komunikacja', description: 'Sprawdzian z modułów 1–3: podstawy sieci, konfiguracja urządzeń oraz protokoły i modele komunikacji.' });

export function questionCount(count) {
  const ending = count % 10;
  const teen = count % 100;
  return `${count} ${count === 1 ? 'pytanie' : ending >= 2 && ending <= 4 && !(teen >= 12 && teen <= 14) ? 'pytania' : 'pytań'}`;
}
