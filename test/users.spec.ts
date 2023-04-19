import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  // antes de cada teste, reseta o banco de dados
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Leonardo G',
      })
      .expect(201)
  })

  it('should be able to list all users', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo G',
    })

    // cria uma variável para armazenar o valor do cookie
    const cookies = createUserResponse.get('Set-Cookie')

    // realiza e testa a listagem de transações
    const listUserResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    // testa se os valores recebidos no body da listagem estão de acordo
    expect(listUserResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'Leonardo G',
      }),
    ])
  })
})
