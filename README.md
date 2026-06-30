# Client User Mobile - App Movil de Clientes

Aplicacion movil para clientes de NovaPay. Permite a los usuarios autenticarse, consultar cuentas, realizar transferencias, ver productos y gestionar favoritos desde un dispositivo movil.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native 0.85 | Framework movil |
| Expo 56 | Plataforma de desarrollo |
| React Navigation | Navegacion entre pantallas |
| Zustand | State management |
| Axios | Peticiones HTTP |
| React Hook Form | Formularios |
| Expo Secure Store | Almacenamiento seguro (tokens) |
| Async Storage | Almacenamiento local |
| Lucide React Native | Iconos |

---

## Estructura

```
client-user-mobile-novapay/
├── src/
│   ├── features/          # Modulos por funcionalidad (auth, accounts, etc.)
│   ├── navigation/        # Navegacion y rutas
│   └── shared/            # API clients, constants, store, hooks
├── assets/                # Iconos y recursos
├── App.jsx                # Componente raiz
├── app.json               # Configuracion de Expo
├── index.js               # Punto de entrada
├── Dockerfile
└── package.json
```

---

## Puerto

Expo corre en el puerto **8081** por defecto.

---

## Variables de entorno (.env)

```
EXPO_PUBLIC_AUTH_URL=http://10.0.2.2:3000/api/v1/auth
EXPO_PUBLIC_USER=http://10.0.2.2:3002/novapay/v1
```

| Variable | Descripcion |
|---|---|
| `EXPO_PUBLIC_AUTH_URL` | URL del auth-service para login/registro |
| `EXPO_PUBLIC_USER` | URL de la API de clientes |

La IP depende de donde ejecutes la app:

| Entorno | IP a usar | Ejemplo |
|---|---|---|
| Emulador Android | `10.0.2.2` | `http://10.0.2.2:3000/...` |
| Dispositivo fisico (Expo Go) | IP local de tu PC | `http://192.168.1.10:3000/...` |
| Dispositivo fisico (USB) | `10.0.2.2` | `http://10.0.2.2:3000/...` |

---

## Prerequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- **Emulador:** [Android Studio](https://developer.android.com/studio) con un emulador creado
- **Dispositivo fisico:** [Expo Go](https://expo.dev/go) instalado desde la pagina oficial de Expo Go (Recomendado la version 56)

---

## Ejecucion

**IMPORTANTE:** Esta app NO se ejecuta desde Docker. Debe correr directamente en tu PC porque Expo necesita comunicarse con el emulador o dispositivo fisico.

### Paso 1: Levantar el backend

Desde la carpeta raiz de NovaPay:

```bash
docker-compose up --build
```

### Paso 2: Ejecutar la app movil

En una terminal separada:

```bash
cd client-user-mobile-novapay
npm install
npx expo start
```

Esto inicia el servidor de Expo y muestra un QR code en la terminal.

---

### Opcion A: Emulador de Android (Android Studio)

1. Abre Android Studio y ejecuta un emulador desde Device Manager.
2. En el servidor de Expo, presiona `a` para abrir en Android, o ejecuta:

```bash
npx expo start --android
```

3. Si el emulador no se conecta, en otra terminal ejecuta:

```bash
adb reverse tcp:3000 tcp:3000
adb reverse tcp:3002 tcp:3002
```

4. Verifica que el `.env` tenga la IP del emulador:

```
EXPO_PUBLIC_AUTH_URL=http://10.0.2.2:3000/api/v1/auth
EXPO_PUBLIC_USER=http://10.0.2.2:3002/novapay/v1
```

---

### Opcion B: Dispositivo fisico con Expo Go

1. Instala **Expo Go** desde la pagina oficial de Expo Go en tu dispositivo.
2. Conecta tu dispositivo y tu PC a la **misma red WiFi**.
3. Obtene la IP local de tu PC:
   - Windows: abre CMD y ejecuta `ipconfig`
   - Mac/Linux: abre terminal y ejecuta `ifconfig`
   - Busca la IP que empieza con `192.168.` o `10.0.`
4. Cambia el `.env` para que apunte a la IP de tu PC en vez de `localhost`:

```
EXPO_PUBLIC_AUTH_URL=http://192.168.X.X:3000/api/v1/auth
EXPO_PUBLIC_USER=http://192.168.X.X:3002/novapay/v1
```

> Reemplaza `192.168.X.X` con la IP real de tu PC.

5. Ejecuta Expo y escanea el QR code con la camara de tu dispositivo:

```bash
npx expo start
```

> **NOTA:** Expo Go no puede usar librerias nativas custom. Si el proyecto usa `expo-secure-store` u otras dependencias nativas, puede que no funcione completamente en Expo Go. En ese caso usa el emulador o un build de desarrollo.

---

### Opcion C: Dispositivo fisico con USB (sin Expo Go)

1. Conecta tu dispositivo Android por USB.
2. Activa **Depuracion USB** en Opciones de Desarrollador del dispositivo.
3. Verifica que el dispositivo aparezca:

```bash
adb devices
```

4. Ejecuta:

```bash
npx expo start --android
```

5. Configura el `.env` con `10.0.2.2` (ya que `adb reverse` redirige los puertos):

```
EXPO_PUBLIC_AUTH_URL=http://10.0.2.2:3000/api/v1/auth
EXPO_PUBLIC_USER=http://10.0.2.2:3002/novapay/v1
```

---

## Errores comunes

### `AxiosError: Network Error`

El dispositivo/emulador no puede acceder al backend. Verifica que el `.env` use la IP correcta segun tu entorno (ver tabla de IPs arriba).

### `Cannot find module '/app/node_modules/expo/bin/cli'`

Expo esta intentando correr dentro de Docker. Ejecuta Expo directamente en tu PC, no desde un contenedor.

### Expo no encuentra el emulador

Asegurate de que Android Studio este abierto con un emulador corriendo antes de ejecutar `npx expo start --android`.

### Dispositivo fisico no conecta con Expo Go

1. Verifica que el telefono y la PC esten en la **misma red WiFi**.
2. Asegurate de que el `.env` tenga la **IP local de tu PC**, no `localhost`.
3. Verifica que tu firewall no bloquee el puerto 8081.
4. Prueba acceder desde el navegador del telefono a `http://TU_IP:3000/health` para confirmar conectividad.

---

## Scripts disponibles

| Comando | Descripcion |
|---|---|
| `npx expo start` | Iniciar servidor de Expo |
| `npx expo start --android` | Iniciar y abrir en Android |
| `npx expo start --ios` | Iniciar y abrir en iOS |
| `npx expo start --web` | Iniciar version web |
| `npm run android` | Alias para `expo start --android` |
