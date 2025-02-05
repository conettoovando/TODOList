import { Router } from 'express'
import { UserController } from '../Controllers/users.js'

export const createUserRouter = () => {
  const userRouter = Router()

  const userController = new UserController()

  // Iniciar sesión del usuario
  userRouter.post('/', userController.login)

  return userRouter
}
