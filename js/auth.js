// Lógica compartida de autenticación y navegación para Hotel Quinta Dalam
const authShared = {
    setup() {
        const user = Vue.ref(null);
        const loading = Vue.ref(true);

        // Configurar Axios
        axios.defaults.withCredentials = true;

        const checkSession = async () => {
            try {
                // Asumimos un endpoint /api/users/me o similar para obtener el usuario actual
                // Si no existe, podemos usar la información guardada al login o intentar el catálogo
                // Para este ejemplo, intentaremos obtener el perfil si existe
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

        // Al montar, verificamos si hay sesión
        Vue.onMounted(checkSession);

        return {
            user,
            loading,
            handleLogout
        };
    }
};
