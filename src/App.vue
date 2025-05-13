<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <header class="mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mr-3 text-indigo-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Controle Financeiro
                </h1>
                <p class="text-gray-600 mt-2">Acompanhe seus pagamentos e recebimentos</p>
            </header>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Total Devido -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-500">Total Devido</p>
                                <p class="text-2xl font-semibold text-gray-800">R$ {{ formatCurrency(totalAmount) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Pago -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-500">Total Pago</p>
                                <p class="text-2xl font-semibold text-gray-800">R$ {{ formatCurrency(totalPaid) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Restante -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-500">Restante</p>
                                <p class="text-2xl font-semibold text-gray-800">R$ {{ formatCurrency(remainingAmount) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="bg-white rounded-xl shadow-md p-6 mb-8">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-500">Progresso de pagamentos</span>
                    <span class="text-sm font-semibold text-indigo-600">{{ Math.round((totalPaid / totalAmount) * 100)
                    }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full"
                        :style="{ width: `${(totalPaid / totalAmount) * 100}%` }"></div>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Add Payment Form -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-indigo-600 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Novo Pagamento
                        </h2>
                    </div>
                    <div class="p-6">
                        <form @submit.prevent="addPayment" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                <div class="relative rounded-md shadow-sm">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span class="text-gray-500 sm:text-sm">R$</span>
                                    </div>
                                    <input v-model.number="newPayment.amount" type="number" min="0" step="0.01"
                                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0,00">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <input v-model="newPayment.date" type="date"
                                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full py-3 sm:text-sm border-gray-300 rounded-md">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                <textarea v-model="newPayment.notes" rows="3"
                                    class="focus:ring-indigo-500 focus:border-indigo-500 block w-full py-3 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Detalhes do pagamento..."></textarea>
                            </div>

                            <div class="pt-2">
                                <button type="submit"
                                    class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    :disabled="loading">
                                    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    {{ loading ? 'Processando...' : 'Registrar Pagamento' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Payment History -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="bg-indigo-600 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Histórico
                        </h2>
                    </div>
                    <div class="p-6">
                        <!-- Error Message -->
                        <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm">
                            {{ error }}
                        </div>

                        <!-- Empty State -->
                        <div v-if="payments.length === 0 && !loading" class="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento registrado</h3>
                            <p class="mt-1 text-sm text-gray-500">Adicione seu primeiro pagamento usando o formulário ao
                                lado.</p>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loading" class="flex justify-center py-8">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>

                        <!-- Payment List -->
                        <ul v-if="payments.length > 0" class="divide-y divide-gray-200">
                            <li v-for="(payment, index) in sortedPayments" :key="index" class="py-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div
                                            class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div class="ml-4">
                                            <p class="text-sm font-medium text-gray-900">R$ {{
                                                formatCurrency(payment.amount) }}</p>
                                            <p class="text-sm text-gray-500">{{ formatDate(payment.date) }}</p>
                                            <p v-if="payment.notes" class="text-xs text-gray-500 mt-1">{{ payment.notes
                                            }}</p>
                                        </div>
                                    </div>
                                    <button @click="removePayment(index)" class="text-red-600 hover:text-red-900"
                                        :disabled="loading">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'PaymentDashboard',
        data() {
            return {
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
            totalPaid() {
                return this.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
            },
            remainingAmount() {
                return this.totalAmount - this.totalPaid
            }
        },
        methods: {
            async loadPayments() {
                this.loading = true;
                this.error = null;
                try {
                    const response = await fetch(
                        `https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}/latest`,
                        {
                            headers: {
                                'X-Master-Key': this.jsonBinConfig.apiKey,
                                'X-Bin-Meta': 'false'
                            }
                        }
                    );

                    if (!response.ok) throw new Error('Failed to load data');

                    const data = await response.json();
                    this.payments = data.payments || [];
                    this.totalAmount = data.totalAmount || 12000;
                } catch (err) {
                    console.error('Error loading payments:', err);
                    this.error = 'Erro ao carregar pagamentos. Por favor, tente novamente.';
                    this.payments = [];
                } finally {
                    this.loading = false;
                }
            },

            async savePayments() {
                this.loading = true;
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
                    );

                    if (!response.ok) throw new Error('Failed to save data');
                } catch (err) {
                    console.error('Error saving payments:', err);
                    this.error = 'Erro ao salvar pagamentos. Por favor, tente novamente.';
                    throw err;
                } finally {
                    this.loading = false;
                }
            },

            async addPayment() {
                if (!this.newPayment.amount || this.newPayment.amount <= 0) {
                    this.error = 'Por favor, insira um valor de pagamento válido';
                    return;
                }

                try {
                    this.payments.push({
                        amount: parseFloat(this.newPayment.amount),
                        date: this.newPayment.date,
                        notes: this.newPayment.notes,
                        createdAt: new Date().toISOString()
                    });

                    await this.savePayments();

                    // Reset form
                    this.newPayment.amount = 0;
                    this.newPayment.notes = '';
                    this.error = null;
                } catch (err) {
                    // Error already handled in savePayments
                }
            },

            async removePayment(index) {
                if (confirm('Tem certeza que deseja excluir este pagamento?')) {
                    try {
                        this.payments.splice(index, 1);
                        await this.savePayments();
                    } catch (err) {
                        // Error already handled in savePayments
                    }
                }
            },

            formatCurrency(value) {
                return value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
            },

            formatDate(dateString) {
                const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
                return new Date(dateString).toLocaleDateString('pt-BR', options);
            }
        },
        async mounted() {
            await this.loadPayments();
        }
    }
</script>