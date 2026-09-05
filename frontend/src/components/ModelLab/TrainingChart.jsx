import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrainingChart({ data, epochs }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Training Loss</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="epoch"
              label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              label={{ value: 'Loss', angle: -90, position: 'insideLeft', fontSize: 12 }}
              stroke="#94a3b8"
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#6c63ff"
              strokeWidth={2}
              dot={false}
              name="Loss"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-sm text-slate-500 text-center">
        {epochs} epochs planned
      </div>
    </div>
  );
}
