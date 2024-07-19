// Example 3: Preserves context to maintain state.

const prompt = require('prompt-sync')();
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();


const bodyParser = require('body-parser');
const cors = require("cors");
const express = require('express');
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());


// Create Assistant service object.
const assistant = new AssistantV2({
  version: process.env.VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_IAM_API_KEY, // replace with API key
  }),
  url: process.env.ASSISTANT_IAM_URL, // replace with URL
});

const assistantId = process.env.WORKSPACE_ID_IMC; // replace with environment ID

// Start conversation with empty message
let context = {};


app.post("/send-message", async (req, res)=>{
    messageInput = {
      messageType: 'text',
      text: req.body.message,
    };
    console.log("User message: " + messageInput.text)
    let assistantMessage = sendMessage(messageInput, context);
    res.json(assistantMessage);
})

// Send message to assistant.
function sendMessage(messageInput, context) {
  assistant
    .messageStateless({
      assistantId,
      input: messageInput,
      context: context,
    })
    .then(res => {
      processResult(res.result);
    })
    .catch(err => {
      console.log(err); // something went wrong
    });
}


// Process the result.
function processResult(result) {

  context = result.context;

  // Print responses from actions, if any. Supports only text responses.
  if (result.output.generic) {
    if (result.output.generic.length > 0) {
      result.output.generic.forEach( response => {
        if (response.response_type === 'text') {
          console.log(response.text);
        }  
      });
    }
  }
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
  