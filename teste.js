const sendMessage = require("./messages")

const bodyParser = require('body-parser');
const cors = require("cors");
const express = require('express');
const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());

app.get("/" , (req,res)=>{
    res.json(req)
})
app.post("/teste", (req,res)=>{

    let {message} = req.body
    let teste = sendMessage(message)

    res.json(teste);

})


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  