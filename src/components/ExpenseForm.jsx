import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function ExpenseForm({ groupId, members, nameByEmail, onSuccess, onError }) {
    const [submitting, setSubmitting] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: "",
        amount: "",
        paidBy: "",
        participants: [],
        splitType: "equal"
    });
    const [customShares, setCustomShares] = useState({});

    useEffect(() => {
        if (members.length && newExpense.participants.length === 0) {
            setNewExpense((prev) => ({ ...prev, participants: members }));
        }
    }, [members, newExpense.participants.length]);

    useEffect(() => {
        if (newExpense.paidBy && !newExpense.participants.includes(newExpense.paidBy)) {
            setNewExpense((prev) => ({
                ...prev,
                participants: [...prev.participants, prev.paidBy].filter(Boolean)
            }));
        }
    }, [newExpense.paidBy, newExpense.participants]);

    const handleParticipantToggle = (email) => {
        if (email === newExpense.paidBy) return;
        setNewExpense((prev) => {
            const exists = prev.participants.includes(email);
            const updated = exists
                ? prev.participants.filter((p) => p !== email)
                : [...prev.participants, email];
            return { ...prev, participants: updated };
        });
    };

    const handleCustomShareChange = (email, value) => {
        setCustomShares((prev) => ({
            ...prev,
            [email]: value
        }));
    };

    const buildPayload = () => {
        if (newExpense.splitType === "equal") {
            return {
                groupId,
                title: newExpense.title.trim(),
                amount: Number(newExpense.amount),
                paidBy: newExpense.paidBy,
                participants: newExpense.participants,
                splitType: "equal"
            };
        }

        const participants = newExpense.participants.map((email) => ({
            userId: email,
            share: Number(customShares[email] || 0)
        }));

        return {
            groupId,
            title: newExpense.title.trim(),
            amount: Number(newExpense.amount),
            paidBy: newExpense.paidBy,
            participants,
            splitType: "unequal"
        };
    };

    const validate = () => {
        const amountValue = Number(newExpense.amount);
        if (!newExpense.paidBy) {
            onError?.("Please select who paid the expense.");
            return false;
        }
        if (newExpense.splitType === "equal") {
            if (!newExpense.participants.length) {
                onError?.("Please select at least one participant.");
                return false;
            }
        }
        if (newExpense.splitType === "unequal") {
            const totalShares = newExpense.participants.reduce((sum, email) => {
                return sum + Number(customShares[email] || 0);
            }, 0);
            if (Math.abs(totalShares - amountValue) > 0.01) {
                onError?.("Unequal split total must match the amount.");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        onError?.("");
        try {
            const payload = buildPayload();
            await axios.post(`${serverEndpoint}/expense`, payload, {
                withCredentials: true
            });
            setNewExpense({
                title: "",
                amount: "",
                paidBy: "",
                participants: members,
                splitType: "equal"
            });
            setCustomShares({});
            onSuccess?.();
        } catch (err) {
            console.log(err);
            onError?.("Failed to add expense. Please check the form.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Add New Expense</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newExpense.title}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, title: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={newExpense.amount}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, amount: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Paid By</label>
                        <select
                            className="form-select"
                            value={newExpense.paidBy}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, paidBy: e.target.value })
                            }
                            required
                        >
                            <option value="">Select member</option>
                            {members.map((member) => (
                                <option key={member} value={member}>
                                    {nameByEmail[member] || member}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Split Type</label>
                        <select
                            className="form-select"
                            value={newExpense.splitType}
                            onChange={(e) =>
                                setNewExpense({ ...newExpense, splitType: e.target.value })
                            }
                        >
                            <option value="equal">Equal</option>
                            <option value="unequal">Unequal</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Participants</label>
                        <div className="d-flex flex-wrap gap-2">
                            {members.map((member) => (
                                <div
                                    key={member}
                                    className={`btn btn-sm rounded-pill ${
                                        newExpense.participants.includes(member)
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                    }`}
                                    style={{
                                        opacity: member === newExpense.paidBy ? 0.7 : 1,
                                        cursor: member === newExpense.paidBy ? "not-allowed" : "pointer"
                                    }}
                                    onClick={() => handleParticipantToggle(member)}
                                >
                                    {nameByEmail[member] || member}
                                </div>
                            ))}
                        </div>
                        <small className="text-muted d-block mt-2">
                            Tap to include or exclude members from this expense.
                        </small>
                    </div>

                    {newExpense.splitType === "unequal" && (
                        <div className="mb-4">
                            <label className="form-label">
                                Custom Amounts
                            </label>
                            <div className="d-flex flex-column gap-2">
                                {newExpense.participants.map((member) => (
                                    <div
                                        key={member}
                                        className="d-flex align-items-center gap-2"
                                    >
                                        <span className="text-muted small flex-grow-1">
                                            {nameByEmail[member] || member}
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-control form-control-sm"
                                            style={{ maxWidth: "140px" }}
                                            value={customShares[member] || ""}
                                            onChange={(e) =>
                                                handleCustomShareChange(member, e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100 rounded-pill fw-bold"
                        disabled={submitting}
                    >
                        {submitting ? "Saving..." : "Add Expense"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ExpenseForm;
