const API = import.meta.env.VITE_API_URL;

export async function getTasks() {
  const res = await fetch(`${API}/tasks`);
  if (!res.ok) throw new Error('No se pudieron obtener las tareas');
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear la tarea');
  return res.json();
}
