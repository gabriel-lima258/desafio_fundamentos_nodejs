import fs from 'node:fs/promises'

// creating a path to db file on src paste
const databasePath = new URL('../db.json', import.meta.url)

export class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8')
        .then(data => {
            this.#database = JSON.parse(data)
        })
        .catch(() => {
            this.#persist()
        })
    }

    // persist keep the database saved in local storage
    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
    }

    insert(table, data) {

        // if exist a database insert data into, otherwise create a new one
        if(Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        // if search exists return data
        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            }) 
        }
        return data
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        // if id exists, update data
        if (rowIndex > -1) {
            const row = this.#database[table][rowIndex]
            this.#database[table][rowIndex] = { id, ...row, ...data }
            this.#persist()
        }  
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        // if id is equal, delete data
        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1) // splice delete a row
            this.#persist()
        }

    }
}