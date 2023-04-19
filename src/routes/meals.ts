import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  // rota de listagem de TODAS refeições de TODOS usuários
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('*')

      return { meals }
    },
  )

  // rota de listagem de TODAS refeições de um ÚNICO usuário
  app.get(
    '/:userID',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        userID: z.string().uuid(),
      })

      const { userID } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const meal = await knex('meals').where({
        session_id: sessionId,
        userID,
      })

      return { meal }
    },
  )

  // rota de listagem de uma ÚNICA refeição de um ÚNICO usuário
  app.get(
    '/:userID/:mealID',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        userID: z.string().uuid(),
        mealID: z.string().uuid(),
      })

      const { userID, mealID } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const meal = await knex('meals').where({
        session_id: sessionId,
        userID,
        mealID,
      })

      return { meal }
    },
  )

  // rota para deletar uma refeição
  app.delete(
    '/:userID/:mealID',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        userID: z.string().uuid(),
        mealID: z.string().uuid(),
      })

      const { userID, mealID } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      await knex('meals')
        .where({
          session_id: sessionId,
          userID,
          mealID,
        })
        .del()

      return reply.status(200).send()
    },
  )

  // rota de edição de uma refeição //
  app.put(
    '/:userID/:mealID',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        userID: z.string().uuid(),
        mealID: z.string().uuid(),
      })

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().length(10).optional(),
        time: z.string().length(5).optional(),
        inDiet: z.enum(['Sim', 'Não']).optional(),
      })

      const { userID, mealID } = getMealParamsSchema.parse(request.params)
      const { name, description, date, time, inDiet } =
        updateMealBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      await knex('meals')
        .where({
          session_id: sessionId,
          userID,
          mealID,
        })
        .update({
          name,
          description,
          date,
          time,
          inDiet,
          updated_at: knex.fn.now(),
        })

      return reply.status(200).send()
    },
  )

  // rota de criação de refeições
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        userID: z.string().uuid(),
        description: z.string(),
        date: z.string().length(10),
        time: z.string().length(5),
        inDiet: z.enum(['Sim', 'Não']),
      })

      const { name, userID, description, date, time, inDiet } =
        createMealsBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      await knex('meals').insert({
        mealID: randomUUID(),
        name,
        userID,
        description,
        date,
        time,
        inDiet,
        session_id: sessionId,
      })

      return reply.status(201).send()
    },
  )

  // rota das métricas de usuário
  app.get(
    '/summary/:userID',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getUserIDParamSchema = z.object({
        userID: z.string().uuid(),
      })

      const { userID } = getUserIDParamSchema.parse(request.params)

      const { sessionId } = request.cookies

      const totalMeals = await knex('meals')
        .where({
          session_id: sessionId,
          userID,
        })
        .count('*', { as: 'amount' })

      const totalMealsInDiet = await knex('meals')
        .where({
          session_id: sessionId,
          userID,
        })
        .where('inDiet', 'Sim')
        .count('*', { as: 'amount' })

      const totalMealsOffDiet = await knex('meals')
        .where({
          session_id: sessionId,
          userID,
        })
        .where('inDiet', 'Não')
        .count('*', { as: 'amount' })

      return { totalMeals, totalMealsInDiet, totalMealsOffDiet }
    },
  )
}
