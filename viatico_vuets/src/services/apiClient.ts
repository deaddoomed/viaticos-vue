const API = import.meta.env.VITE_API;

export async function api_request(
  url: string,
  operation: 'GET' | 'POST' | 'PUT' | 'DELETE',
  request?: any,
  is_auth: boolean = false,
  is_file: boolean = false
) {
    const token = localStorage.getItem('access_token');

    const headers: Record<string, string> = {};
    if (!is_file) headers['Content-Type'] = 'application/json';
    if (is_auth && token) headers['Authorization'] = `Bearer ${token}`;    

    const options: RequestInit = { method: operation, headers };

    if (operation !== 'GET' && request) {
      options.body = is_file ? request : JSON.stringify(request);
    }

    try{
      const response = await fetch(API+url, options);
      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType?.includes('application/json')) {
          data = await response.json().catch(() => ({}));
      } 
      else if (is_file) {
          data = await response.blob();
      }

      return{
        status: response.status,
        ok: response.ok,
        data
      }
    }
    catch (error: any) {
        return {
          status: 0,
          ok: false,
          data: { message: error?.message || String(error) }
      };
    }
}