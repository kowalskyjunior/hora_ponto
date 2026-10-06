# HourKWO

Calculadora de jornada com sincronização opcional com o PontoMais.

## Estrutura

- `src/core`: regras de cálculo da jornada.
- `src/services`: comunicação entre a aplicação e a extensão.
- `src/ui`: estilos e referências do DOM.
- `extension`: ponte do Chrome entre o PontoMais e o HourKWO.

## Integração com PontoMais

A integração não grava senha do PontoMais. A extensão observa as respostas de rede que a página já recebe e extrai os registros de jornada do dia. Ela também tenta localizar horários rotulados no DOM como fallback.

Fluxo:

1. Carregue a extensão em `chrome://extensions` com **Modo do desenvolvedor**.
2. Use **Carregar sem compactação** e selecione a pasta `extension/`.
3. Recarregue a aba do PontoMais.
4. Abra o HourKWO.
5. Clique em **Sincronizar**.

A interface mostra a fonte do dado, a entrada, a saída registrada e a última marcação.

> Observação: o PontoMais pode alterar seus endpoints ou a estrutura das respostas. Por isso a extensão tem parser tolerante e diagnóstico no console com o prefixo `[HourKWO/PontoMais]`.
