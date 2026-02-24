import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import ExpenseList from "../components/ExpenseList";

function GroupExpenses() {
    const { groupId } = useParams();

    const [groupDetails, setGroupDetails] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState(false);
    const [error, setError] = useState("");

    const fetchGroupAndExpenses = async () => {
        setLoading(true);
        setError("");
        try {
            const groupsResponse = await axios.get(
                `${serverEndpoint}/groups/my-groups`,
                { withCredentials: true }
            );
            const group = groupsResponse.data.find((g) => g._id === groupId);
            setGroupDetails(group || null);

            const expensesResponse = await axios.get(
                `${serverEndpoint}/expense/group/${groupId}/expenses`,
                { withCredentials: true }
            );
            setExpenses(Array.isArray(expensesResponse.data?.data) ? expensesResponse.data.data : []);

            const summaryResponse = await axios.get(
                `${serverEndpoint}/expense/group/${groupId}/summary`,
                { withCredentials: true }
            );
            setSummary(Array.isArray(summaryResponse.data?.data) ? summaryResponse.data.data : []);
        } catch (err) {
            console.log(err);
            setError("Unable to load group expenses. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupAndExpenses();
    }, [groupId]);

    const members = Array.isArray(groupDetails?.membersEmail)
        ? groupDetails.membersEmail
        : [];

    const nameByEmail = (() => {
        const map = {};
        expenses.forEach((expense) => {
            if (expense?.paidBy?.email) {
                map[expense.paidBy.email] = expense.paidBy.name || expense.paidBy.email;
            }
            (expense?.participants || []).forEach((p) => {
                if (p?.userId?.email) {
                    map[p.userId.email] = p.userId.name || p.userId.email;
                }
            });
        });
        summary.forEach((item) => {
            if (item?.email) {
                map[item.email] = item.name || item.email;
            }
        });
        return map;
    })();

    const handleSettle = async () => {
        setSettling(true);
        setError("");
        try {
            await axios.put(
                `${serverEndpoint}/expense/group/${groupId}/settle`,
                {},
                { withCredentials: true }
            );
            await fetchGroupAndExpenses();
        } catch (err) {
            console.log(err);
            setError("Failed to settle the group. Please try again.");
        } finally {
            setSettling(false);
        }
    };

    if (loading) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-primary"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">
                    Loading group expenses...
                </p>
            </div>
        );
    }

    return (
        <div className="container py-5 px-4 px-md-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">Group Expenses</li>
                </ol>
            </nav>

            <div className="row align-items-center mb-4">
                <div className="col-md-8 text-center text-md-start mb-3 mb-md-0">
                    <h2 className="fw-bold text-dark display-6">
                        {groupDetails?.name || "Group"}{" "}
                        <span className="text-primary">Expenses</span>
                    </h2>
                    <p className="text-muted mb-0">
                        Track expenses, split bills, and settle balances.
                    </p>
                </div>
                <div className="col-md-4 text-center text-md-end">
                    <button
                        className="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold"
                        onClick={handleSettle}
                        disabled={settling}
                    >
                        {settling ? "Settling..." : "Settle Group"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger rounded-4">
                    {error}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-5">
                    <ExpenseForm
                        groupId={groupId}
                        members={members}
                        nameByEmail={nameByEmail}
                        onSuccess={fetchGroupAndExpenses}
                        onError={setError}
                    />
                </div>

                <div className="col-lg-7">
                    <ExpenseSummary summary={summary} />
                    <ExpenseList
                        expenses={expenses}
                        onRefresh={fetchGroupAndExpenses}
                        nameByEmail={nameByEmail}
                    />
                </div>
            </div>
        </div>
    );
}

export default GroupExpenses;
