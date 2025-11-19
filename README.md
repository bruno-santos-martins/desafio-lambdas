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
	application/
		use-cases/
			createEmployee.ts
			deleteEmployee.ts
			getEmployee.ts
			updateEmployee.ts
	domain/
		entities/
			Employee.ts
		repositories/
			EmployeeRepository.ts
	infra/
		db/
			DynamoEmployeeRepository.ts
		lambda/
			handlers/
				create.ts
				delete.ts
				get.ts
				update.ts
			utils/
				corsResponse.ts
				errorResponse.ts
tests/
	employee.test.ts
serverless.yml
package.json
tsconfig.json
jest.config.js
.env.example
.env (local)
README.md
```

Camadas:
- Domain: Entidades e contratos (sem dependências externas)
- Application: Casos de uso (contém a regra de negócio orquestrada)
- Infra: Implementações concretas (DynamoDB, handlers Lambda)

## Endpoints
- POST `/employees` — cria funcionário
	- body: `{ "nome": string, "cargo": string, "idade": number }`
	- 201 + objeto criado
- GET `/employees` — lista todos os funcionários
		- Suporta paginação via query string: `?page=1&limit=10` (valores padrão: page=1, limit=10)
		- Resposta:
			```json
			{
				"data": [ /* funcionários */ ],
				"total": 100,
				"page": 1,
				"limit": 10,
				"totalPages": 10
			}
			```
- GET `/employees/{id}` — obtém funcionário por id
		- 200 + objeto | 404 se não encontrado
- PUT `/employees/{id}` — atualiza campos parciais
	- body: qualquer combinação de `{ "nome", "cargo", "idade" }`
	- 200 + objeto atualizado | 404 se não encontrado
- DELETE `/employees/{id}` — remove funcionário
	- 204 (sem corpo) | 404 se não encontrado


## Testes, Insomnia e Documentação OpenAPI
- Testes unitários: os testes estão em `tests/employee.test.ts` (rodar com `yarn test`).
- Coleção Insomnia: arquivo `Insomnia_2025-11-18.yaml` na raiz do projeto.
	- Para usar: abra o Insomnia > Application > Preferences > Data > Import Data > From File e selecione o arquivo.
- Documentação OpenAPI: arquivo `openapi.yaml` na raiz do projeto.
	- Você pode importar esse arquivo em ferramentas como [Swagger UI](https://swagger.io/tools/swagger-ui/) ou [Redoc](https://redocly.com/) para visualizar e testar todos os endpoints, parâmetros e exemplos de requisição/resposta de forma interativa.

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

## Instalação e Uso

1. Instale as dependências:
```bash
yarn install
```

2. Execute os testes:
```bash
yarn test
```

3. Rode localmente com Serverless Offline:
```bash
yarn offline
```

4. Faça deploy para AWS:
```bash
yarn deploy
```
Remover recursos:
```bash
yarn remove
```