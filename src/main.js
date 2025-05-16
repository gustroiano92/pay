import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import {
    VApp,
    VToolbar,
    VToolbarTitle,
    VSpacer,
    VBtn,
    VMain,
    VContainer,
    VRow,
    VCol,
    VCard,
    VCardItem,
    VAvatar,
    VIcon,
    VCardTitle,
    VCardText,
    VCardSubtitle,
    VSkeletonLoader,
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelTitle,
    VExpansionPanelText,
    VChip,
    VList,
    VListItem,
    VDivider,
    VFab,
    VSnackbar,
    VDialog,
    VCardActions,
    VForm,
    VTextField,
    VMenu,
    VDatePicker,
    VTextarea
} from 'vuetify/components'

import { pt } from 'vuetify/locale'
import { ptBR } from 'date-fns/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/:id?',
        component: App,
        props: route => ({ id: route.params.id })
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const vuetify = createVuetify({
    components: {
        VApp,
        VToolbar,
        VToolbarTitle,
        VSpacer,
        VBtn,
        VMain,
        VContainer,
        VRow,
        VCol,
        VCard,
        VCardItem,
        VAvatar,
        VIcon,
        VCardTitle,
        VCardText,
        VCardSubtitle,
        VSkeletonLoader,
        VExpansionPanels,
        VExpansionPanel,
        VExpansionPanelTitle,
        VExpansionPanelText,
        VChip,
        VList,
        VListItem,
        VDivider,
        VFab,
        VSnackbar,
        VDialog,
        VCardActions,
        VForm,
        VTextField,
        VMenu,
        VDatePicker,
        VTextarea
    },
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

createApp(App)
    .use(vuetify)
    .use(router)
    .mount('#app')