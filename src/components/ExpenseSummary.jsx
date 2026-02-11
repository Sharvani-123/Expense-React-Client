function ExpenseSummary({ summary }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Summary</h5>
                {summary.length === 0 ? (
                    <p className="text-muted mb-0">
                        No summary available yet.
                    </p>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {summary.map((item) => {
                            const balance = Number(item.balance || 0);
                            const isOwing = balance > 0;
                            return (
                                <div
                                    key={item.userId}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <div className="fw-semibold">
                                            {item.name || item.userId}
                                        </div>
                                        <div className="text-muted small">
                                            {isOwing ? "Owes" : "Gets back"}
                                        </div>
                                    </div>
                                    <span
                                        className={`badge rounded-pill px-3 py-2 ${
                                            isOwing ? "bg-warning text-dark" : "bg-success"
                                        }`}
                                    >
                                        Rs {Math.abs(Number(balance || 0)).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpenseSummary;
