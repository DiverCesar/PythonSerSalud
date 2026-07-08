const { createApp, ref, computed, onMounted } = Vue;

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

createApp({
    setup() {
        const activeTab = ref('patients');
        const isLoading = ref(true);

        const patientsList = ref([]);
        const doctorsList = ref([]);
        const appointmentsList = ref([]);

        const deleteId = ref('');
        const deleteDoctorId = ref('');
        const isEditing = ref(false);

        const patientForm = ref({
            fullName: '', email: '', phone: '', age: '',
            diagnosis: '', insuranceType: '', registrationDate: '', isActive: true,
        });

        const doctorForm = ref({
            fullName: '', specialty: '', licenseNumber: '',
            rating: '', email: '', phone: '', isActive: true,
        });

        const appointmentForm = ref({
            patientId: '', doctorId: '', therapyId: '',
            date: '', time: '', status: 'pending', symptoms: '', isActive: true,
        });

        function tabClass(tab) {
            return activeTab.value === tab
                ? 'bg-slate-900 border-b-2 border-emerald-500 text-emerald-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50';
        }

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

        function switchTab(tab) {
            activeTab.value = tab;
            if (tab === 'patients') fetchPatients();
            else if (tab === 'doctors') fetchDoctors();
            else if (tab === 'appointments') fetchAppointments();
        }

        async function fetchPatients() {
            isLoading.value = true;
            try {
                const res = await fetch(API.patients.get);
                const data = await res.json();
                patientsList.value = data;
            } catch (e) {
                console.error('GET patients error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function fetchOrderedPatients() {
            isLoading.value = true;
            try {
                const res = await fetch(API.patients.get + '/ordered');
                const data = await res.json();
                patientsList.value = data;
            } catch (e) {
                console.error('GET ordered error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function fetchPatientCategories() {
            isLoading.value = true;
            try {
                const res = await fetch(API.patients.get + '/categories');
                const data = await res.json();
                patientsList.value = [...(data.active || []), ...(data.inactive || [])];
            } catch (e) {
                console.error('GET categories error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function fetchPatientsByCategory(status) {
            isLoading.value = true;
            try {
                const res = await fetch(API.patients.get + '/category/' + status);
                const data = await res.json();
                patientsList.value = data;
            } catch (e) {
                console.error('GET category error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function savePatient() {
            try {
                const url = isEditing.value
                    ? API.patients.put + '/' + patientForm.value.id
                    : API.patients.post;
                const method = isEditing.value ? 'PUT' : 'POST';
                const body = { ...patientForm.value };
                if (!body.registrationDate) {
                    const d = new Date();
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    body.registrationDate = dd + '/' + mm + '/' + yyyy;
                }
                await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                resetPatientForm();
                await fetchPatients();
            } catch (e) {
                console.error('Save patient error:', e);
            }
        }

        async function deletePatient() {
            if (!deleteId.value) return;
            try {
                await fetch(API.patients.delete + '/' + deleteId.value, { method: 'DELETE' });
                deleteId.value = '';
                await fetchPatients();
            } catch (e) {
                console.error('Delete patient error:', e);
            }
        }

        function editPatient(p) {
            isEditing.value = true;
            patientForm.value = {
                id: p.id,
                fullName: p.fullName || '',
                email: p.email || '',
                phone: p.phone || '',
                age: p.age || '',
                diagnosis: p.diagnosis || '',
                insuranceType: p.insuranceType || '',
                registrationDate: p.registrationDate || '',
                isActive: p.isActive !== undefined ? p.isActive : true,
            };
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function resetPatientForm() {
            isEditing.value = false;
            patientForm.value = {
                fullName: '', email: '', phone: '', age: '',
                diagnosis: '', insuranceType: '', registrationDate: '', isActive: true,
            };
        }

        async function fetchDoctors() {
            isLoading.value = true;
            try {
                const res = await fetch(API.doctors.get);
                const data = await res.json();
                doctorsList.value = data;
            } catch (e) {
                console.error('GET doctors error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function saveDoctor() {
            try {
                const body = { ...doctorForm.value };
                await fetch(API.doctors.post, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                resetDoctorForm();
                await fetchDoctors();
            } catch (e) {
                console.error('Save doctor error:', e);
            }
        }

        async function deleteDoctorAction() {
            if (!deleteDoctorId.value) return;
            try {
                await fetch(API.doctors.delete + '/' + deleteDoctorId.value, { method: 'DELETE' });
                deleteDoctorId.value = '';
                await fetchDoctors();
            } catch (e) {
                console.error('Delete doctor error:', e);
            }
        }

        function resetDoctorForm() {
            doctorForm.value = {
                fullName: '', specialty: '', licenseNumber: '',
                rating: '', email: '', phone: '', isActive: true,
            };
        }

        async function fetchAppointments() {
            isLoading.value = true;
            try {
                const res = await fetch(API.appointments.get);
                const data = await res.json();
                appointmentsList.value = data;
            } catch (e) {
                console.error('GET appointments error:', e);
            } finally {
                isLoading.value = false;
            }
        }

        async function saveAppointment() {
            try {
                const body = { ...appointmentForm.value };
                await fetch(API.appointments.post, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                resetAppointmentForm();
                await fetchAppointments();
            } catch (e) {
                console.error('Save appointment error:', e);
            }
        }

        function resetAppointmentForm() {
            appointmentForm.value = {
                patientId: '', doctorId: '', therapyId: '',
                date: '', time: '', status: 'pending', symptoms: '', isActive: true,
            };
        }

        onMounted(() => {
            fetchPatients();
        });

        return {
            activeTab, isLoading,
            patientsList, doctorsList, appointmentsList,
            deleteId, deleteDoctorId, isEditing,
            patientForm, doctorForm, appointmentForm,
            tabClass, insuranceBadge, statusBadge, switchTab,
            fetchPatients, fetchOrderedPatients, fetchPatientCategories, fetchPatientsByCategory,
            savePatient, deletePatient, editPatient, resetPatientForm,
            fetchDoctors, saveDoctor, deleteDoctorAction, resetDoctorForm,
            fetchAppointments, saveAppointment, resetAppointmentForm,
        };
    },
}).mount('#app');
