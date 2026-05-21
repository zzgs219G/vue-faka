import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/front/Index.vue'
import Admin from '../views/admin/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Index
  },
  {
    path: '/admin.html', // Keep old path for compatibility or redirect
    redirect: '/admin'
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundOrCategory',
    component: Index
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
