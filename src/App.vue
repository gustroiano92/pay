<template>
    <!-- Seu template continua o mesmo -->
    <div class="min-h-screen bg-gray-50 p-4">
        <header class="mb-6 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h1 class="text-xl font-bold text-gray-800 ml-2">VôPay</h1>
                </div>
                <!-- formatDate(new Date()) já funciona bem aqui porque new Date() é o instante atual -->
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
                    totalAmount) * 100) : 0
                    }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-600 h-2 rounded-full"
                    :style="{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }">
                </div>
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
            <li v-for="(payment, index) in filteredPayments" :key="index"
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

        <div v-if="filteredPayments.length === 0 && !loading"
            class="text-center py-8 bg-white rounded-lg shadow-sm mb-6">
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
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 text-sm">R$</span>
                                </div>
                                <input v-model.number="newPayment.amount" type="number" min="0" step="0.01"
                                    class="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="0,00" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input v-model="newPayment.date" type="date"
                                class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea v-model="newPayment.notes" rows="2"
                                class="block w-full py-2 px-3 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Detalhes..."></textarea>
                        </div>
                        <button type="submit"
                            class="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            :disabled="loading">
                            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {{ loading ? 'Salvando...' : 'Registrar' }}
                        </button>
                    </form>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script>
    export default {
        name: 'PaymentMobile',
        data() {
            return {
                showModal: false,
                isAdmin: new URLSearchParams(window.location.search).has('admin'),
                searchQuery: '',
                currentPage: 1,
                itemsPerPage: 100,
                totalAmount: 12000,
                payments: [],
                newPayment: {
                    amount: null, // Melhor iniciar como null ou undefined para o placeholder
                    date: this.getLocalISODate(), // Usando o helper para data local
                    notes: ''
                },
                loading: false,
                error: null,
                jsonBinConfig: {
                    binId: '6823a6248a456b79669d22f7', // Seu Bin ID
                    apiKey: '$2a$10$xZQfxApKSfNwdudk7E1uOePAPte9le95Oq2fEtGuAUzPInzTaX5hW' // Sua API Key
                }
            }
        },
        computed: {
            sortedPayments() {
                return [...this.payments].sort((a, b) => {
                    const dateA = this.parseDateStringAsLocal(a.date);
                    const dateB = this.parseDateStringAsLocal(b.date);

                    // Lógica para tratar datas inválidas ou nulas na ordenação, se necessário
                    if (!dateA && dateB) return 1; // a depois de b se a.date for inválido
                    if (dateA && !dateB) return -1; // a antes de b se b.date for inválido
                    if (!dateA && !dateB) { // Se ambos inválidos, ordena por createdAt
                        const createdAtA = a.createdAt ? new Date(a.createdAt) : null;
                        const createdAtB = b.createdAt ? new Date(b.createdAt) : null;
                        if (!createdAtA && createdAtB) return 1;
                        if (createdAtA && !createdAtB) return -1;
                        if (!createdAtA && !createdAtB) return 0;
                        return createdAtB.getTime() - createdAtA.getTime(); // Descending
                    }


                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateB.getTime() - dateA.getTime(); // Ordena pela data do pagamento (mais recente primeiro)
                    }
                    // Se as datas forem iguais, ordena por createdAt (mais recente primeiro)
                    const createdAtA = new Date(a.createdAt);
                    const createdAtB = new Date(b.createdAt);
                    return createdAtB.getTime() - createdAtA.getTime();
                });
            },
            filteredPayments() {
                let list = this.sortedPayments;
                if (this.searchQuery) {
                    const q = this.searchQuery.toLowerCase();
                    list = list.filter(p =>
                        p.notes?.toLowerCase().includes(q) ||
                        p.amount.toString().includes(q) ||
                        this.formatDate(p.date).includes(q)
                    );
                }
                return list.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
            },
            totalPaid() {
                return this.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
            },
            remainingAmount() {
                return this.totalAmount - this.totalPaid;
            }
        },
        methods: {
            getLocalISODate() {
                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const day = today.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            },
            parseDateStringAsLocal(dateString) {
                if (!dateString) return null;
                if (dateString instanceof Date) return dateString;
                if (typeof dateString !== 'string') {
                    try { return new Date(dateString); } catch (e) { return null; }
                }
                // O input type="date" e o ISOString().substr() já fornecem YYYY-MM-DD
                // Esta é a forma mais confiável de parsear YYYY-MM-DD como data local
                if (dateString.includes('T')) { // Se for um ISO string completo com tempo
                    return new Date(dateString);
                }
                // Para strings "YYYY-MM-DD"
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                }
                // Fallback para outros formatos de string de data, pode ser arriscado
                try { return new Date(dateString); } catch (e) { return null; }
            },
            async loadPayments() {
                this.loading = true;
                this.error = null;
                try {
                    const res = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}/latest`, {
                        headers: {
                            'X-Master-Key': this.jsonBinConfig.apiKey,
                            'X-Bin-Meta': 'false' // Para obter apenas o conteúdo do bin
                        }
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: res.statusText }));
                        throw new Error(`Erro ${res.status}: ${errorData.message || 'Falha ao carregar pagamentos'}`);
                    }
                    const data = await res.json();
                    this.payments = data.payments || [];
                    this.totalAmount = data.totalAmount || this.totalAmount;
                } catch (e) {
                    this.error = e.message;
                    console.error("Erro ao carregar pagamentos:", e);
                } finally {
                    this.loading = false;
                }
            },
            async savePayments() {
                this.loading = true;
                this.error = null;
                try {
                    const res = await fetch(`https://api.jsonbin.io/v3/b/${this.jsonBinConfig.binId}`, {
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
                    });
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ message: res.statusText }));
                        throw new Error(`Erro ${res.status}: ${errorData.message || 'Falha ao salvar pagamentos'}`);
                    }
                } catch (e) {
                    this.error = e.message;
                    console.error("Erro ao salvar pagamentos:", e);
                    // Não lançar erro aqui para permitir que a UI continue funcionando,
                    // mas o usuário verá a mensagem de erro.
                } finally {
                    this.loading = false;
                }
            },
            async addPayment() {
                if (!this.newPayment.amount || this.newPayment.amount <= 0) {
                    // Poderia usar this.error para feedback na UI
                    alert('Insira um valor válido.');
                    return;
                }
                if (!this.newPayment.date) {
                    alert('Insira uma data válida.');
                    return;
                }

                this.payments.push({
                    amount: parseFloat(this.newPayment.amount),
                    date: this.newPayment.date, // Já está no formato YYYY-MM-DD
                    notes: this.newPayment.notes,
                    createdAt: new Date().toISOString()
                });

                try {
                    await this.savePayments();
                    // Só limpa o formulário e fecha o modal se salvar com sucesso
                    if (!this.error) {
                        this.showModal = false;
                        this.newPayment.amount = null;
                        this.newPayment.date = this.getLocalISODate(); // Reseta para data atual
                        this.newPayment.notes = '';
                    }
                } catch (e) {
                    // O erro já foi tratado em savePayments e this.error já está setado.
                    // Podemos remover o pagamento adicionado localmente se o save falhar.
                    this.payments.pop(); // Remove o último adicionado se save falhou
                }
            },
            async removePayment(indexInFiltered) {
                // Precisamos encontrar o índice correto no array `payments` original,
                // pois `filteredPayments` pode ser uma sublista ordenada.
                const paymentToRemove = this.filteredPayments[indexInFiltered];
                const originalIndex = this.payments.findIndex(p =>
                    p.createdAt === paymentToRemove.createdAt && p.amount === paymentToRemove.amount && p.date === paymentToRemove.date
                );

                if (originalIndex === -1) {
                    alert("Erro: Pagamento não encontrado para remoção.");
                    return;
                }

                if (confirm('Excluir este pagamento?')) {
                    this.payments.splice(originalIndex, 1);
                    await this.savePayments();
                }
            },
            formatCurrency(value) {
                if (typeof value !== 'number') value = 0;
                return value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
            },
            formatDate(dateInput) {
                if (!dateInput) return '-';

                const dateObj = this.parseDateStringAsLocal(dateInput);

                if (!dateObj || isNaN(dateObj.getTime())) {
                    console.warn("formatDate recebeu data inválida:", dateInput);
                    return '-';
                }

                return new Intl.DateTimeFormat('pt-BR', {
                    timeZone: 'America/Sao_Paulo', // Importante para consistência
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(dateObj);
            }
        },
        async mounted() {
            await this.loadPayments();
            // Garante que a data default do modal seja a data local atual se não houver uma já definida
            if (!this.newPayment.date) {
                this.newPayment.date = this.getLocalISODate();
            }
        },
        watch: {
            searchQuery() {
                this.currentPage = 1;
            }
        }
    }
</script>