import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const SalesDashboard = () => {
  const [data, setData] = useState({
  efectivo: 0,
  tarjeta: 0,
  transferencia: 0,
  total: 0,
});

const navigate = useNavigate();

const [tables, setTables] = useState<any[]>([]);

const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
  const load = async () => {
    const res = await api.getSalesSummary('1');
    setData(res);

    const allSales = await api.getSales('1');
    setSales(allSales);

    const allTables = await api.getTables('1'); // 👈 aquí
    setTables(allTables); // 👈 aquí
  };

  load();
}, []);

    

  return (

    
  <div className="min-h-screen bg-slate-100 p-6 text-slate-900 dark:bg-slate-900 dark:text-white">

            <button
        onClick={() => navigate('/')}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
        ⬅ Volver a mesas
        </button>
    <h1 className="text-2xl font-bold mb-4">Ventas del día</h1>

    <div className="grid grid-cols-2 gap-4">
      <Card title="💵 Efectivo" value={data.efectivo} />
      <Card title="💳 Tarjeta" value={data.tarjeta} />
      <Card title="🏦 Transferencia" value={data.transferencia} />
      <Card title="🧾 Total" value={data.total} />
    </div>

    <h2 className="text-xl font-bold mt-6 mb-2">
      Historial de ventas
    </h2>

    <div className="bg-gray-900 p-4 rounded-xl max-h-80 overflow-y-auto">
      {sales.map((sale) => (
        <div key={sale.id} className="border-b border-gray-700 py-2">
          <p className="text-sm">
            Mesa: {
                tables.find(t => t.id === sale.tableId)?.name || 'N/A'
                }
          </p>

          <p className="text-sm">
            Total: ${sale.totalAmount.toFixed(2)}
          </p>

          <p className="text-xs text-gray-400">
            {new Date(sale.closedAt).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  </div>
);
};

const Card = ({ title, value }: any) => (
  <div className="bg-gray-800 p-4 rounded-xl shadow">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-xl font-bold">${value}</p>
  </div>
);

export default SalesDashboard;