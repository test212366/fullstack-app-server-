
const start = async () => {
    const express = require('express')
    const config = require('config')
    const mongoose = require('mongoose')
    const app = express()
    const PORT = config.get('PORT') || 5000


    //middlewares
    app.use(express.json())
    app.use('/api/auth', require('./routes/auth.routes'))

    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        app.listen(PORT, () => {
            console.log('server started in port:' + PORT)
        })
        app.get('/', (req, res) => {
            res.json({message: 'active'})
        })
    } catch (e) {
        console.log(e)
        process.exit(1)
    }

}
start()