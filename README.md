# HourKWO

Calculadora de jornada com suporte a desktop e mobile.

## Mobile

O HourKWO pode ser instalado como PWA em navegadores que suportem instalação de aplicações web.

Para sincronizar o PontoMais no celular, há uma limitação importante: o Chrome para Android/iOS não executa extensões como o Chrome desktop. Em iOS, Safari permite Web Extensions, mas elas precisam ser distribuídas como uma extensão de Safari empacotada em um app. Por isso a branch também oferece um fluxo mobile sem extensão: um bookmarklet que lê os horários visíveis na página do PontoMais e os envia ao HourKWO.

Abra `mobile/` pelo navegador para ver as instruções de configuração.

## Desenvolvimento

A lógica de cálculo está em `src/core`, a ponte do PontoMais em `src/services` e a integração de extensão em `extension/`.

A entrada também pode ser importada pela URL, por exemplo:

`?times=08:07,12:01,13:03,17:56&source=mobile`

O HourKWO usa a primeira marcação como entrada e exibe os demais horários capturados.