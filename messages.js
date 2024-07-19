// Example 3: Preserves context to maintain state.
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config();

console.log(process.env.ASSISTANT_IAM_API_KEY)
// Create Assistant service object.
const assistant = new AssistantV2({
  version: process.env.VERSION,
  authenticator: new IamAuthenticator({
    apikey: process.env.ASSISTANT_IAM_API_KEY, // replace with API key
  }),
  url: process.env.ASSISTANT_IAM_URL, // replace with URL
});

let redirect; 
let assistantId;
// Start conversation with empty message
let context = {};



// Send message to assistant.
async function sendMessage(userInput) {

  assistantId = setAssistantID(redirect)
  messageInput = {
    messageType: 'text',
    text: userInput,
  };
  
  let agentMessage = await assistant
    .messageStateless({
      assistantId,
      input: messageInput,
      context: context,
    })
    if(agentMessage.result.context.skills["actions skill"].skill_variables.redirect){
      redirect = agentMessage.result.context.skills["actions skill"].skill_variables.redirect
      console.log('✌️ redirect --->', redirect);
    }
    
    let result = await processResult(agentMessage.result);
    return {
      text: result,
      redirect: agentMessage    
    }
}


// Process the result.
async function processResult(result) {
  context = result.context;

  // Print responses from actions, if any. Supports only text responses.
  if (result.output.generic) {
    for (const response of result.output.generic) {
      if (response.response_type === 'text') {
        console.log(">>> " + response.text);
        return response.text;
      }
    }
  }
}

function setAssistantID(redirect){
  if(redirect == "imc"){
    return process.env.WORKSPACE_ID_IMC
  }
  else if(redirect == "credito"){
    return WORKSPACE_ID_CREDITO
  }
  else{
    return process.env.ASSISTANT_ID_ROOT
  }
}


module.exports = sendMessage;