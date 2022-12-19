
# API for ToDo list management application
The application is programmed using TypeScript with NestJS framework. Two CRUDs are implemented, one for todo lists and the other for todo list items. The application also implements authentication using the passport package resp. passport-jwt, where all endpoints are subject to authentication, except for three, namely /register, /login and the endpoint for viewing the list and its items - /todo-lists/:todoListId. There are two databases - dev and test, both of which are PostgreSQL and both of them are running in Docker. Prisma is used as the ORM, which is used to connect the application to the database, models are defined using it and tables are created in the database using migrations. The input data from the requests are validated using ValidationPipe resp. class-validator, whose decorators are used for DTO classes. The tests are written using the Pactum package and only a few tests are implemented (42), so they don't cover everything. The .env files are pushed on purpose, for ease of running the application. The API documentation is created using the Swagger tool and during running of the application can be found at the url - http://localhost:3001/api or you can simply copy the content of the swagger.json file and paste it into - https://editor-next.swagger.io/.


## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn start:dev
```

## Running the dev database (with migrations)

```bash
# development
$ yarn db:dev:start
```

## Running the test database (with migrations)

```bash
# test
$ yarn db:test:start
```

## Tests

```bash
# e2e tests
$ yarn test:e2e

# e2e tests with watch (after save runs migrations a tests)
$ yarn test:e2e:watch
```

## Database design