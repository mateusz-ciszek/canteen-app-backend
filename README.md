# Backend dla aplikacji Canteen

## Wykorzystane technologie
Serwer został utworzony w technologi [Node.js](https://nodejs.org/en/) z wykorzystaniem frameworka [Express](http://expressjs.com/). Jako bazę danych wybraliśmy [MongoDB Atlas](https://www.mongodb.com/).

## Instalacja i uruchamianie
```bash
$ git clone https://github.com/canteen-application/canteen-app-backend.git
$ cd canteen-app-backend
$ npm i
$ npm start
```

## Rozwiązywanie problemów
### Windows
Aplikacja wymaga modułu `bcrypt`, dla którego, na systemie Windows, może być wymagane zainstalowanie odpowiednich zależności. Jeśli wystąpują problemy z zainstalowaniem tego modułu należy upewnić się, że na komputerze są zainstalowane narzędzia programistyczne dla języka C++ oraz python 2.x.  
Można je zainstalować automatycznie poprzez wywołanie:
```bash
npm install --global windows-build-tools
```
Lub korzystając z Yarn:
```bash
yarn global add windows-build-tools
```
Po więcej informacji należy się udać na strony modułów [node-gyp](https://github.com/nodejs/node-gyp) oraz [Windows-Build-Tools](https://github.com/felixrieseberg/windows-build-tools).