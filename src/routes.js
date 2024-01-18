import { randomUUID } from "crypto"
import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js"

const database = new Database()

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body
            
            if (!title) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'title is required'})
                )
            }

            if (!description) {
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'description is required'})
                )
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            }

            database.insert('tasks', task)

            return res.writeHead(201).end(
                JSON.stringify({ message: 'task created successfully'})
            )
        }
    },

    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },

    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body

            if (!title && !description) {
                return res.writeHead(400).end(
                    JSON.stringify({message: 'title or description are required'})
                )
            }

            // verify if task exists
            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: 'task not found'})
                )
            }

            // if title or description exist throw the new data, else throw the old data
            database.update('tasks', id, {
                title: title ?? task.title,
                description: description ?? task.description,
               // completed_at: task.completed_at ?? null,
                created_at: task.created_at,
                updated_at: new Date()
            })

            return res.writeHead(200).end(
                JSON.stringify({ message: 'task updated successfully'})
            )
        }
    },

    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            // verify if task exists
            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: 'task not found'})
                )
            }

            database.delete('tasks', id)

            return res.writeHead(200).end(
                JSON.stringify({ message: 'task deleted successfully'})
            )
        }
    },

    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if (!task) {
                return res.writeHead(404).end(
                    JSON.stringify({ message: 'task not found'})
                )
            }

            const isTaskCompleted = !!task.completed_at
            const completed_at = isTaskCompleted ? null : new Date()

            database.update('tasks',  id, { completed_at })

            return res.writeHead(200).end(
                JSON.stringify({message: 'task is completed'})
            )
        }
    }
]