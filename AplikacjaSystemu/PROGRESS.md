# Dziennik Postępów (Progress Log)

## 2025-12-16 - Admin User Management & Fixes

### Backend (`routes/auth.js`, `models/User.js`)
- **Model Użytkownika**: Dodano pola `position` (stanowisko) oraz `isActive` (status aktywności).
- **Logowanie**: Zablokowano możliwość logowania dla kont z `isActive: false`.
- **Aktualizacja Użytkownika**: Zmieniono endpoint `PUT /users/:id` na bardziej uniwersalny, obsługujący zmianę roli, stanowiska i aktywności konta.
- **Pobieranie Użytkowników**: Endpoint `GET /users` zwraca teraz także informacje o aktywności i stanowisku.

### Frontend (`public/app.js`, `public/index.html`)
- **Lista Użytkowników**: 
  - Uproszczono widok (tylko Imię/Email).
  - Usunięto wyświetlanie roli bezpośrednio na liście.
  - Dodano wizualne oznaczenie (wyszarzenie) dla nieaktywnych kont.
- **Modal "Manage User"**:
  - Dodano pola edycji: Rola, Stanowisko, Checkbox "Active Account".
  - Dodano przycisk "Reset Password" wewnątrz modala.
- **Poprawki Błędów**:
  - Naprawiono błędy w adresach URL (spacje) w żądaniach `fetch`.
  - Poprawiono obsługę błędów przy aktualizacji użytkownika.

### Inne
- **Wymagane Działanie**: Restart serwera jest konieczny po tych zmianach, aby zaktualizować schemat bazy danych.
