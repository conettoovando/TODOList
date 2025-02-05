import express from 'express'
import { PORT, SECRET_KEY } from './config.js'
import cookieParser from 'cookie-parser'
import { createTaskRouter } from './routes/tasks.js'
import { createUserRouter } from './routes/users.js'

const app = express()
app.disable('x-powered-by')

app.use(express.json())
app.use(cookieParser(SECRET_KEY))

app.use((req, res, next) => {
  const token = req.cookies.access_token
  const username = req.cookies.username

  req.session = { userid: null, userNameSession: null }
  try {
    // TODO -> Incluir seguridad y validación de token con crypto
    req.session.userid = token
    req.session.userNameSession = username
  } catch {}
  next()
})

app.use('/', createTaskRouter())
app.use('/login', createUserRouter())

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
