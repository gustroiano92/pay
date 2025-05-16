// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { pt } from 'vuetify/locale'
import { ptBR } from 'date-fns/locale'

import { aliases, mdi } from 'vuetify/iconsets/mdi'

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/:id?', // Rota que aceita um parâmetro id opcional
        component: App,
        props: (route) => ({ id: route.params.id }) // Passa o id como prop para o componente
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const vuetify = createVuetify({
    components,
    directives,
    locale: {
        locale: 'pt',
        fallback: 'en',
        messages: { pt }
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi }
    },
    defaults: {
        global: {
            date: { locale: ptBR }
        }
    }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')