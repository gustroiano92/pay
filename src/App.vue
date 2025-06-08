<template>
    <v-app>
        <v-toolbar flat density="comfortable" class="bg-white" elevation="1">

            <v-toolbar-title class="text-h6 font-weight-light text-grey-darken-3">
                {{ title || 'Pay' }}
            </v-toolbar-title>
            <v-spacer />
            <v-btn size="small" v-if="!isAuthenticated" icon="mdi-lock-outline" variant="text" color="primary"
                @click="showLoginDialog = true" />
            <v-btn size="small" v-if="isAuthenticated" icon="mdi-cog" variant="text" color="primary"
                @click="showSettingsDialog = true" />
        </v-toolbar>


        <v-main class="bg-grey-lighten-5">
            <v-container fluid class="pa-6 pa-md-8">
                <!-- Summary Section -->
                <v-row class="mb-8">
                    <v-col v-for="item in summaryItems" :key="item.label" cols="12" sm="6" md="3">
                        <v-card flat rounded="lg" class="pa-2" elevation="2">
                            <v-card-item>
                                <v-row align="center" no-gutters>
                                    <v-col cols="auto" class="mr-3">
                                        <v-avatar size="40" rounded="md" :color="`${item.color}-lighten-4`">
                                            <v-icon :icon="item.icon" :color="item.color" size="24" />
                                        </v-avatar>
                                    </v-col>
                                    <v-col>
                                        <v-card-title class="text-subtitle-1 font-weight-medium text-grey-darken-3">
                                            {{ item.label }}
                                        </v-card-title>
                                        <v-card-text class="pa-0">
                                            <div :class="`text-h6 font-weight-bold text-${item.color}-darken-2`">
                                                {{ item.value }}
                                            </div>
                                            <div class="text-caption text-grey-darken-1">{{ item.subLabel }}</div>
                                        </v-card-text>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Transaction History Section -->
                <section>
                    <div class="d-flex align-center mb-6">
                        <v-icon start icon="mdi-history" color="primary" size="24" />
                        <h2 class="text-h5 font-weight-medium text-primary ml-2">
                            Histórico de Transações
                        </h2>
                    </div>

                    <v-skeleton-loader v-if="loading" type="list-item-avatar-two-line@5" class="mb-6 bg-white"
                        rounded="lg" />

                    <v-card v-else-if="payments.length === 0" flat rounded="lg" class="text-center py-12" elevation="2">
                        <v-icon icon="mdi-archive-alert-outline" size="64" color="blue-grey-lighten-1" />
                        <v-card-text class="text-h6 text-blue-grey-darken-2 font-weight-regular mt-4">
                            Nenhuma transação encontrada.
                        </v-card-text>
                        <v-card-subtitle class="text-body-2 text-blue-grey-darken-1">
                            Adicione sua primeira transação com <v-icon size="small">mdi-plus-circle-outline</v-icon>.
                        </v-card-subtitle>
                    </v-card>

                    <v-expansion-panels v-else v-model="activePanel" variant="accordion" flat>
                        <v-expansion-panel v-for="([month, group], idx) in sortedGroupedPayments" :key="month"
                            :value="idx" class="my-2" elevation="2" rounded="lg">
                            <v-expansion-panel-title class="bg-grey-lighten-4">
                                <v-container fluid class="pa-0">
                                    <v-row align="center" no-gutters>
                                        <v-col cols="4" class="text-subtitle-1 font-weight-medium">
                                            {{ month }}
                                        </v-col>
                                        <v-col cols="4" class="text-center text-body-2">
                                            {{ group.items.length }} transaç{{ group.items.length === 1 ? 'ão' : 'ões'
                                            }}
                                        </v-col>
                                        <v-col cols="4" class="text-right">
                                            <v-chip label color="primary" variant="outlined" size="small"
                                                class="font-weight-bold">
                                                {{ formatCurrency(group.total) }}
                                            </v-chip>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-card flat class="pa-2">
                                    <v-list density="compact">
                                        <template v-for="(p, idx) in group.items" :key="p.id">
                                            <v-list-item class="py-3">


                                                <template #title>
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="text-subtitle-1 font-weight-medium">{{
                                                            p.formattedAmount }}</span>
                                                        <v-btn v-if="isAuthenticated" icon="mdi-trash-can-outline"
                                                            color="error" variant="text" size="small"
                                                            @click.stop="confirmRemovePayment(p)" />
                                                    </div>
                                                </template>

                                                <template #subtitle>
                                                    <div class="d-flex flex-column">
                                                        <span class="text-caption text--secondary">{{ p.formattedDate
                                                            }}</span>
                                                        <span v-if="p.notes"
                                                            class="text-caption mt-1 text--primary d-flex align-center">
                                                            <v-chip label append-icon="mdi-alert-circle-outline"
                                                                variant="outlined" size="x-small">
                                                                {{ p.notes }}</v-chip>
                                                        </span>
                                                    </div>
                                                </template>
                                            </v-list-item>

                                            <v-divider v-if="idx < group.items.length - 1" class="mx-4 my-2"
                                                thickness="1" />
                                        </template>
                                    </v-list>
                                </v-card>
                            </v-expansion-panel-text>


                        </v-expansion-panel>
                    </v-expansion-panels>
                </section>
            </v-container>

            <!-- Floating Action Button -->
            <v-fab v-if="isAuthenticated" icon="mdi-plus" color="primary" size="large" class="mr-6 mb-6"
                location="bottom end" fixed app elevation="4" @click="showModal = true" />

            <!-- Snackbar -->
            <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top" variant="flat"
                rounded="pill" elevation="4">
                <v-icon start class="mr-2"
                    :icon="snackbar.icon || (snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle')" />
                <span class="font-weight-medium">{{ snackbar.message }}</span>
                <template #actions>
                    <v-btn variant="text" @click="snackbar.show = false" class="text-none">Fechar</v-btn>
                </template>
            </v-snackbar>

            <!-- New Transaction Dialog -->
            <v-dialog v-model="showModal" max-width="520" persistent scrollable>
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-primary-lighten-5">
                        <v-icon start color="primary" class="mr-2">mdi-plus-circle-outline</v-icon>
                        <span class="text-h6 font-weight-medium text-primary">Nova Transação</span>
                        <v-spacer />
                        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="cancelNewPayment" />
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6">
                        <v-form ref="form" v-model="formValid" @submit.prevent="addPayment">
                            <v-text-field v-model.number="newPayment.amount" label="Valor da Transação" prefix="R$"
                                type="number"
                                :rules="[v => !!v || 'Valor é obrigatório', v => v > 0 || 'Valor deve ser positivo']"
                                required variant="outlined" density="compact" class="mb-4"
                                prepend-inner-icon="mdi-currency-brl" />
                            <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition">
                                <template #activator="{ props }">
                                    <v-text-field v-model="newPayment.date" label="Data da Transação" readonly
                                        v-bind="props" :rules="[v => !!v || 'Data é obrigatória']" variant="outlined"
                                        density="compact" class="mb-4" append-inner-icon="mdi-calendar" />
                                </template>
                                <v-date-picker v-model="newPayment.date" locale="pt-br" color="primary" elevation="2"
                                    @update:model-value="dateMenu = false" />
                            </v-menu>
                            <v-textarea v-model="newPayment.notes" label="Detalhes (Opcional)" variant="outlined"
                                density="compact" rows="3" auto-grow prepend-inner-icon="mdi-information-outline"
                                counter="100" />
                        </v-form>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                        <v-btn variant="text" @click="cancelNewPayment" class="text-none">Cancelar</v-btn>
                        <v-spacer />
                        <v-btn color="primary" :loading="loading" :disabled="!formValid" @click="addPayment"
                            variant="flat" class="text-none px-6" min-width="120">
                            Adicionar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Setup Dialog -->
            <v-dialog v-model="showSetup" persistent max-width="520">
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-primary-lighten-5">
                        <v-icon start color="primary" class="mr-2">mdi-cogs</v-icon>
                        <span class="text-h6 font-weight-medium text-primary">Configuração Inicial</span>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6">
                        <p class="text-body-2 text-grey-darken-1 mb-5">
                            Informe um nome para seu controle financeiro e o valor total que será gerenciado.
                        </p>
                        <v-form ref="setupForm" v-model="setupFormValid">
                            <v-text-field v-model="setup.title" label="Nome do Controle"
                                :rules="[v => !!v || 'Nome é obrigatório']" required variant="outlined"
                                density="compact" class="mb-4" prepend-inner-icon="mdi-label-outline" />
                            <v-text-field v-model.number="setup.totalAmount" label="Saldo Inicial / Valor Total"
                                prefix="R$" type="number"
                                :rules="[v => v !== null && v !== '' || 'Valor é obrigatório', v => v >= 0 || 'Valor não pode ser negativo']"
                                required variant="outlined" density="compact" prepend-inner-icon="mdi-currency-brl" />
                        </v-form>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                        <v-spacer />
                        <v-btn color="primary" :loading="loading" :disabled="!setupFormValid" @click="createBlob"
                            variant="flat" class="text-none px-6" min-width="120">
                            Iniciar Controle
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Confirm Remove Dialog -->
            <v-dialog v-model="showConfirmRemove" max-width="480">
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-error-lighten-5">
                        <v-icon start color="error" class="mr-2">mdi-alert-octagon-outline</v-icon>
                        <span class="text-h6 font-weight-medium text-error-darken-2">Confirmar Remoção</span>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6 text-body-1 text-blue-grey-darken-3">
                        <p class="mb-1">
                            Remover a transação de
                            <strong class="text-error-darken-1">{{ confirmPayment?.formattedAmount }}</strong>
                        </p>
                        <p>referente a <span class="font-weight-medium">{{ confirmPayment?.formattedDate }}</span>?</p>
                        <p class="text-caption text-grey-darken-1 mt-4">Esta ação é irreversível.</p>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                        <v-btn variant="text" @click="showConfirmRemove = false" class="text-none">Cancelar</v-btn>
                        <v-spacer />
                        <v-btn color="error" :loading="loading" @click="executeRemovePayment" variant="flat"
                            class="text-none px-6" min-width="120">
                            Remover
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Confirm Delete Bin Dialog -->
            <v-dialog v-model="showConfirmDeleteBin" max-width="480">
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-error-lighten-5">
                        <v-icon start color="error" class="mr-2">mdi-alert-decagram-outline</v-icon>
                        <span class="text-h6 font-weight-medium text-error-darken-2">Exclusão Definitiva</span>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6 text-body-1 text-blue-grey-darken-3">
                        <p>Confirmar a exclusão de <strong class="text-error-darken-1">TODOS OS DADOS</strong> deste
                            controle?</p>
                        <p class="text-caption text-grey-darken-1 mt-4">Esta ação apagará todas as transações e
                            configurações permanentemente.</p>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                        <v-btn variant="text" @click="showConfirmDeleteBin = false" class="text-none">Cancelar</v-btn>
                        <v-spacer />
                        <v-btn color="error" :loading="loading" @click="executeDeleteBin" variant="flat"
                            class="text-none px-6" min-width="120">
                            Excluir Tudo
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Settings Dialog -->
            <v-dialog v-model="showSettingsDialog" max-width="480">
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-primary-lighten-5">
                        <v-icon start color="primary" class="mr-2">mdi-cog</v-icon>
                        <span class="text-h6 font-weight-medium text-primary">Configurações</span>
                        <v-spacer />
                        <v-btn icon="mdi-close" variant="text" density="comfortable"
                            @click="showSettingsDialog = false" />
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6">
                        <v-btn color="error" variant="flat" class="text-none px-6" min-width="120"
                            @click="confirmDeleteBin">
                            Excluir Tudo
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <!-- Login Dialog -->
            <v-dialog v-model="showLoginDialog" max-width="400" persistent>
                <v-card flat rounded="lg" elevation="2">
                    <v-card-title class="d-flex align-center pa-4 bg-primary-lighten-5">
                        <v-icon start color="primary" class="mr-2">mdi-lock-outline</v-icon>
                        <span class="text-h6 font-weight-medium text-primary">Login Administrativo</span>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pt-6">
                        <v-form ref="loginForm" v-model="loginFormValid" @submit.prevent="handleLogin">
                            <v-text-field v-model="loginPassword" label="Senha" type="password"
                                :rules="[v => !!v || 'Senha é obrigatória']" required variant="outlined"
                                density="compact" prepend-inner-icon="mdi-key" />
                        </v-form>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                        <v-btn variant="text" @click="showLoginDialog = false" class="text-none">Cancelar</v-btn>
                        <v-spacer />
                        <v-btn color="primary" :disabled="!loginFormValid" @click="handleLogin" variant="flat"
                            class="text-none px-6" min-width="120">
                            Entrar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-main>
    </v-app>
</template>

<script>
    import { ref, reactive, computed, watch } from 'vue';
    import { v4 as uuidv4 } from 'uuid';
    import { useRoute, useRouter } from 'vue-router';

    export default {
        setup() {
            const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
            const JSONBIN_MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;

            const route = useRoute();
            const router = useRouter();

            const jsonBinId = computed(() => route.params.id);

            const payments = ref([]);
            const totalAmount = ref(0);
            const title = ref('');
            const newPayment = reactive({ amount: null, date: '', notes: '' });
            const loading = ref(false);
            const showModal = ref(false);
            const showSetup = ref(false);
            const showConfirmRemove = ref(false);
            const showConfirmDeleteBin = ref(false);
            const confirmPayment = ref(null);
            const setup = reactive({ title: '', totalAmount: null });
            const dateMenu = ref(false);
            const setupForm = ref(null);
            const form = ref(null);
            const formValid = ref(false);
            const setupFormValid = ref(false);
            const snackbar = reactive({ show: false, message: '', color: 'success' });
            const activePanel = ref(null);
            const isAuthenticated = ref(false);
            const showLoginDialog = ref(false);
            const loginPassword = ref('');
            const loginForm = ref(null);
            const loginFormValid = ref(false);
            const showSettingsDialog = ref(false);
            let lastSavedData = '';

            // Computed properties
            const totalPaid = computed(() => payments.value.reduce((sum, p) => sum + p.amount, 0));
            const percentPaid = computed(() =>
                totalAmount.value > 0 ? Math.round((totalPaid.value / totalAmount.value) * 100) : 0
            );
            const summaryItems = computed(() => [
                {
                    label: 'Devido',
                    value: formatCurrency(totalAmount.value),
                    icon: 'mdi-cash-multiple',
                    color: 'primary',
                },
                { label: 'Pago', value: formatCurrency(totalPaid.value), icon: 'mdi-check-circle', color: 'success' },
                {
                    label: 'Falta',
                    value: formatCurrency(totalAmount.value - totalPaid.value),
                    icon: 'mdi-trending-down',
                    color: 'warning',
                    showProgress: true,
                },
            ]);

            const groupedPayments = computed(() =>
                payments.value.reduce((acc, p) => {
                    const month = new Date(p.date).toLocaleDateString('pt-BR', { month: 'numeric', year: 'numeric' });
                    if (!acc[month]) acc[month] = { total: 0, items: [] };
                    acc[month].total += p.amount;
                    acc[month].items.push({
                        ...p,
                        formattedAmount: formatCurrency(p.amount),
                        formattedDate: formatDate(p.date),
                        notes: p.notes,
                    });
                    return acc;
                }, {})
            );

            const sortedGroupedPayments = computed(() => {
                return Object.entries(groupedPayments.value)
                    .map(([month, group]) => {
                        const [mes, ano] = month.split('/');
                        const monthNumber = getMonthNumber(mes);
                        const date = new Date(`${ano}-${monthNumber}-01`);
                        const sortedItems = [...group.items].sort((a, b) => new Date(b.date) - new Date(a.date));
                        return [date, { ...group, items: sortedItems, label: month }];
                    })
                    .sort((a, b) => b[0] - a[0])
                    .map(([_date, group]) => [group.label, group]);
            });

            function getMonthNumber(mes) {
                const month = parseInt(mes, 10).toString().padStart(2, '0');
                return month;
            }

            function formatCurrency(value) {
                return `R$ ${value?.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
            }

            function formatDate(date) {
                return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }

            function handleLogin() {
                if (!loginFormValid.value) return;
                if (loginPassword.value === 'Ever2208') {
                    isAuthenticated.value = true;
                    showLoginDialog.value = false;
                    loginPassword.value = '';
                    snackbar.message = 'Autenticação bem-sucedida';
                    snackbar.color = 'success';
                    snackbar.show = true;
                } else {
                    snackbar.message = 'Senha incorreta';
                    snackbar.color = 'error';
                    snackbar.show = true;
                }
            }

            async function createBlob() {
                if (!setupFormValid.value) return;
                loading.value = true;
                try {
                    const res = await fetch(JSONBIN_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': JSONBIN_MASTER_KEY,
                            'X-Bin-Private': 'true',
                        },
                        body: JSON.stringify({ title: setup.title, totalAmount: setup.totalAmount, payments: [] }),
                    });
                    const data = await res.json();

                    router.replace({ path: `/${data.metadata.id}` });

                    title.value = setup.title;
                    totalAmount.value = setup.totalAmount;
                    showSetup.value = false;
                    await loadData();
                } finally {
                    loading.value = false;
                }
            }

            async function loadData() {
                if (!jsonBinId.value) return;
                loading.value = true;
                try {
                    const res = await fetch(`${JSONBIN_API_URL}/${jsonBinId.value}/latest`, {
                        headers: { 'X-Master-Key': JSONBIN_MASTER_KEY },
                    });
                    const data = await res.json();
                    const record = data.record;
                    payments.value =
                        record.payments?.map((p) => ({
                            id: p.id || uuidv4(),
                            amount: parseFloat(p.amount),
                            date: p.date,
                            notes: p.notes,
                        })) || [];
                    totalAmount.value = record.totalAmount || 0;
                    title.value = record.title || '';
                } finally {
                    loading.value = false;
                }
            }

            async function saveData() {
                if (!jsonBinId.value) return;
                const currentData = JSON.stringify({
                    payments: payments.value,
                    totalAmount: totalAmount.value,
                    title: title.value,
                });
                if (currentData === lastSavedData) return;
                loading.value = true;
                try {
                    await fetch(`${JSONBIN_API_URL}/${jsonBinId.value}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': JSONBIN_MASTER_KEY,
                        },
                        body: currentData,
                    });
                    lastSavedData = currentData;
                } finally {
                    loading.value = false;
                }
            }

            async function addPayment() {
                if (!formValid.value || !isAuthenticated.value) return;
                loading.value = true;
                try {
                    payments.value.push({
                        id: uuidv4(),
                        amount: newPayment.amount,
                        date: newPayment.date,
                        notes: newPayment.notes,
                    });
                    await saveData();
                    newPayment.amount = null;
                    newPayment.date = '';
                    newPayment.notes = '';
                    showModal.value = false;
                    snackbar.message = 'Pagamento adicionado com sucesso';
                    snackbar.color = 'success';
                    snackbar.show = true;
                } finally {
                    loading.value = false;
                }
            }

            function confirmRemovePayment(payment) {
                if (!isAuthenticated.value) return;
                confirmPayment.value = payment;
                showConfirmRemove.value = true;
            }

            async function executeRemovePayment() {
                if (!confirmPayment.value || !isAuthenticated.value) return;
                loading.value = true;
                try {
                    const index = payments.value.findIndex((p) => p.id === confirmPayment.value.id);
                    if (index !== -1) payments.value.splice(index, 1);
                    await saveData();
                    snackbar.message = 'Pagamento removido com sucesso';
                    snackbar.color = 'success';
                    snackbar.show = true;
                } finally {
                    loading.value = false;
                    showConfirmRemove.value = false;
                    confirmPayment.value = null;
                }
            }

            function cancelNewPayment() {
                newPayment.amount = null;
                newPayment.date = '';
                newPayment.notes = '';
                showModal.value = false;
                form.value?.resetValidation();
            }

            function confirmDeleteBin() {
                if (!isAuthenticated.value) return;
                showConfirmDeleteBin.value = true;
            }

            async function executeDeleteBin() {
                if (!jsonBinId.value || !isAuthenticated.value) return;
                loading.value = true;
                try {
                    await fetch(`${JSONBIN_API_URL}/${jsonBinId.value}`, {
                        method: 'DELETE',
                        headers: { 'X-Master-Key': JSONBIN_MASTER_KEY },
                    });

                    router.replace({ path: '/' });

                    payments.value = [];
                    totalAmount.value = 0;
                    title.value = '';
                    showSetup.value = true;
                    snackbar.message = 'Bin excluído com sucesso';
                    snackbar.color = 'success';
                    snackbar.show = true;
                } finally {
                    loading.value = false;
                    showConfirmDeleteBin.value = false;
                }
            }

            // Garantir que a rota esteja resolvida antes de inicializar
            router.isReady().then(() => {
                watch(
                    () => route.params.id,
                    (newId) => {
                        if (newId) {
                            loadData();
                        } else {
                            showSetup.value = true;
                        }
                    },
                    { immediate: true }
                );
            });

            return {
                payments,
                totalAmount,
                title,
                newPayment,
                loading,
                showModal,
                showSetup,
                showConfirmRemove,
                showConfirmDeleteBin,
                confirmPayment,
                dateMenu,
                setup,
                setupForm,
                form,
                formValid,
                setupFormValid,
                snackbar,
                activePanel,
                summaryItems,
                percentPaid,
                sortedGroupedPayments,
                formatCurrency,
                formatDate,
                addPayment,
                confirmRemovePayment,
                executeRemovePayment,
                cancelNewPayment,
                createBlob,
                confirmDeleteBin,
                executeDeleteBin,
                isAuthenticated,
                showLoginDialog,
                loginPassword,
                loginForm,
                loginFormValid,
                showSettingsDialog,
                handleLogin,
            };
        },
    };
</script>
<style scoped>
    * {
        text-transform: uppercase !important;
    }
</style>