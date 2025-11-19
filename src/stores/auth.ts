import { defineStore } from "pinia";
import { ref } from "vue"
import { api_request } from "../services/apiClient";

export const useAuthStore = defineStore("auth", () => {
    const error_message = ref({detail: ""});

    const get_user_name = () => {
        return localStorage.getItem("user_name")        
    }

    const access = async (email: string, password: string) =>{
        const payload = { email, password}
        const response = await api_request("auth/access", "POST", payload)
        
        if(!response.ok){ return false;} 
                  
        localStorage.setItem("access_token",response.data.token)
        return true       
    }

    const token_validation = async () => {
        var token = localStorage.getItem("access_token")
        if(token){
            const response = await api_request("auth/verify", "GET", null, true, false)
            return response
        }
        else{
            return {"ok": false}
        }       
    }

    const logout = async() => {
        localStorage.removeItem("access_token")
    }

    return{ error_message, get_user_name, access, token_validation, logout }
})