# Desafio Lambdas — CRUD de Funcionários

Projeto Serverless em Node.js para gerenciar Funcionários (CRUD) com AWS Lambda + API Gateway e DynamoDB, seguindo Clean Architecture, com testes unitários em Jest.

## Requisitos (atendidos)
- Clean Architecture
- Repositório público no GitHub
- Documentação clara (este README)
- Funcionário com: `id`, `idade`, `nome`, `cargo`
- Persistência em banco na AWS (DynamoDB)
- Lambda acessível via internet, com operações: criar, consultar, atualizar e deletar
- Provisionamento via Serverless Framework (CloudFormation)
- Testes unitários com Jest

## Arquitetura (Clean Architecture)
```
src/
	domain/
		entities/
			Employee.js
		repositories/
			EmployeeRepository.js

	application/
		use-cases/
			createEmployee.js
			getEmployee.js
			updateEmployee.js
			deleteEmployee.js

	infra/
		db/
			DynamoEmployeeRepository.js
		lambda/
			handlers/
				create.js
				get.js
				update.js
				delete.js

tests/
	employee.test.js

serverless.yml
package.json
jest.config.js
.env.example
.env (local)
```

Camadas:
- Domain: Entidades e contratos (sem dependências externas)
- Application: Casos de uso (contém a regra de negócio orquestrada)
- Infra: Implementações concretas (DynamoDB, handlers Lambda)

## Endpoints
- POST `/employees` — cria funcionário
	- body: `{ "nome": string, "cargo": string, "idade": number }`
	- 201 + objeto criado
- GET `/employees/{id}` — obtém funcionário por id
	- 200 + objeto | 404 se não encontrado
- PUT `/employees/{id}` — atualiza campos parciais
	- body: qualquer combinação de `{ "nome", "cargo", "idade" }`
	- 200 + objeto atualizado | 404 se não encontrado
- DELETE `/employees/{id}` — remove funcionário
	- 204 (sem corpo) | 404 se não encontrado

## Pré‑requisitos locais
- Node.js 18+
- Conta AWS configurada (via `AWS_PROFILE` ou variáveis de ambiente)
- Serverless Framework (opcional se usar via `npx`)

## Configuração de ambiente
Copie o arquivo `.env.example` para `.env` e ajuste caso necessário:
```
AWS_REGION=us-east-1
STAGE=dev
# EMPLOYEES_TABLE=desafio-lambdas-dev-employees
# AWS_PROFILE=default
```
O nome da tabela é gerado como `${service}-${stage}-employees` por padrão.

## Instalação
```powershell
npm install
```

## Executar localmente
Este projeto usa o `serverless-offline` para simular API Gateway/Lambda. Por padrão, o repositório de dados é o DynamoDB na AWS (não há Dynamo local configurado neste boilerplate). Para testes de lógica sem AWS, use os testes unitários (repositório em memória).

Inicie o offline:
```powershell
npx serverless offline
```

## Deploy
Crie os recursos (Lambda, API Gateway, DynamoDB) na AWS:
```powershell
npx serverless deploy
```

Remover recursos:
```powershell
npx serverless remove
```

## Testes
Rode os testes unitários (use-cases com repositório em memória):
```powershell
npm test
```

## Observações
- O AWS SDK v2 já está disponível no ambiente Lambda, então não há bundle extra.
- Validações básicas são feitas nos casos de uso e entidade.
- CORS habilitado nas respostas dos handlers.

## Próximos passos (opcionais)
- Adicionar `serverless-dynamodb-local` para desenvolvimento 100% local.
- Adicionar rota de listagem e paginação.
- Observabilidade (logs estruturados, métricas) e camadas Lambda.