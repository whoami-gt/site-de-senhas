# Gerador de Senhas

Aplicação web para criar senhas fortes e frases memoráveis diretamente no navegador.

## O que o projeto faz

O gerador oferece dois modos de criação:

- **Senha padrão:** gera combinações de letras maiúsculas e minúsculas, números e símbolos.
- **Frase memorável:** combina palavras em português usando hífen, underline, ponto, espaço ou nenhum separador.

A aplicação também permite:

- Escolher o tamanho da senha, entre 6 e 48 caracteres.
- Escolher entre 3 e 7 palavras na frase memorável.
- Capitalizar as palavras e incluir um número na frase.
- Evitar caracteres visualmente semelhantes, como `0/O` e `1/l/I`.
- Copiar a senha gerada.
- Mostrar ou ocultar a senha.
- Consultar uma estimativa de força, entropia e tempo de quebra.
- Acessar o histórico de senhas geradas durante a sessão atual.
- Alternar entre tema claro e escuro.

## Segurança

A geração usa a API `window.crypto.getRandomValues()` do navegador para obter valores aleatórios criptograficamente seguros. As senhas são geradas no lado do cliente e não são enviadas para um servidor.

O histórico fica somente na memória da página e é perdido ao recarregar ou fechar a aba. Ainda assim, evite compartilhar senhas geradas e use um gerenciador de senhas para armazená-las com segurança.

A estimativa de tempo de quebra é informativa e depende das características da senha e do cenário de ataque considerado.

## Como usar

1. Abra o arquivo `index.html` em um navegador moderno.
2. Escolha o modo **Senha Padrão** ou **Frase Memorável**.
3. Ajuste as opções desejadas.
4. Clique em **Gerar nova senha**.
5. Use o botão **Copiar** para copiar o resultado.

O projeto é estático e não precisa de servidor ou instalação de dependências.

## Estrutura

- `index.html`: estrutura da interface.
- `style.css`: estilos, responsividade e temas.
- `script.js`: geração, validação, análise e interação da aplicação.
- `README.md`: documentação do projeto.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Web Crypto API
- Google Fonts: Inter e JetBrains Mono
