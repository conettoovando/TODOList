import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: null,
  database: 'todoList'
}

const connection = await mysql.createConnection(config)

export class TaskModel {
  static async createUUID () {
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    return uuid
  }

  // Metodo para iniciar sesion automaticamente.
  static async createAccount ({ newusername }) {
    const uuid = await this.createUUID()
    await connection.query('insert into users (id, username) values (UUID_TO_BIN(?),?)', [uuid, newusername ?? 'Invitado'])

    const [userInfo] = await connection.query('SELECT *, BIN_TO_UUID(id) id FROM users WHERE id = UUID_TO_BIN(?)', [uuid])
    const { id, username } = userInfo[0]

    return { id, username }
  }

  // Metodo para verificiar la integridad del usuario
  static async validateUser ({ userid, userNameSession }) {
    try {
      const [user] = await connection.query('SELECT username FROM users WHERE id = UUID_TO_BIN(?);', [userid])

      if (user.length <= 0 || userNameSession !== user[0].username) throw new Error('Usuario invalido')

      return user
    } catch (error) {
      console.log('usuario invalidoooooo')
    }
  }

  static async getAll ({ userid, userNameSession }) {
    // COMPROBAR SI EL USUARIO PUEDE ACCEDER SIN TOKEN
    await this.validateUser({ userid, userNameSession })

    const [userTaskData] = await connection.query(`SELECT 
            BIN_TO_UUID(t.id) AS id, t.taskname, u.username, t.date_limit, t.created_at 
            FROM tasks t JOIN users u ON t.user_id = u.id 
            WHERE u.id = UUID_TO_BIN(?) AND u.username = ?;`,
    [userid, userNameSession])

    if (userTaskData.length <= 0) return []

    return userTaskData
  }

  static async getById ({ userid, userNameSession, id }) {
    await this.validateUser({ userid, userNameSession })

    const [userTaskData] = await connection.query(`SELECT 
      BIN_TO_UUID(t.id) AS id, t.taskname, u.username, t.date_limit, t.created_at, t.update_at 
      FROM tasks t JOIN users u ON t.user_id = u.id 
      WHERE u.id = UUID_TO_BIN(?) AND u.username = ? AND t.id=UUID_TO_BIN(?);`,
    [userid, userNameSession, id])

    if (userTaskData[0].length <= 0) throw new Error('Error interno del servidor')

    return userTaskData
  }

  static async createUser ({ userid, userNameSession, newTask: { taskname, dateLimit } }) {
    await this.validateUser({ userid, userNameSession })

    const uuid = await this.createUUID()

    await connection.query('insert into tasks (id, taskname, date_limit, user_id) values (UUID_TO_BIN(?), ?, ?, UUID_TO_BIN(?));', [uuid, taskname, dateLimit, userid])

    return await this.getAll({ userid, userNameSession })
  }

  static async deleteTask ({ id, userid, userNameSession }) {
    this.validateUser({ userid, userNameSession })
    const sql = 'DELETE FROM tasks WHERE id = UUID_TO_BIN(?) AND user_id = UUID_TO_BIN(?)'
    const [result] = await connection.query(sql, [id, userid])

    if (result.affectedRows === 0) {
      return { success: false, message: 'Tarea no encontrada o sin permisos' }
    }

    return { success: true, message: 'Tarea eliminada correctamente' }
  }

  static async updateTask ({ id, userid, userNameSession, task }) {
    try {
      // Verificar si el usuario existe y tiene acceso
      await this.validateUser({ userid, userNameSession })

      // Construir la consulta dinámicamente
      const fieldsToUpdate = []
      const values = []

      if (task.taskname !== undefined) {
        fieldsToUpdate.push('taskname = ?')
        values.push(task.taskname)
      }

      if (task.dateLimit !== undefined) {
        fieldsToUpdate.push('date_limit = ?')
        values.push(task.dateLimit)
      }

      if (fieldsToUpdate.length === 0) {
        return { success: false, message: 'No hay cambios para actualizar' }
      }

      // Agregar update_at automáticamente si hay cambios
      fieldsToUpdate.push('update_at = CURRENT_TIMESTAMP')

      // Crear la consulta final
      const sql = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = UUID_TO_BIN(?) AND user_id = UUID_TO_BIN(?)`
      values.push(id, userid) // Agregar id y user_id a los valores

      const [updateResult] = await connection.query(sql, values)

      if (updateResult.affectedRows === 0) {
        return { success: false, message: 'Tarea no encontrada o sin permisos' }
      }

      const newResultData = await this.getById({ userid, userNameSession, id })

      return newResultData
    } catch (err) {
      console.log('error en la actualización')
      console.log(err)
    }
  }
}
