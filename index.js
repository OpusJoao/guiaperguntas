const express = require('express')
const bodyParser = require('body-parser')
const connection = require('./database/database')
const perguntaModel = require('./database/Pergunta')
const respostaModel = require('./database/Resposta')
const app = express()
const PORT = 3000


connection.authenticate().then(() => console.log(`Sucessfuly connection with database`)).catch(error =>
    console.error(`Error trying to connect database`, error)
)

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    perguntaModel.findAll({
        raw: true, 
        order: [
            ['id', 'desc']
        ]
    }).then(perguntas => {
        res.render('index', { perguntas: perguntas })
    })
})

app.get('/perguntar', (req, res) => {
    res.render('perguntar')
})

app.get('/pergunta/:id', async (req, res) => {
    try {
        const { id: idPergunta } = req.params
        const pergunta = await perguntaModel.findOne({
            raw: true,
            where: {
                id: idPergunta
            }
        })
        if (!pergunta) {
            res.redirect('/')
            return
        }
        const respostas = await respostaModel.findAll({
            where: {
                perguntaId: pergunta.id
            },
            order: [
                ['id', 'desc']
            ]
        })

        res.render('pergunta', { pergunta: pergunta, respostas: respostas })
        return
    } catch (error) {
        console.error('[Server] error tryng get responses', error)
        res.redirect('/')
        return
    }

})

app.post('/perguntar', (req, res) => {
    const { titulo, descricao } = req.body
    perguntaModel.create({
        titulo,
        descricao
    }).then(() => {
        res.redirect('/')
    }).catch(error => {
        res.redirect('/perguntar')
    })
})

app.post('/responder/', (req, res) => {
    const { corpo, id: idPergunta } = req.body
    respostaModel.create({
        corpo,
        perguntaId: idPergunta
    }).then(() => {
        res.redirect(`/pergunta/${idPergunta}`)
    }).catch(error => {
        res.redirect('/perguntar')
    })
})


app.listen(PORT, error => {
    error ? console.error(error)
        : console.log(`[Server] Server is running on port ${PORT}`)
})