const express = require('express')

const app = express()
const port = 3000
const root = 'docs'

app.use(express.static(root))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
