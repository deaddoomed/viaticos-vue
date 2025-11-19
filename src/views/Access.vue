<template>
  <div>
    <div>
      <h1>Acceso Externo</h1>
    </div>
    
    <div class="login">
      <input type="text" placeholder="Correo" v-model="access_input.email" />
      <input type="password" placeholder="RUT" v-model="access_input.password" />
    </div>

    <button @click="get_access()">Entrar</button>

    <p style="color: #FE6565; text-align: center; margin-top: 10%;">
      {{ error_message.detail }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '../stores/auth'
  import { useRouter } from 'vue-router'

  const access_input = ref({
    email: '',
    password: '',
  });

  const error_message = ref({ detail: "" });

  const router = useRouter();
  const auth_store = useAuthStore();
         
  async function get_access() {
    access_input.value.email = access_input.value.email.trim();
    access_input.value.password = access_input.value.password.trim();

    if (!access_input.value.email.length || !access_input.value.password.length) {
      error_message.value.detail = 'Debes ingresar correo y rut';
      return;
    }

    const access_response = await auth_store.access(
      access_input.value.email,
      access_input.value.password
    );

    if (!access_response) {
      error_message.value.detail = 'Credenciales invalidas';   
      return;
    }
    
    router.push({ path: "/" });
  }
</script>

<style scoped>
  .login {
    display: flex;
    justify-content: center;
    line-height: 2;
  }
</style>