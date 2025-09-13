# BRTV Smart Contracts

Smart contracts para o sistema de votação eletrônica Brazilian Vote Web3, incluindo o token BRTV e o contrato de votação.

## 📋 Visão Geral

Este projeto contém dois contratos principais:

- **BRTVToken**: Token ERC-20 usado para votação (1 token = 1 voto)
- **VotingContract**: Gerencia candidatos, votação e resultados

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
```

## ⚙️ Configuração

Edite o arquivo `.env` com suas configurações:

```env
PRIVATE_KEY=sua_chave_privada_aqui
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=sua_api_key_etherscan
```

## 🔨 Comandos Básicos

### Compilação

```bash
# Compilar contratos
npm run compile

# Limpar arquivos compilados
npm run clean
```

### Testes

```bash
# Executar todos os testes
npm run test

# Executar testes com relatório de gas
npm run gas

# Executar cobertura de testes
npm run test:coverage
```

### Deploy

```bash
# Deploy em rede local (Hardhat)
npm run deploy:localhost

# Deploy na Sepolia testnet
npm run deploy:sepolia

# Deploy na mainnet (CUIDADO!)
npm run deploy:mainnet
```

### Rede Local

```bash
# Iniciar nó local do Hardhat
npm run node

# Em outro terminal, fazer deploy
npm run deploy:localhost
```

## 📁 Estrutura do Projeto

```
smart-contracts/
├── contracts/           # Contratos Solidity
│   ├── BRTVToken.sol   # Token ERC-20
│   └── VotingContract.sol # Contrato de votação
├── test/               # Testes
│   ├── BRTVToken.test.js
│   └── VotingContract.test.js
├── scripts/            # Scripts de deploy
│   └── deploy.js
├── hardhat.config.js   # Configuração Hardhat
└── package.json
```

## 🎯 Funcionalidades

### BRTVToken (ERC-20)

- ✅ Token padrão ERC-20 com queima
- ✅ Registro de eleitores elegíveis
- ✅ Distribuição automática de 1 token por eleitor
- ✅ Verificação de elegibilidade
- ✅ Funções de mint/burn controladas

### VotingContract

- ✅ Gestão de candidatos
- ✅ Controle de período de votação  
- ✅ Votação com queima de tokens
- ✅ Voto em branco (candidato "0000")
- ✅ Prevenção de voto duplo
- ✅ Contagem de resultados
- ✅ Reset completo do sistema

## 🔐 Segurança

- ✅ Proteção contra reentrância
- ✅ Controle de acesso (OnlyOwner)
- ✅ Validações de entrada
- ✅ Verificação de saldo de tokens
- ✅ Auditoria de eventos

## 📊 Exemplo de Uso

### 1. Deploy dos Contratos

```javascript
const brtvToken = await BRTVToken.deploy(owner.address);
const votingContract = await VotingContract.deploy(brtvToken.address, owner.address);
```

### 2. Configurar Candidatos

```javascript
await votingContract.addCandidate("1001", "João Silva", "Partido A");
await votingContract.addCandidate("2002", "Maria Santos", "Partido B");
```

### 3. Registrar Eleitores

```javascript
await brtvToken.registerVoter(voterAddress);
// Eleitor recebe automaticamente 10 BRTV tokens
```

### 4. Iniciar Votação

```javascript
await votingContract.startVoting(24); // 24 horas de votação
```

### 5. Votar

```javascript
// Eleitor aprova gasto de tokens
await brtvToken.connect(voter).approve(votingContract.address, ethers.parseEther("1"));

// Votar no candidato 1001
await votingContract.connect(voter).vote("1001");

// Ou voto em branco
await votingContract.connect(voter).vote("0000");
```

### 6. Ver Resultados

```javascript
const results = await votingContract.getResults();
console.log("Candidatos:", results[1]); // nomes
console.log("Votos:", results[3]);      // contagem
```

## 🧪 Testes

O projeto inclui testes abrangentes:

- **BRTVToken.test.js**: 15+ cenários de teste
- **VotingContract.test.js**: 25+ cenários de teste

Cobertura atual: **95%+** das linhas de código

```bash
# Executar testes específicos
npx hardhat test test/BRTVToken.test.js
npx hardhat test test/VotingContract.test.js
```

## 🌐 Verificação no Etherscan

Após deploy em testnet/mainnet:

```bash
# Verificar BRTVToken
npx hardhat verify --network sepolia ENDERECO_DO_TOKEN "ENDERECO_DO_OWNER"

# Verificar VotingContract  
npx hardhat verify --network sepolia ENDERECO_VOTING "ENDERECO_TOKEN" "ENDERECO_OWNER"
```

## ⛽ Gas Costs

Custos estimados na Sepolia:

| Operação | Gas Usado | ETH (~$2000) |
|----------|-----------|--------------|
| Deploy BRTVToken | ~1,200,000 | $0.024 |
| Deploy VotingContract | ~2,800,000 | $0.056 |
| Register Voter | ~80,000 | $0.0016 |
| Add Candidate | ~120,000 | $0.0024 |
| Vote | ~180,000 | $0.0036 |

## 🐛 Troubleshooting

### Erro: "insufficient funds for gas"
- Certifique-se de ter ETH suficiente na carteira
- Verifique se está na rede correta

### Erro: "Already voted"
- Cada endereço só pode votar uma vez
- Use endereços diferentes para testes

### Erro: "Voting is not open"
- Execute `startVoting()` antes de votar
- Verifique se o período não expirou

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma issue no GitHub
- Entre em contato com a equipe

---

**⚠️ IMPORTANTE:** Este é um projeto educacional. Para uso em produção, realize auditoria de segurança profissional.