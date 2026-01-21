import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { limiter } from './shared/utils/rateLimiter'
import logger from './shared/utils/logger'
import { ApiResponse } from './shared/types'
import { notFoundHandler } from './shared/middlewares/notFoundHandler'
import { errorHandler } from './shared/middlewares/errorHandler'
import config from './config'

const app = express()

// middlewares
app.use(helmet())
app.use(hpp())
app.use(cors())
app.use(limiter)
app.use(compression())
app.use(morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) }
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// register routes
app.get('/', (_req, res) => {
    res.send('Welcome to My Order Fellow API')
})
app.get(`${config.api.prefix}/health`, (_req, res) => {
    const apiResponse: ApiResponse = {
        success: true,
        message: "My Order Fellow API is healthy",
        data: {
            status: "OK",
            api_version: config.api.version,
            timestamp: new Date().toDateString()
        }
    }
    res.status(200).json(apiResponse);
});
// register modules routes

// error handlers
app.use(notFoundHandler)
app.use(errorHandler)

export default app