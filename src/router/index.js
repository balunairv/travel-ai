import { createRouter, createWebHistory } from 'vue-router'
// import FormPage from '../pages/formPage.vue'
// import ChatPage from '../pages/chatPage.vue'
import Chat from '../pages/chat.vue'

const routes = [
  { path: '/', component: Chat },
  // { path: '/chat', component: FormPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
