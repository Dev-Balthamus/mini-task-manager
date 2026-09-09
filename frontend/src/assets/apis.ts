import { tasksURL, type CreateTaskDTO, type Task } from "./custom-hooks/useTasksJSON";
import { authURL, type UserCredentialsDTO, type UserIdentityDTO } from "./custom-hooks/useUser";

export async function registerUser(user: UserCredentialsDTO) {
  try {
    const response = await fetch(`${authURL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (response.status !== 201) {
      throw new Error(data.msg || "Impossibile completare la registrazione.");
    }

    return "Registrazione completata! Ora è possibile effettuare l'accesso.";
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "Si è verificato un errore nel processo di registrazione.";
  }
}

export async function loginUser(user: UserCredentialsDTO) {
  try {
    const response = await fetch(`${authURL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Importante per ricevere e salvare il cookie httpOnly
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (response.status !== 200) {
      throw new Error(data.msg || "Credenziali non valide.");
    }

    return data.user as UserIdentityDTO;
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "Si è verificato un errore durante il login.";
  }
}

export async function addTask(task: CreateTaskDTO) {
  try {
    const response = await fetch(tasksURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(task),
    });

    if (response.status !== 201) {
      throw new Error("Error in creating the new Task");
    }

    const addedTask = await response.json();
    return addedTask;
  } catch (error) {
    console.error(error);
  }
}

export async function editTask(task: Task) {
  // Si inviano al backend solo i campi necessari per l'API di update
  const toUpdateTask = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    executed: task.executed,
  };

  try {
    const response = await fetch(`${tasksURL}/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(toUpdateTask),
    });

    if (response.status !== 200) {
      throw new Error("Error in updating the Task");
    }

    const editedTask = await response.json();
    return editedTask;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteTask(task: Task) {
  try {
    const response = await fetch(`${tasksURL}/${task.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status !== 200) {
      throw new Error("Error in deleting the Task");
    }
  } catch (error) {
    console.error(error);
  }
}
