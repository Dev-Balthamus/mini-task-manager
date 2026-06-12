import { type PriorityCriterion, type ExecutionCriterion, useTaskEditor } from "../assets/contexts/TaskEditorContext";
import "./Filters.css";

function Filters() {
  const { priority, toOrderByPriority, execution, toOrderByExecution } = useTaskEditor();

  function handlePriorityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedPriority = event.target.value as PriorityCriterion;
    toOrderByPriority(selectedPriority);
  }

  function handleExecutionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedExecution = event.target.value as ExecutionCriterion;
    toOrderByExecution(selectedExecution);
  }

  return (
    <div className="filtersContainer">
      <h5 className="filtersTitle">Filters</h5>
      <select className="filter" value={priority} onChange={handlePriorityChange}>
        <option value="">Order by Priority...</option>
        <option value="low">from Low to High</option>
        <option value="high">from High to Low</option>
      </select>
      <select className="filter" value={execution} onChange={handleExecutionChange}>
        <option value="">Filter by Execution Status...</option>
        <option value="executed">Executed Tasks</option>
        <option value="pending">Pending Tasks</option>
      </select>
    </div>
  );
}

export default Filters;
