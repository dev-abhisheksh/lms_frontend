// components/admin/ChartCard.jsx
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const ChartCard = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow p-5 h-80">
            <h3 className="font-semibold mb-4">User Growth</h3>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#7c3aed" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartCard;
