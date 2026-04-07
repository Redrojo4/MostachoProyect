import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWaiterAppContext } from '../../context/WaiterAppContext';
import api from '../../services/api';
import { supabase } from '../../supabaseClient';
import { Order, OrderItem, PaymentMethod, SubBill } from '../../types';
import Modal from '../shared/Modal';

interface SplitBillModalProps {
  order: Order;
  orderItems: OrderItem[];
  total: number;
  onClose: () => void;
}

const SplitBillModal: React.FC<SplitBillModalProps> = ({ order, orderItems, total, onClose }) => {
  const navigate = useNavigate();
  const { fetchData } = useWaiterAppContext();
  const [splitType, setSplitType] = useState<'equal' | 'items'>('items');
  const [equalParts, setEqualParts] = useState(2);
  const [subBills, setSubBills] = useState<SubBill[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const availableItems = useMemo(() => {
    const itemsInSubBills = new Set(subBills.flatMap((subBill) => subBill.items.map((item) => item.id)));
    return orderItems.filter((item) => !itemsInSubBills.has(item.id));
  }, [orderItems, subBills]);

  const toggleItemSelection = (itemId: string) => {
    const nextSelection = new Set(selectedItems);
    if (nextSelection.has(itemId)) {
      nextSelection.delete(itemId);
    } else {
      nextSelection.add(itemId);
    }
    setSelectedItems(nextSelection);
  };

  const handleCreateSubBill = () => {
    if (selectedItems.size === 0) {
      return;
    }

    const subBillItems = orderItems.filter((item) => selectedItems.has(item.id));
    const subBillTotal = subBillItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    setSubBills([
      ...subBills,
      {
        id: `sub-${Date.now()}`,
        items: subBillItems,
        total: subBillTotal,
        paymentMethod: null,
        paid: false,
      },
    ]);
    setSelectedItems(new Set());
  };

  const handlePaySubBill = (subBillId: string, method: PaymentMethod) => {
    setSubBills(subBills.map((subBill) => (subBill.id === subBillId ? { ...subBill, paid: true, paymentMethod: method } : subBill)));
  };

  const handleCloseTable = async () => {
    const paymentDetails: { method: PaymentMethod; amount: number }[] =
      splitType === 'items' && subBills.length > 0
        ? subBills.map((subBill) => ({
            method: subBill.paymentMethod ?? PaymentMethod.CASH,
            amount: subBill.total,
          }))
        : [{ method: PaymentMethod.CASH, amount: total }];

    try {
      await supabase.from('orders').update({ status: 'Servido', items: orderItems }).eq('id', order.id);
      await api.closeTable(order.id, paymentDetails);
      await fetchData();
      alert('Mesa cerrada exitosamente.');
      navigate('/');
    } catch (err) {
      console.error('Error closing table:', err);
      alert('Error al cerrar la mesa.');
    }
  };

  return (
    <Modal title={`Dividir Cuenta (Total: $${total.toFixed(2)})`} onClose={onClose}>
      <div className="mb-4 flex border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setSplitType('items')} className={`px-4 py-2 ${splitType === 'items' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
          Por Productos
        </button>
        <button onClick={() => setSplitType('equal')} className={`px-4 py-2 ${splitType === 'equal' ? 'border-b-2 border-indigo-500 font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
          Partes Iguales
        </button>
      </div>

      {splitType === 'items' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-bold">Productos Disponibles</h3>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded bg-slate-100 p-2 dark:bg-slate-700">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={`flex cursor-pointer justify-between rounded p-2 ${selectedItems.has(item.id) ? 'bg-indigo-200 ring-2 ring-indigo-500 dark:bg-indigo-800' : 'bg-white dark:bg-slate-600'}`}
                >
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <button onClick={handleCreateSubBill} disabled={selectedItems.size === 0} className="mt-4 w-full rounded bg-indigo-600 py-2 font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-400">
              Crear Subcuenta
            </button>
          </div>

          <div>
            <h3 className="mb-2 font-bold">Subcuentas</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {subBills.map((subBill) => (
                <div key={subBill.id} className={`rounded-lg p-3 ${subBill.paid ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                  <div className="flex justify-between font-bold">
                    <span>Total: ${subBill.total.toFixed(2)}</span>
                    {subBill.paid && <span className="text-emerald-600 dark:text-emerald-300">Pagado ({subBill.paymentMethod})</span>}
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {subBill.items.map((item) => (
                      <li key={item.id}>{item.name} x{item.quantity}</li>
                    ))}
                  </ul>
                  {!subBill.paid && (
                    <div className="mt-2 flex gap-2">
                      {Object.values(PaymentMethod).map((method) => (
                        <button key={method} onClick={() => handlePaySubBill(subBill.id, method)} className="flex-1 rounded bg-slate-500 px-2 py-1 text-xs text-white transition-colors hover:bg-slate-600">
                          {method}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {splitType === 'equal' && (
        <div className="text-center">
          <label className="mb-2 block">Dividir en cuantas partes?</label>
          <input
            type="number"
            value={equalParts}
            onChange={(e) => setEqualParts(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 rounded border border-slate-300 p-2 text-center dark:border-slate-600 dark:bg-slate-700"
          />
          <p className="mt-4 text-2xl font-bold">${(total / equalParts).toFixed(2)} por parte</p>
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <button onClick={handleCloseTable} disabled={false} className="w-full rounded bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-400">
          Cerrar Mesa
        </button>
      </div>
    </Modal>
  );
};

export default SplitBillModal;
