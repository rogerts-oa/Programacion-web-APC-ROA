// Lógica compartida de autenticación y navegación para Hotel Quinta Dalam
const authShared = {
    setup() {
        const user = Vue.ref(null);
        const loading = Vue.ref(true);
        const dropdownOpen = Vue.ref(false); // Estado del menú desplegable

        // Configurar Axios
        axios.defaults.withCredentials = true;

        const checkSession = async () => {
            try {
                const response = await axios.get('/api/users/me').catch(() => null);
                if (response && response.data) {
                    user.value = response.data;
                }
            } catch (err) {
                user.value = null;
            } finally {
                loading.value = false;
            }
        };

        const handleLogout = async () => {
            try {
                await axios.post('/api/users/logout');
                user.value = null;
                alert('Sesión cerrada con éxito');
                window.location.href = 'index.html';
            } catch (err) {
                console.error('Error al cerrar sesión');
            }
        };

        const toggleDropdown = () => {
            dropdownOpen.value = !dropdownOpen.value;
        };

        // Cerrar dropdown al hacer clic fuera (Opcional pero recomendado para UX)
        if (typeof window !== 'undefined') {
            window.addEventListener('click', (e) => {
                if (!e.target.closest('.user-menu')) {
                    dropdownOpen.value = false;
                }
            });
        }

        // Al montar, verificamos si hay sesión
        Vue.onMounted(checkSession);

        return {
            user,
            loading,
            dropdownOpen,
            toggleDropdown,
            handleLogout
        };
    }
};
