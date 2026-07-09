import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ProgressChart({ completed, total }) {
  const data = [
    { name: 'Done', value: completed },
    { name: 'Remaining', value: total - completed },
  ];
  
  // لو الـ total صفر، عشان الـ chart ميبقاش فاضي
  if (total === 0) return null;

  const COLORS = ['#3b82f6', '#1a1a1a'];

  return (
    <div style={{ width: '80px', height: '80px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            innerRadius={25} 
            outerRadius={35} 
            paddingAngle={5} 
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}