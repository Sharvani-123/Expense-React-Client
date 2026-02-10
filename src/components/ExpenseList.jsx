function ExpenseList({ expenses, onRefresh }) {
    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Expenses</h5>
                    <button
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={onRefresh}
                    >
                        Refresh
                    </button>
                </div>
                {expenses.length === 0 ? (
                    <p className="text-muted mb-0">
                        No expenses recorded yet.
                    </p>
                ) : (
                    <div className="list-group list-group-flush">
                        {expenses.map((expense) => (
                            <div
                                key={expense._id}
                                className="list-group-item px-0"
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-semibold">
                                            {expense.title}
                                        </div>
                                        <div className="text-muted small">
                                            Paid by{" "}
                                            {expense.paidBy?.name ||
                                                expense.paidBy?.email ||
                                                expense.paidBy}
                                        </div>
                                    </div>
                                    <div className="fw-bold">
                                        Rs {Number(expense.amount || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-muted small mt-2">
                                    Split: {expense.splitType} | Participants:{" "}
                                    {expense.participants?.length || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpenseList;
