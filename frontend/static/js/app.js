const { createApp, ref, reactive, computed, onMounted } = Vue;
const { createRouter, createWebHistory } = VueRouter;

const API = {
    patients: {
        get: '/api/ser-salud/patients',
        post: '/api/ser-salud/patient',
        put: '/api/ser-salud/patient',
        delete: '/api/ser-salud/patient',
    },
    doctors: {
        get: '/api/ser-salud/doctors',
        post: '/api/ser-salud/doctor',
        put: '/api/ser-salud/doctor',
        delete: '/api/ser-salud/doctor',
    },
    appointments: {
        get: '/api/ser-salud/appointments',
        post: '/api/ser-salud/appointment',
        put: '/api/ser-salud/appointment',
    },
};

function insuranceBadge(type) {
    if (type === 'Private') return 'text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full text-xs font-medium';
    if (type === 'Public') return 'text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full text-xs font-medium';
    return 'text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full text-xs font-medium';
}

function statusBadge(status) {
    const map = {
        pending: 'text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full text-xs font-medium',
        confirmed: 'text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs font-medium',
        completed: 'text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full text-xs font-medium',
        cancelled: 'text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full text-xs font-medium',
    };
    return map[status] || map.pending;
}

const Dashboard = {
    template: '#dashboard-template',
    setup() {
        const stats = reactive({ patients: 0, doctors: 0, appointments: 0 });
        const recentAppointments = ref([]);

        async function fetchStats() {
            try {
                const [p, d, a] = await Promise.all([
                    fetch(API.patients.get).then(r => r.json()),
                    fetch(API.doctors.get).then(r => r.json()),
                    fetch(API.appointments.get).then(r => r.json()),
                ]);
                stats.patients = Array.isArray(p) ? p.length : 0;
                stats.doctors = Array.isArray(d) ? d.length : 0;
                stats.appointments = Array.isArray(a) ? a.length : 0;
                recentAppointments.value = Array.isArray(a) ? a.slice(-5).reverse() : [];
            } catch (e) {
                console.error('Dashboard fetch error:', e);
            }
        }

        onMounted(fetchStats);

        return { stats, recentAppointments, statusBadge };
    },
};

const PatientsList = {
    template: '#patients-list-template',
    setup() {
        const patientsList = ref([]);
        const isLoading = ref(true);
        const editForm = reactive({ id: null, fullName: '', email: '', phone: '', age: '', diagnosis: '', insuranceType: '' });

        async function fetchPatients() {
            isLoading.value = true;
            try {
                const r = await fetch(API.patients.get);
                patientsList.value = await r.json();
            } catch (e) {
                console.error('Fetch patients error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        function startEdit(p) {
            editForm.id = p.id;
            editForm.fullName = p.fullName || '';
            editForm.email = p.email || '';
            editForm.phone = p.phone || '';
            editForm.age = p.age || '';
            editForm.diagnosis = p.diagnosis || '';
            editForm.insuranceType = p.insuranceType || '';
        }

        function cancelEdit() {
            editForm.id = null;
        }

        async function updatePatient() {
            try {
                const body = { ...editForm };
                await fetch(API.patients.put + '/' + editForm.id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                cancelEdit();
                await fetchPatients();
            } catch (e) {
                console.error('Update patient error:', e);
            }
        }

        async function removePatient(id) {
            if (!confirm('Delete patient #' + id + '?')) return;
            try {
                await fetch(API.patients.delete + '/' + id, { method: 'DELETE' });
                await fetchPatients();
            } catch (e) {
                console.error('Delete patient error:', e);
            }
        }

        onMounted(fetchPatients);

        return { patientsList, isLoading, editForm, startEdit, cancelEdit, updatePatient, removePatient, insuranceBadge };
    },
};

const PatientCreate = {
    template: '#patient-create-template',
    setup() {
        const router = VueRouter.useRouter();
        const form = reactive({
            fullName: '', email: '', phone: '', age: '',
            diagnosis: '', insuranceType: '',
        });

        async function createPatient() {
            try {
                const body = { ...form };
                const d = new Date();
                body.registrationDate =
                    String(d.getDate()).padStart(2, '0') + '/' +
                    String(d.getMonth() + 1).padStart(2, '0') + '/' +
                    d.getFullYear();
                await fetch(API.patients.post, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                router.push('/patients');
            } catch (e) {
                console.error('Create patient error:', e);
            }
        }

        return { form, createPatient };
    },
};

const DoctorsList = {
    template: '#doctors-list-template',
    setup() {
        const doctorsList = ref([]);
        const isLoading = ref(true);

        async function fetchDoctors() {
            isLoading.value = true;
            try {
                const r = await fetch(API.doctors.get);
                doctorsList.value = await r.json();
            } catch (e) {
                console.error('Fetch doctors error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        onMounted(fetchDoctors);

        return { doctorsList, isLoading };
    },
};

const DoctorCreate = {
    template: '#doctor-create-template',
    setup() {
        const router = VueRouter.useRouter();
        const form = reactive({
            fullName: '', specialty: '', licenseNumber: '',
            rating: '', email: '', phone: '',
        });

        async function createDoctor() {
            try {
                const body = { ...form };
                await fetch(API.doctors.post, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                router.push('/doctors');
            } catch (e) {
                console.error('Create doctor error:', e);
            }
        }

        return { form, createDoctor };
    },
};

const AppointmentsList = {
    template: '#appointments-list-template',
    setup() {
        const appointmentsList = ref([]);
        const isLoading = ref(true);

        async function fetchAppointments() {
            isLoading.value = true;
            try {
                const r = await fetch(API.appointments.get);
                appointmentsList.value = await r.json();
            } catch (e) {
                console.error('Fetch appointments error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        onMounted(fetchAppointments);

        return { appointmentsList, isLoading, statusBadge };
    },
};

const AppointmentCreate = {
    template: '#appointment-create-template',
    setup() {
        const router = VueRouter.useRouter();
        const form = reactive({
            patientId: '', doctorId: '', therapyId: '',
            date: '', time: '', status: 'pending', symptoms: '',
        });

        async function createAppointment() {
            try {
                const body = { ...form };
                await fetch(API.appointments.post, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                router.push('/appointments');
            } catch (e) {
                console.error('Create appointment error:', e);
            }
        }

        return { form, createAppointment };
    },
};

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Dashboard },
    { path: '/patients', component: PatientsList },
    { path: '/patient/create', component: PatientCreate },
    { path: '/doctors', component: DoctorsList },
    { path: '/doctor/create', component: DoctorCreate },
    { path: '/appointments', component: AppointmentsList },
    { path: '/appointment/create', component: AppointmentCreate },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp({
    data() {
        return { mobileOpen: false };
    },
});
app.use(router);
app.mount('#app');
