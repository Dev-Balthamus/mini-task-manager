function TaskItem({ item }) {
  return (
    <li className="taskItem">
      <div className="taskItemTitle">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="taskItemPriority">
        <h3>{item.priority}</h3>
      </div>
      <div className="taskItemStatus">
        <h3>Executed</h3>
        <input type="checkbox" className="taskItemStatusCheckbox" checked={item.completed} readOnly />
      </div>
      <div className="taskItemActions">
        <button className="taskItemModify">Modify</button>
        <button className="taskItemDelete">Delete</button>
      </div>
    </li>
  );
}

export default TaskItem;
