const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const readline = require('readline');
const express = require('express');
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let userInput;
let currentAgent = 'root';
let payload;
let context = {};  // Variável para armazenar o contexto da conversa

const assistant = new AssistantV2({
  version: process.env.VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_IAM_API_KEY,
  }),
  serviceUrl: process.env.ASSISTANT_IAM_URL,
});

function getDestinationBot(agent) {
  if (agent === 'root') {
    return process.env.ASSISTANT_ID_ROOT;
  } else if (agent === 'imc') {
    return process.env.WORKSPACE_ID_IMC;
  } else if (agent === 'credito') {
    return process.env.WORKSPACE_ID_CREDITO;
  }
}

let count = 0;
app.post('/send-message', async (req, res) => {
  count++;
  console.log("Contador: " + count);
  console.log("User message: "+ req.body.message);
  console.log("current agent: " + currentAgent);

  userInput = req.body.message;

  let assistantId = getDestinationBot(currentAgent);

  payload = {
    assistantId: assistantId,
    input: {
      'message_type': 'text',
      'text': userInput
    },
    context: context,  // Passar o contexto atual
    userId: "1234joao1234"
  };

  // console.log("Payload: " + JSON.stringify(payload));
  let response = await assistant.messageStateless(payload);

  if(response.result.output.generic[0]) {
    console.log("BotMessage: " + response.result.output.generic[0].text);
  }

  context = response.result.context || {};

  let redirect;
  try {
    redirect = response.result.context.skills["actions skill"].skill_variables.redirect;
  } catch (error) {
    redirect = 'root';
  }

  if (redirect === "imc" || redirect === "credito") {
    currentAgent = redirect;
    assistantId = getDestinationBot(redirect);
    payload.assistantId = assistantId;
    
    let sessionResponse = await assistant.createSession({ assistantId });
    const sessionId = sessionResponse.result.session_id;

    payload.context = {
      global: {
        system: {
          user_id: "1234joao1234",
          session_id: sessionId
        }
      },
      skills: {
        "actions skill": {
          "user_defined": context.skills["actions skill"].user_defined
        }
      }
    };

    // console.log("Payload com session: " + JSON.stringify(payload, null, 2));
    response = await assistant.messageStateless(payload);

    if(response.result.output.generic[0]) {
      console.log("BotMessage: " + response.result.output.generic[0].text);
    }
  }

  res.json(response.result.output.generic[0].text);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
