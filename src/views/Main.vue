<template>
    <div class="main">
      <div>
        <button @click="logout()">Logout</button>
      </div>
      <div class="formulario">
        <input type="text" v-model="viatico_info.sigla" placeholder="SIGLA CAMIONETA" @input="viatico_info.sigla = viatico_info.sigla.toUpperCase()"/>
        <input type="date" v-model="viatico_info.fecha_desde" />
        <input type="date" v-model="viatico_info.fecha_hasta" />
      </div>
      <div>
        <div v-if="viatico_dias.length > 0">
            <table>
                <thead>
                    <tr>
                        <th>Dias</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="dia in viatico_dias" :key="dia.dia" class="dia-item">
                        <td>{{ dia.dia.split('-')[2] }}</td>
                        <td>
                            <input type="text" v-model="dia.persona" placeholder="Persona" @input="dia.persona = dia.persona.toUpperCase()"/></br>
                            <input type="text" v-model="dia.provincia" placeholder="Provincia" @input="dia.provincia = dia.provincia.toUpperCase()"/>
                        </td>
                        <td style="text-align: center;">
                            <label for="check_pernocta">Pernocta</label>
                            <input type="checkbox" id="check_pernocta" v-model="dia.pernocta"  />
                        </td>
                    </tr>
                </tbody>
            </table>
            <button @click="enviarViaticoJSON()">Enviar</button>
        </div>
        <p v-if="errorMsg" style="color: red">{{ errorMsg }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
    import { onMounted, ref, watch } from "vue";
    import { useAuthStore } from "../stores/auth";
    import router from "../router";
    import { enviarViatico, validarViatico, type viatico, type viaticoDia } from "../services/viaticoService";
    import { parseDateLocal, formatDateLocal } from "../services/formaters"
    
    const auth_store = useAuthStore();
    const viatico_info = ref<viatico>({
        fecha_desde: "",
        fecha_hasta: "",
        sigla: "",
    });
    const viatico_dias = ref<viaticoDia[]>([]);
    const errorMsg = ref("");
    
    onMounted(async () => {
        const valid = await auth_store.token_validation();
        if (!valid.ok) {
            await auth_store.logout();
            router.push({ path: "/access" });
        }
    });   

    async function enviarViaticoJSON() {
        // Validar que haya días válidos
        if (!viatico_info.value.sigla || !viatico_info.value.fecha_desde || !viatico_info.value.fecha_hasta) {
            errorMsg.value = "Ningun campo puede estar vacio.";
            return;
        }
        for (const dia of viatico_dias.value) {
            if (!dia.persona.trim() || !dia.provincia.trim()) {
                errorMsg.value = "Ningun campo puede estar vacio.";
                return;
            }
        }

        // Construir el JSON
        const payload = {
            viatico: {
                fecha_desde: viatico_info.value.fecha_desde,
                fecha_hasta: viatico_info.value.fecha_hasta,
                sigla: viatico_info.value.sigla
            },
            dias: viatico_dias.value.map(dia => ({
                id: null,
                dia: dia.dia,
                persona: dia.persona,
                provincia: dia.provincia,
                pernocta: dia.pernocta
            }))
        };

        const response = await enviarViatico(payload);

        viatico_info.value = ({fecha_desde: "",fecha_hasta: "",sigla: "",});
        viatico_dias.value = [];

        if(response.ok){
            window.alert("Viatico agregado correctamente")
        }
        if(response.ok == false){
            window.alert(response.data.message)
        }        
    }
    
    async function logout() {
        await auth_store.logout();
        router.push({ path: "/access" });
    }
    
    // Watch para validar fechas y generar viaticoDias
    watch(
        () => [viatico_info.value.fecha_desde, viatico_info.value.fecha_hasta],
        async ([desde, hasta]) => {
            let tieneFinDeSemana = false;
            errorMsg.value = "";
            viatico_dias.value = [];
        
            if (!desde || !hasta) return;
        
            const fechaDesde = parseDateLocal(desde);
            const fechaHasta = parseDateLocal(hasta);
        
            // Validar máximo 5 días
            const diffTime = fechaHasta.getTime() - fechaDesde.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24) + 1;
            if (diffDays > 5) {
                errorMsg.value = "El rango no puede ser mayor a 5 días.";
                return;
            }
            

            const resp = await validarViatico({
                fecha_desde: viatico_info.value.fecha_desde,
                fecha_hasta: viatico_info.value.fecha_hasta
            });
  
            if(!resp.ok){
                errorMsg.value = "Ya existe un viático que incluye un o mas dias.";
                return
            }                                                       
        
            // Generar lista de días
            let currentDate = new Date(fechaDesde);
            while (currentDate <= fechaHasta) {
                const day = currentDate.getDay(); // 0=domingo, 6=sábado
                if (day === 0 || day === 6) {
                    tieneFinDeSemana = true;
                    break; // Si hay fin de semana, salir
                }
        
                // Crear viaticoDia
                const nuevoDia: viaticoDia = {  id: null,
                                                dia: formatDateLocal(currentDate),
                                                persona: "",
                                                provincia: "",
                                                pernocta: false,
                };
                viatico_dias.value.push(nuevoDia);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        
            if (tieneFinDeSemana) {
                viatico_dias.value = [];
                errorMsg.value = "El rango no puede incluir sábados ni domingos.";
            } 
            else if (viatico_dias.value.length === 0) {
                errorMsg.value = "No hay días laborales en el rango seleccionado.";
            }
        }
    );
  </script>
  
  <style scoped>
    .main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .formulario {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 200px;
    }
    .formulario > input {
        margin: 10px;
        height: 30px;
    }
    .dia-item {
        margin-bottom: 10px;
        display: flex;
        gap: 5px;
        align-items: center;
    }
        .dia-item input[type="text"] {
            width: 150px;
        }
        .dia
    table {
        width: 200px;
        margin: 10px 20px;
    }
  </style>