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
let redirect;

app.post("/teste",async (req,res)=>{

    let {message} = req.body
    messageInput = {
        messageType: 'text',
        text: message,
      };
    
    console.log("user input>>> " + message)
    let agentMessage = await sendMessage(message)
    // redirect = agentMessage.result.context.skills["actions skill"].skill_variables.redirect
    // console.log({agentMessage})
    res.send({response: agentMessage});

})


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  