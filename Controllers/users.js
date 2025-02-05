import { TaskModel } from '../Models/mysql/tasks.js'

export class UserController {
  constructor () {
    this.taskModel = TaskModel
  }

  register = async (req, res) => {
    const { username: newusername } = req.body

    const { id, username } = await this.taskModel.createAccount({ newusername })

    res
      .cookie('access_token', id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'producction',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30
      })

    res
      .cookie('username', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'producction',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30
      })
    return res.status(201).json({ message: `Usuaruio ${username ?? 'Invitado'} creado correctamente` })
  }

  login = async (req, res) => {
    const { userid, userNameSession } = req.session

    if (!userid) return this.register(req, res)
    // Metodo para verificiar la integridad del usuario
    const result = await this.taskModel.validateUser({ userid, userNameSession })

    if (!result) return res.status(404).json({ succes: false, message: 'Usuario invalido' })

    res
      .cookie('access_token', userid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'producction',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30
      })

    res
      .cookie('username', userNameSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'producction',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 30
      })
    res.status(200).json({ succes: true, message: 'Acceso concedido' })
  }
}
