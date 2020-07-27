const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Loveace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Bramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    },
]


app.get('/info', (req, res) => {
    const amount = persons.length
    const date = new Date()
    res.send(`<p>Phonebook has info for ${amount} people</p>
            <div>${date}</div>`)
})

app.get('/api/persons', (req,res) => res.json(persons))

app.get('/api/persons/:id', (req, res) => {
    const id =  Number(req.params.id)
    const person = persons.find(person =>  person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
})

const generateId = () => {
    const id = Math.floor(Math.random() * 10000) + 1;
    return id
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    if(!body.name) {
        return res.status(404).json({   
            error: 'name missing'
        })
    }
    if(!body.number) {
        return res.status(404).json({   
            error: 'number missing'
        })
    }
    if(persons.find(person =>  person.name === body.name)) {
        return res.status(409).json({   
            error: 'name must be unique'
        })
    }

    const person =  {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(person)
    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})