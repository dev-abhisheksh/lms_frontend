// components/admin/StatCard.jsx
const StatCard = ({ title, value }) => {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-2xl font-bold">{value}</h2>
        </div>
    );
};

export default StatCard;
