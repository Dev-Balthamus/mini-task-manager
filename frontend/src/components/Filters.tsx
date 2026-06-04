import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import "./Filters.css";

function Filters() {
  const { orderCriterion, toOrderCriterion } = useTaskEditor();

  function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedCriterion = event.target.value as any;
    toOrderCriterion(selectedCriterion);
  }

  return (
    <div className="filtersContainer">
      <h5 className="filtersTitle">Filters</h5>
      <select className="filter" value={orderCriterion} onChange={handleFilterChange}>
        <option value="" disabled>
          Order by Priority...
        </option>
        <option value="low" className={orderCriterion === "low" ? "selected" : ""}>
          from Low to High
        </option>
        <option value="high" className={orderCriterion === "high" ? "selected" : ""}>
          from High to Low
        </option>
      </select>
      <select className="filter" value={orderCriterion} onChange={handleFilterChange}>
        <option value="" disabled>
          Filter by Execution Status...
        </option>
        <option value="executed" className={orderCriterion === "executed" ? "selected" : ""}>
          Executed Tasks
        </option>
        <option value="pending" className={orderCriterion === "pending" ? "selected" : ""}>
          Pending Tasks
        </option>
      </select>
    </div>
  );
}

export default Filters;
