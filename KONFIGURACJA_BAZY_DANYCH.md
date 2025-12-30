# 🗄️ Konfiguracja Bazy Danych - Matchdays Backend

## Problem

Błąd uwierzytelnienia: `P1000: Authentication failed against database server`

## Rozwiązania

### ✅ OPCJA 1: Supabase (Zalecane - Darmowe, Łatwe)

#### Krok 1: Zaloguj się do Supabase

1. Przejdź do: https://supabase.com/dashboard
2. Zaloguj się lub utwórz konto

#### Krok 2: Utwórz nowy projekt (jeśli nie masz)

1. Kliknij "New Project"
2. Wybierz organizację
3. Podaj nazwę projektu: `matchdays-backend`
4. Ustaw hasło do bazy danych (ZAPISZ JE!)
5. Wybierz region: `Europe West (Ireland)` lub najbliższy
6. Kliknij "Create new project"

#### Krok 3: Pobierz dane połączenia

1. W panelu projektu przejdź do: **Settings** → **Database**
2. Przewiń do sekcji **Connection string**
3. Wybierz **Connection pooling** (dla Prisma)
4. Skopiuj **Connection string** w trybie **Transaction**

Przykład:

```
postgresql://postgres.kbrxpdibulijbljelvgp:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

5. Skopiuj również **Direct connection** (bez pgbouncer):

```
postgresql://postgres.kbrxpdibulijbljelvgp:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

#### Krok 4: Zaktualizuj plik .env

Otwórz plik `.env` i zamień:

```env
DATABASE_URL="postgresql://postgres.kbrxpdibulijbljelvgp:[TWOJE-HASLO]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.kbrxpdibulijbljelvgp:[TWOJE-HASLO]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

**WAŻNE:** Zamień `[TWOJE-HASLO]` na hasło, które ustawiłeś w kroku 2!

---

### ✅ OPCJA 2: Lokalna Baza Danych PostgreSQL

#### Krok 1: Zainstaluj PostgreSQL

**Windows:**

1. Pobierz: https://www.postgresql.org/download/windows/
2. Uruchom instalator
3. Podczas instalacji ustaw hasło (np. `postgres123`)
4. Zapamiętaj port (domyślnie: 5432)

**macOS (Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Krok 2: Utwórz bazę danych

```bash
# Zaloguj się do PostgreSQL
psql -U postgres

# W konsoli PostgreSQL:
CREATE DATABASE matchdays;
CREATE USER matchdays_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE matchdays TO matchdays_user;
\q
```

#### Krok 3: Zaktualizuj plik .env

```env
DATABASE_URL="postgresql://matchdays_user:your_secure_password@localhost:5432/matchdays"
DIRECT_URL="postgresql://matchdays_user:your_secure_password@localhost:5432/matchdays"
```

---

### ✅ OPCJA 3: Docker PostgreSQL (Dla Deweloperów)

#### Krok 1: Utwórz docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: matchdays-postgres
    environment:
      POSTGRES_USER: matchdays_user
      POSTGRES_PASSWORD: matchdays_password
      POSTGRES_DB: matchdays
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Krok 2: Uruchom kontener

```bash
docker-compose up -d
```

#### Krok 3: Zaktualizuj plik .env

```env
DATABASE_URL="postgresql://matchdays_user:matchdays_password@localhost:5432/matchdays"
DIRECT_URL="postgresql://matchdays_user:matchdays_password@localhost:5432/matchdays"
```

---

## 🧪 Testowanie Połączenia

Po zaktualizowaniu `.env`, przetestuj połączenie:

```bash
# Test 1: Sprawdź czy zmienne są załadowane
node test-env.js

# Test 2: Wygeneruj Prisma Client
npx prisma generate

# Test 3: Przetestuj połączenie z bazą
npx prisma db pull

# Test 4: Uruchom migracje
npx prisma migrate dev --name init
```

Jeśli wszystko działa, zobaczysz:

```
✔ Generated Prisma Client
✔ Database synchronized
```

---

## 🚀 Następne Kroki

Po pomyślnym połączeniu:

```bash
# 1. Wygeneruj Prisma Client
npx prisma generate

# 2. Uruchom migracje
npx prisma migrate dev --name init

# 3. (Opcjonalnie) Dodaj przykładowe dane
npx prisma db seed

# 4. Uruchom aplikację
npm run start:dev
```

---

## ❓ Najczęstsze Problemy

### Problem: "Authentication failed"

**Rozwiązanie:**

- Sprawdź czy hasło w `.env` jest poprawne
- Upewnij się, że nie ma spacji przed/po haśle
- Sprawdź czy projekt Supabase jest aktywny

### Problem: "Connection timeout"

**Rozwiązanie:**

- Sprawdź połączenie internetowe
- Sprawdź czy firewall nie blokuje portu 5432
- Dla Supabase: sprawdź czy projekt nie jest wstrzymany (free tier)

### Problem: "Database does not exist"

**Rozwiązanie:**

- Dla lokalnej bazy: utwórz bazę danych (patrz Opcja 2, Krok 2)
- Dla Supabase: baza jest tworzona automatycznie

---

## 📞 Potrzebujesz Pomocy?

Jeśli nadal masz problemy:

1. Sprawdź logi: `npx prisma db pull --print`
2. Sprawdź czy port 5432 jest otwarty: `telnet localhost 5432`
3. Sprawdź status Supabase: https://status.supabase.com/
