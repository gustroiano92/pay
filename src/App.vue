<template>
    <div class="min-h-screen bg-gray-50 p-4">
        <!-- Header compacto -->
        <header class="mb-6 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-xl font-bold text-gray-800 ml-2">Pagamentos</h1>
                </div>
                <div class="text-sm text-gray-500">{{ formatDate(new Date()) }}</div>
            </div>
        </header>

        <!-- Resumo financeiro em scroll horizontal -->
        <div class="mb-6 overflow-x-auto pb-2">
            <div class="flex space-x-3 w-max">
                <!-- Total Devido -->
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-red-500">
                    <p class="text-xs text-gray-500">Total Devido</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(totalAmount) }}</p>
                </div>

                <!-- Total Pago -->
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-green-500">
                    <p class="text-xs text-gray-500">Total Pago</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(totalPaid) }}</p>
                </div>

                <!-- Restante -->
                <div class="bg-white rounded-lg shadow-sm p-4 w-40 flex-shrink-0 border-l-4 border-blue-500">
                    <p class="text-xs text-gray-500">Restante</p>
                    <p class="text-lg font-semibold">R$ {{ formatCurrency(remainingAmount) }}</p>
                </div>
            </div>
        </div>

        <!-- Barra de progresso -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium text-gray-500">Progresso</span>
                <span class="text-xs font-semibold text-indigo-600">{{ Math.round((totalPaid / totalAmount) * 100)
                    }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full" :style="{ width: `${(totalPaid / totalAmount) * 100}%` }">
                </div>
            </div>
        </div>

        <!-- Abas para alternar entre formulário e histórico -->
        <div class="mb-4 border-b border-gray-200">
            <nav class="flex space-x-4">
                <button @click="activeTab = 'form'"
                    :class="activeTab === 'form' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-2 px-1 border-b-2 font-medium text-sm">
                    Novo Pagamento
                </button>
                <button @click="activeTab = 'history'"
                    :class="activeTab === 'history' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-2 px-1 border-b-2 font-medium text-sm">
                    Histórico
                </button>
            </nav>
        </div>

        <!-- Formulário de pagamento -->
        <div v-if="activeTab === 'form'" class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <form @submit.prevent="addPayment" class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span class="text-gray-500 text-sm">R$</span>
                        </div>
                        <input v-model.number="newPayment.amount" type="number" min="0" step="0.01"
                            class="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0,00">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input v-model="newPayment.date" type="date"
                        class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea v-model="newPayment.notes" rows="2"
                        class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Detalhes..."></textarea>
                </div>

                <button type="submit"
                    class="w-full mt-2 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :disabled="loading">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ loading ? 'Salvando...' : 'Registrar Pagamento' }}
                </button>
            </form>
        </div>

        <!-- Histórico de pagamentos -->
        <div v-if="activeTab === 'history'">
            <!-- Filtro e busca (opcional) -->
            <div class="mb-3 flex items-center">
                <div class="relative flex-grow">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input v-model="searchQuery" type="text"
                        class="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Buscar pagamentos...">
                </div>
            </div>

            <!-- Mensagens de estado -->
            <div v-if="error" class="mb-3 p-3 bg-red-50 text-red-700 rounded-md text-xs">
                {{ error }}
            </div>

            <div v-if="payments.length === 0 && !loading" class="text-center py-8 bg-white rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento</h3>
                <p class="mt-1 text-xs text-gray-500">Registre seu primeiro pagamento</p>
            </div>

            <div v-if="loading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Lista de pagamentos -->
            <ul v-if="payments.length > 0" class="space-y-2">
                <li v-for="(payment, index) in filteredPayments" :key="index" class="bg-white rounded-lg shadow-sm p-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-gray-900">R$ {{ formatCurrency(payment.amount) }}</p>
                            <p class="text-xs text-gray-500">{{ formatDate(payment.date) }}</p>
                            <p v-if="payment.notes" class="text-xs text-gray-500 mt-1">{{ payment.notes }}</p>
                        </div>
                        <button @click="removePayment(index)" class="text-red-500 hover:text-red-700 p-1"
                            :disabled="loading">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </li>
            </ul>

            <!-- Paginação (opcional) -->
            <div v-if="filteredPayments.length > 5" class="mt-4 flex justify-between items-center">
                <button @click="currentPage--" :disabled="currentPage === 1"
                    class="px-3 py-1 text-sm text-indigo-600 disabled:text-gray-400">
                    Anterior
                </button>
                <span class="text-xs text-gray-500">Página {{ currentPage }}</span>
                <button @click="currentPage++" :disabled="currentPage * itemsPerPage >= filteredPayments.length"
                    class="px-3 py-1 text-sm text-indigo-600 disabled:text-gray-400">
                    Próxima
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'PaymentMobile',
        data() {
            return {
                activeTab: 'form',
                searchQuery: '',
                currentPage: 1,
                itemsPerPage: 5,
                totalAmount: 12000,
                payments: [],
                newPayment: {
                    amount: 0,
                    date: new Date().toISOString().substr(0, 10),
                    notes: ''
                },
                loading: false,
                error: null,
                jsonBinConfig: {
                    binId: '6823a6248a456b79669d22f7',
                    apiKey: '$2a$10$xZQfxApKSfNwdudk7E1uOePAPte9le95Oq2fEtGuAUzPInzTaX5hW'
                }
            }
        },
        computed: {
            sortedPayments() {
                return [...this.payments].sort((a, b) => new Date(b.date) - new Date(a.date))
            },
            filteredPayments() {
                let filtered = this.sortedPayments
                if (this.searchQuery) {
                    const query = this.searchQuery.toLowerCase()
                    filtered = filtered.filter(p =>
                        p.notes?.toLowerCase().includes(query) ||
                        p.amount.toString().includes(query) ||
                        this.formatDate(p.date).includes(query)
                    )
                }
                return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage)
            },
            totalPaid() {
                return this.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
            },
            remainingAmount() {
                return this.totalAmount - this.totalPaid
            }
        },
        methods: {
            async loadPayments() {
                this.loading = true
                this.error = null
                try {
                    const response = await fetch(
                        `https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}/latest`,
                        {
                            headers: {
                                'X-Master-Key': this.jsonBinConfig.apiKey,
                                'X-Bin-Meta': 'false'
                            }
                        }
                    )

                    if (!response.ok) throw new Error('Failed to load data')

                    const data = await response.json()
                    this.payments = data.payments || []
                    this.totalAmount = data.totalAmount || 12000
                } catch (err) {
                    console.error('Error loading payments:', err)
                    this.error = 'Erro ao carregar pagamentos'
                    this.payments = []
                } finally {
                    this.loading = false
                }
            },

            async savePayments() {
                this.loading = true
                try {
                    const response = await fetch(
                        `https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Master-Key': this.jsonBinConfig.apiKey
                            },
                            body: JSON.stringify({
                                payments: this.payments,
                                totalAmount: this.totalAmount,
                                lastUpdated: new Date().toISOString()
                            })
                        }
                    )

                    if (!response.ok) throw new Error('Failed to save data')
                } catch (err) {
                    console.error('Error saving payments:', err)
                    this.error = 'Erro ao salvar pagamentos'
                    throw err
                } finally {
                    this.loading = false
                }
            },

            async addPayment() {
                if (!this.newPayment.amount || this.newPayment.amount <= 0) {
                    this.error = 'Insira um valor válido'
                    return
                }

                try {
                    this.payments.push({
                        amount: parseFloat(this.newPayment.amount),
                        date: this.newPayment.date,
                        notes: this.newPayment.notes,
                        createdAt: new Date().toISOString()
                    })

                    await this.savePayments()
                    this.activeTab = 'history' // Muda para a aba de histórico após adicionar
                    this.newPayment.amount = 0
                    this.newPayment.notes = ''
                    this.error = null
                } catch (err) {
                    // Error handled in savePayments
                }
            },

            async removePayment(index) {
                if (confirm('Excluir este pagamento?')) {
                    try {
                        this.payments.splice(index, 1)
                        await this.savePayments()
                    } catch (err) {
                        // Error handled in savePayments
                    }
                }
            },

            formatCurrency(value) {
                return value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.')
            },

            formatDate(dateString) {
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
                return new Date(dateString).toLocaleDateString('pt-BR', options)
            }
        },
        async mounted() {
            await this.loadPayments()
        },
        watch: {
            searchQuery() {
                this.currentPage = 1
            }
        }
    }
</script>