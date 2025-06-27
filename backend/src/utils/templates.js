exports.newTask = (task, author) => ({
  subject: `📝 Nueva tarea: ${task.title}`,
  html: `<p>Se ha creado la tarea <strong>${task.title}</strong> por ${author.name} (${author.area}).</p>
         <p>Prioridad: <b>${task.priority}</b> – Límite: ${task.dueAt ?? 'Sin fecha'}</p>`
});

exports.assigned = (task, executor) => ({
  subject: `📌 Tarea asignada: ${task.title}`,
  html: `<p>La tarea <strong>${task.title}</strong> ha sido asignada a ${executor.name}.</p>`
});

exports.statusChanged = (task) => ({
  subject: `🔄 Estado actualizado a ${task.status}: ${task.title}`,
  html: `<p>La tarea <strong>${task.title}</strong> ahora está en estado <b>${task.status}</b>.</p>`
});
