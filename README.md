# Microservices Nest

Dois serviços NestJS que se comunicam por RabbitMQ. O `ms-users` faz o CRUD de usuários no Postgres e, ao criar um usuário, publica o evento `user.created`. O `ms-email` consome esse evento e envia o email de boas-vindas.

O objetivo do projeto é estudar comunicação assíncrona entre serviços com observabilidade completa: logs estruturados, métricas e tracing distribuído.

## Fluxo

```
POST /users
    |
    v
ms-users  --grava-->  Postgres
    |
    | publica user.created (RabbitMQ)
    v
ms-email  --envia-->  SMTP (Mailtrap)
```

O `correlationId` é gerado no `ms-users` a partir do header `x-correlation-id` (ou criado na hora), vai junto no payload do evento e aparece nos logs dos dois serviços. O trace do OpenTelemetry é propagado pelo header `traceparent` da mensagem AMQP, então uma requisição HTTP e o envio do email aparecem na mesma trace no Jaeger.

## Stack

- NestJS 11 e TypeScript
- RabbitMQ (`@nestjs/microservices`, transporte RMQ)
- Prisma 7 com PostgreSQL
- Nodemailer via `@nestjs-modules/mailer`
- Pino para logs
- Prometheus para métricas e Grafana para os dashboards
- OpenTelemetry exportando para o Jaeger

## Requisitos

- Node.js 20 ou superior
- Docker e Docker Compose
- Um banco PostgreSQL acessível
- Uma conta no Mailtrap (ou outro SMTP)

## Subindo a infraestrutura

```bash
cd dockerfiles
docker compose up -d
```

Isso sobe RabbitMQ, Prometheus, Grafana e Jaeger:

| Serviço | URL | Acesso |
| --- | --- | --- |
| RabbitMQ (painel) | http://localhost:15672 | guest / guest |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin / admin |
| Jaeger | http://localhost:16686 | - |

O RabbitMQ expõe métricas em `15692`, que o Prometheus já raspa. A configuração de scrape está em `dockerfiles/prometheus.yml` e usa `host.docker.internal` para alcançar os serviços Node rodando fora do Docker.

## Rodando os serviços

Cada serviço tem seu próprio `package.json` e roda separado. Abra dois terminais.

ms-users:

```bash
cd ms-users
npm install
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

ms-email:

```bash
cd ms-email
npm install
npm run start:dev
```

O `ms-users` sobe na porta 3000 e o `ms-email` na 3002. A porta do `ms-email` serve só para expor o `/metrics` ao Prometheus, já que ele não tem rotas HTTP.

Suba o `ms-email` antes de criar usuários, senão o evento fica parado na fila até ele conectar.

## Variáveis de ambiente

Crie um `.env` dentro de cada serviço.

ms-users:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=user.created

OTEL_SERVICE_NAME=ms-users
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

ms-email:

```
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=user.created

METRICS_PORT=3002

OTEL_SERVICE_NAME=ms-email
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
```

O `RABBITMQ_QUEUE` precisa ser igual nos dois, porque hoje a publicação é direta na fila, sem exchange nomeada.

## Endpoints

Todos em `http://localhost:3000`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/users` | Lista os usuários |
| POST | `/users` | Cria um usuário e publica `user.created` |
| PATCH | `/users/:id` | Atualiza um usuário |
| DELETE | `/users/:id` | Remove um usuário |
| DELETE | `/users` | Remove todos os usuários |
| GET | `/metrics` | Métricas do Prometheus |

Criando um usuário:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Rafael","email":"rafael@exemplo.com"}'
```

Depois disso o email aparece na caixa do Mailtrap.

## Observabilidade

**Logs.** Pino nos dois serviços, com saída legível no terminal em desenvolvimento e cópia em `logs/app.log`. Todo log carrega o `correlationId` da requisição, além de `trace_id` e `span_id`, o que permite pular do log para a trace. Headers de autenticação, cookies e campos `password` são censurados automaticamente.

**Métricas.** Cada serviço expõe `/metrics`. Além das métricas padrão do Node (memória, CPU, event loop), existem três customizadas:

- `events_published_total` — eventos publicados no RabbitMQ, com labels `pattern` e `status`
- `events_consumed_total` — eventos consumidos, com labels `pattern` e `status`
- `event_processing_duration_seconds` — histograma do tempo de processamento do evento

No Grafana existe o dashboard **Microservices Nest - Overview**, que junta publicação versus consumo, profundidade da fila, latência p50/p95/p99 e saúde dos processos. O painel mais útil é o de publicação versus consumo: se a linha de publicados descolar da de consumidos, o `ms-email` está atrasado ou caiu.

**Tracing.** O OpenTelemetry é inicializado em `src/config/tracing.ts`, importado como primeira linha do `main.ts` dos dois serviços. Essa ordem importa, porque as instrumentações precisam carregar antes dos módulos que elas modificam. No Jaeger, uma trace de criação de usuário mostra a requisição HTTP, a query no Postgres, a publicação na fila e o envio do email.

## Estrutura

```
dockerfiles/
  docker-compose.yml     infraestrutura local
  prometheus.yml         configuração de scrape

ms-users/
  prisma/                schema e migrations
  src/
    config/              logger, tracing, correlationId
    modules/
      global/prisma/     PrismaService
      rabbitmq/          cliente e publicação de eventos
      users/             controller, service, repository e DTOs

ms-email/
  src/
    config/              logger e tracing
    modules/mail/        consumer, service e DTO do evento
```

## Observações

- Os dois serviços rodam fora do Docker. Só a infraestrutura está no compose.
- A publicação é feita com `emit`, ou seja, o `ms-users` não espera resposta do `ms-email`.
- O `noAck` está no padrão do NestJS, que é `true`. Na prática isso significa que a mensagem é confirmada na entrega e, se o envio do email falhar, o evento se perde. Para reprocessar em caso de falha, é preciso ligar `noAck: false` e configurar uma dead letter queue.
- O dashboard do Grafana foi criado pela API e vive apenas no volume `grafana_data`. Não está versionado aqui.
