const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/person')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


/*
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
*/

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        const amount = persons.length
        const date = new Date()
        res.send(`<p>Phonebook has info for ${amount} people</p>
            <div>${date}</div>`)
    })
    
})

app.get('/api/persons', (req,res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) { res.json(person.toJSON()) }
        else { res.status(404).end() }
    })
    .catch(error => next(error))
    /**
    const id =  Number(req.params.id)
    const person = persons.find(person =>  person.id === id)

    if (person) {
        
    } else {
        res.status(404).end()
    }
    */
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id).then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
    /*
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)

    res.status(204).end()
    */
})

/*
const generateId = () => {
    const id = Math.floor(Math.random() * 10000) + 1;
    return id
}
*/

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    /*
    if (body.name === '') { //undefined ei toimi! Siksi ''
        console.log('name missing')
        return res.status(400).json({ error: 'name missing' })
        
    }

    if(body.number === '') {
        console.log('number missing')
        return res.status(400).json({ error: 'number missing' })
    }
    */
    /*
    if(persons.find(person =>  person.name === body.name)) {
        return res.status(409).json({   
            error: 'name must be unique'
        })
    }
    */
    
    const person =  new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson =>  savedPerson.toJSON()).then( savedAndFormattedPerson => {
        res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
    //persons = persons.concat(person)  
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true }, { runValidators: true, context: 'query' })
      .then(updatedPerson => {
        res.json(updatedPerson.toJSON())
      })
      .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})