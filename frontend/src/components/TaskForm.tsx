function TaskForm() {
  return (
    <form className="formContainer">
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="formTextInput" />
      <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="formTextInput" />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} className="formSelectInput">
        <option value="">Select Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" className="formSubmit" onClick={handleTaskCreation}>
        Create Task
      </button>
    </form>
  );
}

export default TaskForm;
