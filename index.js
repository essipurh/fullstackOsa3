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
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(result => {
    console.log(result.toJSON())
    res.status(204).end()
  })
    .catch(error => next(error))
})

/*
const generateId = () => {
    const id = Math.floor(Math.random() * 10000) + 1;
    return id
}
*/

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const person =  new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson =>  savedPerson.toJSON()).then( savedAndFormattedPerson => {
    res.json(savedAndFormattedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
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
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})