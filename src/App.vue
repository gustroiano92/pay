<template>
    <div class="min-h-screen bg-gray-50 p-4" v-if="!showSetup">
        <header class="mb-6 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-xl font-bold text-gray-800 ml-2">{{ title || '...' }}</h1>
                </div>
                <div class="text-sm text-gray-500">{{ formatDate(new Date()) }}</div>
            </div>
        </header>

        <div class="mb-6 overflow-x-auto pb-2">
            <div class="flex space-x-3 w-max">
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-red-500">
                    <p class="text-xs text-gray-500">Total Devido</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(totalAmount) }}</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-green-500">
                    <p class="text-xs text-gray-500">Total Pago</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(totalPaid) }}</p>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-blue-500">
                    <p class="text-xs text-gray-500">Restante</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(remainingAmount) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium text-gray-500">Progresso</span>
                <span class="text-xs font-semibold text-indigo-600">{{ totalAmount > 0 ? Math.round((totalPaid /
                    totalAmount) * 100) : 0 }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full"
                    :style="{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }"></div>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-700">Histórico</h2>
            <button v-if="isAdmin" @click="showModal = true"
                class="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none">
                Novo Pagamento
            </button>
        </div>

        <ul v-if="payments.length > 0" class="space-y-2 mb-6">
            <li v-for="(payment, index) in payments" :key="index"
                class="bg-white rounded-lg shadow-sm p-3 flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-900">R$ {{ formatCurrency(payment.amount) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(payment.date) }}</p>
                    <p v-if="payment.notes" class="text-xs text-gray-500 mt-1">{{ payment.notes }}</p>
                </div>
                <button v-if="isAdmin" @click="removePayment(index)" class="text-red-500 hover:text-red-700 p-1"
                    :disabled="loading">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </li>
        </ul>

        <div v-if="payments.length === 0 && !loading" class="text-center py-8 bg-white rounded-lg shadow-sm mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento</h3>
            <p class="mt-1 text-xs text-gray-500">Registre seu primeiro pagamento</p>
        </div>

        <teleport to="body">
            <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50">
                <div class="absolute inset-0 bg-black opacity-50"></div>
                <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto relative p-6">
                    <button @click="showModal = false" class="absolute top-3 right-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-gray-700"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <form @submit.prevent="addPayment" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <input v-model.number="newPayment.amount" type="number" min="0" step="0.01"
                                class="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md"
                                placeholder="0,00" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input v-model="newPayment.date" type="date"
                                class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea v-model="newPayment.notes" rows="2"
                                class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md"
                                placeholder="Detalhes..."></textarea>
                        </div>
                        <button type="submit"
                            class="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600"
                            :disabled="loading">
                            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {{ loading ? 'Salvando...' : 'Registrar' }}
                        </button>
                    </form>
                </div>
            </div>
        </teleport>
    </div>

    <teleport to="body">
        <div v-if="showSetup" class="fixed inset-0 flex items-center justify-center z-50">
            <div class="absolute inset-0 bg-black opacity-50"></div>
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto relative p-6">
                <form @submit.prevent="createBlobWithData" class="space-y-4">
                    <h2 class="text-lg font-semibold text-gray-800 mb-2">Criar novo controle</h2>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input v-model="setup.title" type="text" required
                            class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md"
                            placeholder="Ex: Pagamento do Vô" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Valor Total Devido</label>
                        <input v-model.number="setup.totalAmount" type="number" required min="1" step="0.01"
                            class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md" placeholder="Ex: 12000" />
                    </div>
                    <button type="submit"
                        class="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        :disabled="loading">
                        {{ loading ? 'Criando...' : 'Criar' }}
                    </button>
                </form>
            </div>
        </div>
    </teleport>
</template>


<script>
    export default {
        data() {
            return {
                payments: [],
                totalAmount: 0,
                title: '',
                newPayment: { amount: null, date: '', notes: '' },
                loading: false,
                showModal: false,
                showSetup: false,
                jsonBlobId: '',
                isAdmin: new URLSearchParams(window.location.search).has('admin'),
                apiKey: 'YOUR_API_KEY',
                setup: {
                    title: '',
                    totalAmount: null
                }
            }
        },
        computed: {
            totalPaid() {
                return this.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
            },
            remainingAmount() {
                return this.totalAmount - this.totalPaid
            }
        },
        methods: {
            async createBlobWithData() {
                this.loading = true
                const res = await fetch('https://jsonblob.com/api/jsonBlob', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
                    body: JSON.stringify({
                        title: this.setup.title,
                        totalAmount: this.setup.totalAmount,
                        payments: []
                    })
                })
                const location = res.headers.get('Location')
                const id = location?.split('/').pop()
                if (id) {
                    const url = new URL(window.location.href)
                    url.searchParams.set('id', id)
                    url.searchParams.delete('add')
                    window.history.replaceState({}, '', url.toString())
                    this.jsonBlobId = id
                    this.title = this.setup.title
                    this.totalAmount = this.setup.totalAmount
                    this.showSetup = false
                }
                this.loading = false
            },
            async loadPayments() {
                if (!this.jsonBlobId) return
                this.loading = true
                const res = await fetch(`https://jsonblob.com/api/jsonBlob/${this.jsonBlobId}`, {
                    headers: { 'X-API-Key': this.apiKey }
                })
                const data = await res.json()
                this.payments = data.payments || []
                this.totalAmount = data.totalAmount || 0
                this.title = data.title || 'Controle'
                this.loading = false
            },
            async savePayments() {
                if (!this.jsonBlobId) return
                this.loading = true
                await fetch(`https://jsonblob.com/api/jsonBlob/${this.jsonBlobId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': this.apiKey },
                    body: JSON.stringify({ payments: this.payments, totalAmount: this.totalAmount, title: this.title })
                })
                this.loading = false
            },
            async addPayment() {
                if (!this.newPayment.amount || !this.newPayment.date) return
                this.payments.push({ ...this.newPayment, createdAt: new Date().toISOString() })
                await this.savePayments()
                this.newPayment = { amount: null, date: this.getLocalDate(), notes: '' }
                this.showModal = false
            },
            async removePayment(index) {
                if (!confirm('Excluir pagamento?')) return
                this.payments.splice(index, 1)
                await this.savePayments()
            },
            formatCurrency(value) {
                return (value || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            },
            formatDate(date) {
                const d = new Date(date)
                return d.toLocaleDateString('pt-BR')
            },
            getLocalDate() {
                const d = new Date()
                return d.toISOString().split('T')[0]
            }
        },
        async mounted() {
            const url = new URL(window.location.href)
            const params = url.searchParams
            if (params.has('add')) {
                this.showSetup = true
            } else if (params.has('id')) {
                this.jsonBlobId = params.get('id')
                await this.loadPayments()
            }
            this.newPayment.date = this.getLocalDate()
        }
    }
</script>