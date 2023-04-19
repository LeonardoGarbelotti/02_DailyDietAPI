// eslint-disable-next-line no-unused-vars
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
      session_id?: string
    }
    meals: {
      mealID: string
      userID: string
      name: string
      description: string
      date: string
      time: string
      inDiet: string
      created_at: string
      updated_at: string
      session_id?: string
    }
  }
}
