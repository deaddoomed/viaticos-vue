import { api_request } from "./apiClient";

interface viatico {
  sigla: string;
  fecha_desde: string;
  fecha_hasta: string;
}

interface viaticoDia {
  id: null,
  dia: string;
  persona: string;
  provincia: string;
  pernocta: boolean
}

async function enviarViatico(payload: any) {
  const response = await api_request("viatico/send", "POST", payload, true, false);
  return response;
}

async function validarViatico(filters: any) {
  const response = await api_request("viatico/exist", "POST", filters, true, false);
  return response;
}

export {
  type viatico,
  type viaticoDia,
  enviarViatico,
  validarViatico
};