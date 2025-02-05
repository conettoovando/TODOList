import { Router } from 'express'
import { TaskController } from '../Controllers/tasks.js'

export const createTaskRouter = () => {
  const tasksRouter = Router()

  const taskController = new TaskController()

  // Comprobar disponibilidad de la API
  tasksRouter.get('/status', taskController.sendStatus)
  // Leer todas las tareas del usuario
  tasksRouter.get('/tasks', taskController.getAll)
  // Obtener una tarea especifica
  tasksRouter.get('/tasks/:id', taskController.getById)
  // crear tareas nuevas
  tasksRouter.post('/tasks', taskController.createTask)
  // eliminar tareas
  tasksRouter.delete('/tasks/:id', taskController.deleteTask)
  // Actualizar tareas
  tasksRouter.patch('/tasks/:id', taskController.updateTask)

  return tasksRouter
}
