<template>
    <div class="chat-container">
      <h1>Smart Itinerary planner</h1>
  
      <div class="chat-box">
        <!-- Bot Welcome -->
        <div class="bot fade-in">
          <p>Hi! I am your travel assistant! I can help you with your trip planning. Please let me know some details about your trip!</p>
        </div>
  
        <!-- Step 1: Departure Date -->
        <div v-if="step >= 1" class="bot fade-in">
          <p>When is your departure date? Pick from the calendar!</p>
          <input type="date" v-model="startDate" @change="goToNextStep(2)" required />
        </div>
  
        <!-- Step 2: Arrival Date -->
        <div v-if="step >= 2" class="bot fade-in">
          <p>When is your arrival date? Pick from the calendar!</p>
          <input type="date" v-model="endDate" @change="goToNextStep(3)" required />
        </div>
  
        <!-- Step 3: Number of Travelers -->
        <div v-if="step >= 3" class="bot fade-in">
          <p>Are you traveling alone or with a team? Please tell me the number of people:</p>
          <input type="number" v-model="pax" @change="goToNextStep(4)" required />
        </div>
  
        <!-- Trip Summary -->
        <div v-if="step >= 4" class="bot fade-in">
          <p>✈️ Great! Your trip summary:</p>
          <p>- Start Date: {{ startDate }}</p>
          <p>- End Date: {{ endDate }}</p>
          <p>- Number of People: {{ pax }}</p>
          <p>💬 Now tell me any place you have in mind or I can suggest an itinerary!</p>
        </div>
  
        <!-- Chat Messages -->
        <div v-for="(msg, index) in messages" :key="index" :class="msg.sender + ' fade-in'">
          <p v-if="msg.sender === 'user'">{{ msg.text }}</p>
          <div v-else v-html="msg.text"></div> <!-- Bot response with HTML -->
        </div>
      </div>
  
      <!-- User Input -->
      <div class="input-area" v-if="step >= 4">
        <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const step = ref(1)
  const startDate = ref('')
  const endDate = ref('')
  const pax = ref('')
  const messages = ref([])
  const userMessage = ref('')
  const chatContext = ref('') // Context memory
  
  function goToNextStep(nextStep) {
    if (step.value < nextStep) {
      step.value = nextStep
    }
  }
  
  async function sendMessage() {
    if (userMessage.value.trim() === '') return
  
    // Add user message
    messages.value.push({ sender: 'user', text: userMessage.value })
  
    const question = userMessage.value
    userMessage.value = ''
  
    // Add bot "thinking"
    messages.value.push({ sender: 'bot', text: 'Thinking...' })
  
    try {
      let prompt = ''
  
      if (chatContext.value === '') {
        prompt = `Based on the following travel details:
  - Departure Date: ${startDate.value}
  - Arrival Date: ${endDate.value}
  - Number of Pax: ${pax.value}
  - City: ${question}
  
  Create a travel itinerary.
  
  Rules:
  - Do NOT change the city.
  - Do NOT change the departure or arrival dates.
  - Assume the traveler is interested in exploring the city properly with a mix of sightseeing, local experiences, and relaxation.
  
  Output Format:
  - Start with an <h2> heading like: "[Number of Days] Days / [Number of Nights] Nights [City Name] Itinerary".
  - Followed by a <section> containing the Day-wise plan:
    - Each day should start with an <h3> like "Day 1: [Short Title]".
    - Followed by a <p> description of activities for the day.
  
  Make sure the entire output is properly formatted in HTML tags.`
      } else {
        prompt = `We have been discussing the following itinerary or plan:
  ${chatContext.value}
  
  Now, the user asks:
  "${question}"
  
  Please continue the conversation based on this context.
  Respond in HTML format with headings and paragraphs where necessary.`
      }
  
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer kmdkdkmdkmd', // 👈 Replace with your real API key
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ]
        }),
      })
  
      const data = await response.json()
      console.log(data)
  
      const aiResponse = data.choices[0].message.content || 'Sorry, I did not get that.'
  
      // Replace "Thinking..." with actual AI reply
      messages.value[messages.value.length - 1].text = aiResponse
  
      // Update conversation context
      chatContext.value = aiResponse
    } catch (error) {
      console.error(error)
      messages.value[messages.value.length - 1].text = 'Error contacting AI.'
    }
  }
  </script>
  
  <style scoped>
  /* Background */
  body {
    background: linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%);
    font-family: 'Poppins', sans-serif;
  }
  
  /* Main container */
  .chat-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ffffff44;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  /* Heading */
  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }
  
  /* Chat box */
  .chat-box {
    height: 400px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 10px;
    background: #fdfdfd;
    margin-bottom: 20px;
  }
  
  /* User message */
  .user {
    text-align: right;
    margin: 12px 0;
  }
  
  /* Bot message */
  .bot {
    text-align: left;
    margin: 12px 0;
  }
  
  /* User bubble */
  .user p {
    background: #007bff;
    color: white;
    display: inline-block;
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 75%;
  }
  
  /* Bot bubble */
  .bot p, .bot div {
    background: #ececec;
    color: #333;
    display: inline-block;
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 75%;
  }
  
  /* Input area */
  .input-area {
    display: flex;
    gap: 10px;
  }
  
  input {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #bbb;
    outline: none;
  }
  
  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s;
  }
  
  button:hover {
    background: #0056b3;
  }
  
  /* Animations */
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
    opacity: 0;
  }
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  </style>
  
