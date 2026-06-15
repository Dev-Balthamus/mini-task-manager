import { baseURL, type Task } from "./custom-hooks/useTasksJSON";

export async function addTask(task: Task) {
  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  try {
    const response = await fetch(`${baseURL}/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
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
    const response = await fetch(`${baseURL}/${task.id}`, {
      method: "DELETE",
    });

    if (response.status !== 200) {
      throw new Error("Error in deleting the Task");
    }
  } catch (error) {
    console.error(error);
  }
}
