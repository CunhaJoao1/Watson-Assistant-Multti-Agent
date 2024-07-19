const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
require('dotenv').config()
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let userInput;
function askQuestion(query) {
  rl.question(query, (answer) => {
    userInput = answer
    
    // Continuar pedindo mensagens
    main()
    askQuestion(query);
  });
}
askQuestion("Mensagem: ")
async function main(){
    const assistant = new AssistantV2({
        version: process.env.VERSION,
        authenticator: new IamAuthenticator({
          apikey: process.env.ASSISTANT_IAM_API_KEY,
        }),
        serviceUrl: process.env.ASSISTANT_IAM_URL,
      });
      
      let redirect;
      let assistantId = getDestinationBot(redirect)
      let payload = {
        assistantId:assistantId,
        input: {
            'message_type': 'text',
            'text': userInput
        },
      }

      /* Envia mensagem para o chatbot */
    let root_agent_message = await assistant.messageStateless(payload);

    // console.log(root_agent_message)
      /* Salva a variavel redirect com o valor recebido pela resposta do assistant */
    redirect = root_agent_message.result.context.skills["actions skill"].skill_variables.redirect

    if(redirect == "imc"){
        let session_id = await assistant.createSession({
            assistantId: process.env.ASSISTANT_ID_ROOT

        })
        session_id = session_id.result.session_id
        // payload.context.global.session_id = session_id

        payload = redirectAgent(payload, session_id)
        payload.assistantId = process.env.WORKSPACE_ID_IMC

        // let imc_agent = await assistant.messageStateless(payload)
        // console.log("BotMessage: " + imc_agent.result.output.generic[0].text)
        // console.log(payload)
    }
    else if(redirect == 'credito'){

    }   
}

function redirectAgent(payload, session_id){
  const context = {
    global:{
      session_id
    }
}
  payload.context = context
  return payload
}
function getDestinationBot(redirect){
  if(!redirect){
    return process.env.ASSISTANT_ID_ROOT
  }
  else{
    console.log(process.env.ASSISTANT_ID_ + redirect.toUpperCase())
    return process.env.ASSISTANT_ID_ + redirect.toUpperCase()
  }
} 