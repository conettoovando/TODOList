import { TaskModel } from '../Models/mysql/tasks.js'

export class TaskController {
  constructor () {
    this.taskModel = TaskModel
  }

  sendStatus = (req, res) => { res.status(200).send() }

  getAll = async (req, res) => {
    const { userid, userNameSession } = req.session
    if (!userid || !userNameSession) return res.status(400).json({ message: 'Error en la información requerida' })

    const tasks = await this.taskModel.getAll({ userid, userNameSession })

    res.json(tasks)
  }

  getById = async (req, res) => {
    const { userid, userNameSession } = req.session
    const { id } = req.params

    if (!userid || !userNameSession) return res.status(400).json({ message: 'Error en la información requerida' })

    const task = await this.taskModel.getById({ userid, userNameSession, id })

    res.json(task)
  }

  createTask = async (req, res) => {
    const { userid, userNameSession } = req.session
    const { taskname, date_limit: dateLimit } = req.body

    const newTask = {
      taskname,
      dateLimit
    }

    if (!userid || !userNameSession) return res.status(400).json({ message: 'Error en la información requerida' })

    const result = await this.taskModel.createUser({ userid, userNameSession, newTask })

    res.json(result)
  }

  deleteTask = async (req, res) => {
    const { userid, userNameSession } = req.session
    const { id } = req.params

    if (!userid || !userNameSession) return res.status(400).json({ message: 'Error en la información requerida' })

    const result = this.taskModel.deleteTask({ id, userid, userNameSession })

    res.send(result)
  }

  updateTask = async (req, res) => {
    const { userid, userNameSession } = req.session
    const { id } = req.params
    const { taskname, date_limit: dateLimit } = req.body // Datos opcionales para actualizar

    if (!userid || !userNameSession) {
      return res.status(400).json({ message: 'Error en la información requerida' })
    }

    const taskInfo = {
      taskname,
      dateLimit
    }

    const result = await this.taskModel.updateTask({ id, userid, userNameSession, task: taskInfo })

    res.send(result)
  }
}
