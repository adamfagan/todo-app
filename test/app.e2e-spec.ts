import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3002);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3002');
  });

  afterAll(() => {
    app.close();
  });

  /*
    Auth
  */
  describe('Auth', () => {
    // ----- REGISTER -----
    describe('[POST] /auth/register', () => {
      const invalidPasswordNotNumber = {
        firstName: 'Sudhir',
        lastName: 'Kashi',
        email: 'sudhir@email.com',
        password: 'kashi.Sudhir',
        confirmPassword: 'kashi.Sudhir',
      };

      const invalidPasswordsDoNotMatch = {
        firstName: 'Jaume',
        lastName: 'Giulietta',
        email: 'jaume@email.com',
        password: 'Jaume.123',
        confirmPassword: 'Giulietta.123',
      };

      const validWithoutNames = {
        email: 'john_doe1@email.com',
        password: 'John.123',
        confirmPassword: 'John.123',
      };

      const valid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john_doe@email.com',
        password: 'John.123',
        confirmPassword: 'John.123',
      };

      it('Invalid request, response should return code 400 - Password is weak - Does not contain a number', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(invalidPasswordNotNumber)
          .expectStatus(400);
      });

      it('Invalid request, response should return code 400 - Passwords do not match', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(invalidPasswordsDoNotMatch)
          .expectStatus(400);
      });

      it('Valid request, response should return code 201 - without names', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(validWithoutNames)
          .expectStatus(201)
          .stores('userId', 'user.id');
      });

      it('Valid request, response should return code 201', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(valid)
          .expectStatus(201);
      });

      it('Invalid request, response should return code 409 - Email is already registered', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(valid)
          .expectStatus(409);
      });
    });

    // ----- LOGIN -----
    describe('[POST] /auth/login', () => {
      const invalidEmail = {
        email: 'wayne@email.com',
        password: 'John.123',
      };

      const invalidPassword = {
        email: 'john_doe@email.com',
        password: 'Joh.123',
      };

      const valid = {
        email: 'john_doe@email.com',
        password: 'John.123',
      };

      it('Invalid request, response should return code 401 - Invalid password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(invalidPassword)
          .expectStatus(401);
      });

      it('Invalid request, response should return code 401 - Invalid email', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(invalidEmail)
          .expectStatus(401);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(valid)
          .expectStatus(200)
          .stores('userAccessToken', 'accessToken');
      });
    });
  });

  /*
    Todo list
  */
  describe('Todo list', () => {
    describe('[POST] /todo-lists', () => {
      const invalidEmptyBody = {};

      const invalidNameIsNumber = {
        name: 1,
      };

      const valid = {
        name: 'Monday',
      };

      const valid2 = {
        name: 'Wednesday',
      };

      it('Invalid request, response should return code 401 - Non-provided token', () => {
        return pactum
          .spec()
          .post('/todo-lists')
          .withBody(valid)
          .expectStatus(401);
      });

      it('Invalid request, response should return code 400 - Non-provided body', () => {
        return pactum
          .spec()
          .post('/todo-lists')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalidEmptyBody)
          .expectStatus(400);
      });

      it('Invalid request, response should return code 400 - Name of the todo list is number', () => {
        return pactum
          .spec()
          .post('/todo-lists')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalidNameIsNumber)
          .expectStatus(400);
      });

      it('Valid request, response should return code 201', () => {
        return pactum
          .spec()
          .post('/todo-lists')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .expectStatus(201)
          .stores('todoListId', 'todoList.id');
      });

      it('Valid request, response should return code 201', () => {
        return pactum
          .spec()
          .post('/todo-lists')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid2)
          .expectStatus(201)
          .stores('todoListId2', 'todoList.id');
      });
    });

    describe('[GET] /todo-lists/{todoListId}', () => {
      it('Invalid request, response should return code 404 - Todo list with the specified id does not exist', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}')
          .withPathParams('todoListId', '9999')
          .expectStatus(404);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}')
          .withPathParams('todoListId', '$S{todoListId}')
          .expectStatus(200);
      });
    });

    describe('[POST] /todo-lists/share', () => {
      const invalidTodoListId = {
        todoListId: 9999,
        userId: '$S{userId}',
      };

      const invalidUserId = {
        todoListId: '$S{todoListId}',
        userId: 9999,
      };

      const valid = {
        todoListId: '$S{todoListId}',
        userId: '$S{userId}',
      };

      it('Invalid request, response should return code 404 - Todo list to share does not exist', () => {
        return pactum
          .spec()
          .post('/todo-lists/share')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalidTodoListId)
          .expectStatus(404);
      });

      it('Invalid request, response should return code 404 - The user to whom the todo list should be shared does not exist', () => {
        return pactum
          .spec()
          .post('/todo-lists/share')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalidUserId)
          .expectStatus(404);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .post('/todo-lists/share')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .expectStatus(200);
      });
    });

    describe('[PATCH] /todo-lists/{todoListId}', () => {
      const valid = {
        name: 'Tuesday',
      };

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId}')
          .withBody(valid)
          .expectStatus(200);
      });

      it('Invalid request, response should return code 404 - Todo list with the specified id does not exist', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '9999')
          .withBody(valid)
          .expectStatus(404);
      });
    });

    describe('[DELETE] /todo-lists/{todoListId}', () => {
      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .delete('/todo-lists/{todoListId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId}')
          .expectStatus(200);
      });

      it('Invalid request, response should return code 404 - Todo list with the specified id does not exist', () => {
        return pactum
          .spec()
          .delete('/todo-lists/{todoListId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '9999')
          .expectStatus(404);
      });
    });
  });

  describe('Todo list item', () => {
    describe('[POST] /todo-lists/{todoListId}/items', () => {
      const valid = {
        title: 'Morning',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        deadline: '2022-04-23T18:25:43.511Z',
      };

      const validWithState = {
        title: 'Afternoon',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        deadline: '2022-04-24T18:25:43.511Z',
        state: 'COMPLETED',
      };

      const invalidDeadline = {
        title: 'Evening',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        deadline: '2022-04-2418:25:43.511Z',
      };

      it('Invalid request, response should return code 401 - Non-provided token', () => {
        return pactum
          .spec()
          .post('/todo-lists/{todoListId}/items')
          .withBody(valid)
          .withPathParams('todoListId', '$S{todoListId2}')
          .expectStatus(401)
          .stores('todoListItemId', 'todoListItem.id');
      });

      it('Invalid request, response should return code 404 - The todo list to which you are trying add an item does not exist', () => {
        return pactum
          .spec()
          .post('/todo-lists/{todoListId}/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(validWithState)
          .withPathParams('todoListId', '9999')
          .expectStatus(404);
      });

      it('Invalid request, response should return code 400 - Deadline is not in the correct form', () => {
        return pactum
          .spec()
          .post('/todo-lists/{todoListId}/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalidDeadline)
          .withPathParams('todoListId', '$S{todoListId2}')
          .expectStatus(400);
      });

      it('Valid request, response should return code 201 - Without state', () => {
        return pactum
          .spec()
          .post('/todo-lists/{todoListId}/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .withPathParams('todoListId', '$S{todoListId2}')
          .expectStatus(201)
          .stores('todoListItemId', 'todoListItem.id');
      });

      it('Valid request, response should return code 201 - With state', () => {
        return pactum
          .spec()
          .post('/todo-lists/{todoListId}/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(validWithState)
          .withPathParams('todoListId', '$S{todoListId2}')
          .expectStatus(201);
      });
    });

    describe('[GET] /todo-lists/{todoListId}/items/{todoListItemId}', () => {
      it('Invalid request, response should return code 401 - Non-provided token', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(401);
      });

      it('Invalid request, response should return code 404 - The todo list whose item you are trying to view does not exist', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '9999')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(404);
      });

      it('Invalid request, response should return code 404 - The item you are trying to view does not exist', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '9999')
          .expectStatus(404);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .get('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(200);
      });
    });

    describe('[PATCH] /todo-lists/{todoListId}/items/{todoListItemId}', () => {
      const valid = {
        state: 'COMPLETED',
      };

      const invalid = {
        state: 'INVALID',
      };

      it('Invalid request, response should return code 404 - The todo list whose item you are trying to modify does not exist', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .withPathParams('todoListId', '9999')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(404);
      });

      it('Invalid request, response should return code 404 - The item you are trying to modify does not exist', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '9999')
          .expectStatus(404);
      });

      it('Invalid request, response should return code 400 - state is not from enum (ACTIVE, COMPLETED, CANCELLED)', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(invalid)
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(400);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .patch('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(valid)
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(200);
      });
    });

    describe('[DELETE] /todo-lists/{todoListId}/items/{todoListItemId}', () => {
      it('Invalid request, response should return code 404 - The todo list whose item you are trying to delete does not exist', () => {
        return pactum
          .spec()
          .delete('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '9999')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(404);
      });

      it('Invalid request, response should return code 404 - The item you are trying to delete does not exist', () => {
        return pactum
          .spec()
          .delete('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '9999')
          .expectStatus(404);
      });

      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .delete('/todo-lists/{todoListId}/items/{todoListItemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withPathParams('todoListId', '$S{todoListId2}')
          .withPathParams('todoListItemId', '$S{todoListItemId}')
          .expectStatus(200);
      });
    });
  });

  describe('User', () => {
    describe('[GET] /users/me', () => {
      it('Valid request, response should return code 200', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('[GET] /users', () => {
      it('Invalid request, response should return code 400 - Limit is out of the allowed range - page = 1, limit = 51', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withQueryParams('page', 1)
          .withQueryParams('limit', 51)
          .expectStatus(400);
      });

      it('Valid request, response should return code 200 - page = 1, limit = 2', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withQueryParams('page', 1)
          .withQueryParams('limit', 2)
          .expectStatus(200);
      });

      it('Valid request, response should return code 200 - Default values for pagination', () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });
  });
});
