function Filters() {
  return (
    <div className="filtersContainer">
      <h5 className="filtersTitle">Filters</h5>
      <select className="priorityFilter">
        <option value="low" onSelect={handlePrioritySelection}>
          from Low to High
        </option>
        <option value="high" onSelect={handlePrioritySelection}>
          from High to Low
        </option>
      </select>
      <select className="executedFilter">
        <option value="yes" onSelect={handleExecutedSelection}>
          Executed Tasks
        </option>
        <option value="no" onSelect={handleExecutedSelection}>
          Pending Tasks
        </option>
      </select>
    </div>
  );
}

export default Filters;
