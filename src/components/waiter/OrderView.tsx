import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWaiterAppContext } from '../../context/WaiterAppContext';
import api from '../../services/api';
import { MenuItem as MenuItemType, Order, OrderItem } from '../../types';
import { ArrowRightIcon, BanIcon, PencilIcon, PlusIcon, TrashIcon } from '../icons';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import SplitBillModal from './SplitBillModal';

interface NoteModalProps {
  item: OrderItem;
  onClose: () => void;
  onSave: (note: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ item, onClose, onSave }) => {
  const [note, setNote] = useState(item.note || '');

  return (
    <Modal title={`Nota para: ${item.name}`} onClose={onClose}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="h-32 w-full rounded border border-slate-300 bg-slate-50 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
        placeholder="Ej: sin cebolla, termino medio, etc."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            onSave(note);
            onClose();
          }}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white transition-colors hover:bg-indigo-700"
        >
          Guardar Nota
        </button>
      </div>
    </Modal>
  );
};

interface PromotionModalProps {
  promotion: MenuItemType;
  onClose: () => void;
  onConfirm: (promotion: MenuItemType, selections: { menuItemId: string; name: string }[]) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onClose, onConfirm }) => {
  const { menuItems } = useWaiterAppContext();
  const [selections, setSelections] = useState<MenuItemType[]>([]);

  const options = useMemo(
    () =>
      promotion.promotionOptions
        ?.map((optionId) => menuItems.find((item) => item.id === optionId))
        .filter((item): item is MenuItemType => Boolean(item)) || [],
    [menuItems, promotion]
  );

  return (
    <Modal title={`Seleccionar para: ${promotion.name}`} onClose={onClose}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-bold">Opciones Validas</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  if (selections.length < 2) {
                    setSelections([...selections, option]);
                  }
                }}
                disabled={selections.length >= 2}
                className="w-full rounded-lg bg-white p-3 text-left shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <p className="font-semibold">{option.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">${option.price.toFixed(2)} (Precio individual)</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-bold">Seleccionados ({selections.length} / 2)</h3>
          <div className="min-h-[12rem] space-y-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-900/50">
            {selections.map((selection, index) => (
              <div key={`${selection.id}-${index}`} className="flex items-center justify-between rounded-md bg-indigo-100 p-2 dark:bg-indigo-900/50">
                <span className="font-medium">{selection.name}</span>
                <button onClick={() => setSelections(selections.filter((_, selectionIndex) => selectionIndex !== index))} className="text-xl font-bold text-rose-500 hover:text-rose-700">
                  &times;
                </button>
              </div>
            ))}
            {selections.length === 0 && <p className="pt-10 text-center text-slate-500">Agrega 2 productos de la lista.</p>}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
        <button
          onClick={() =>
            onConfirm(
              promotion,
              selections.map((selection) => ({ menuItemId: selection.id, name: selection.name }))
            )
          }
          disabled={selections.length !== 2}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-400"
        >
          Confirmar Seleccion
        </button>
      </div>
    </Modal>
  );
};

const MenuItemCard: React.FC<{ item: MenuItemType; onAdd: () => void }> = ({ item, onAdd }) => (
  <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
    <div>
      <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
      <p className="text-sm text-slate-500 dark:text-slate-300">${item.price.toFixed(2)}</p>
    </div>
    <button onClick={onAdd} className="rounded-full bg-indigo-500 p-2 text-white transition-colors hover:bg-indigo-600">
      <PlusIcon className="h-5 w-5" />
    </button>
  </div>
);

const OrderView: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { currentUser, fetchData, menuItems, tables } = useWaiterAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSplitBillModalOpen, setSplitBillModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [promoToConfigure, setPromoToConfigure] = useState<MenuItemType | null>(null);
  const [editingNoteFor, setEditingNoteFor] = useState<OrderItem | null>(null);

  const table = useMemo(() => tables.find((item) => item.id === tableId), [tableId, tables]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!table?.orderId) {
        navigate('/');
        return;
      }

      const fetchedOrder = await api.getOrderById(table.orderId);
      if (!fetchedOrder) {
        navigate('/');
        return;
      }

      setOrder(fetchedOrder);
      setOrderItems(fetchedOrder.items);
    };

    if (table) {
      void loadOrder();
    }
  }, [navigate, table]);

  const total = useMemo(() => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [orderItems]);

  const filteredMenu = useMemo(() => {
    const categories: Record<string, MenuItemType[]> = {};
    menuItems
      .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach((item) => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });
    return categories;
  }, [menuItems, searchTerm]);

  const pendingChanges = JSON.stringify(order?.items ?? []) !== JSON.stringify(orderItems);
  const handleSaveChanges = async () => {
    if (!order) {
      return;
    }

    const canceledItems = order.items.filter((item) => item.status === 'pending' && !orderItems.find((orderItem) => orderItem.id === item.id));

    try {
      const updatedOrder = await api.updateOrder(order.id, orderItems, canceledItems, currentUser);
      await fetchData();
      setOrder(updatedOrder);
      setOrderItems(updatedOrder.items);
      alert('Orden actualizada');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar la orden.');
    }
  };

  if (!order) {
    return <div className="flex h-screen items-center justify-center">Cargando orden...</div>;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-slate-100 p-6 dark:bg-slate-900 lg:grid-cols-2">
      <div className="flex max-h-screen flex-col">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            &larr; Volver a Mesas
          </button>
          <h1 className="text-3xl font-bold">Mesa: {table?.name}</h1>
        </div>

        <Card className="flex flex-grow flex-col p-4">
          <h2 className="mb-4 px-2 text-xl font-bold">Resumen del Pedido</h2>
          <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {orderItems.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-lg p-3 ${item.status === 'sent' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-sky-100 dark:bg-sky-900/50'}`}>
                <div className="flex-grow">
                  <p className="font-semibold">{item.name}</p>
                  {item.note && <p className="text-xs italic text-amber-600 dark:text-amber-400">Nota: {item.note}</p>}
                  {item.promotionSelections && (
                    <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400">
                      {item.promotionSelections.map((selection, index) => (
                        <li key={`${selection.menuItemId}-${index}`}>{selection.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-center font-bold">{item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => setEditingNoteFor(item)} className="rounded-full bg-slate-200 p-1 hover:bg-slate-300 dark:bg-slate-600">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => setOrderItems(orderItems.filter((orderItem) => orderItem.id !== item.id))} className="rounded-full bg-rose-100 p-1 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/50">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="w-20 text-right font-bold">${(item.quantity * item.price).toFixed(2)}</div>
              </div>
            ))}
            {orderItems.length === 0 && <p className="py-8 text-center text-slate-500">No hay productos en la orden.</p>}
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between text-2xl font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={handleSaveChanges} disabled={!pendingChanges} className="w-full rounded-lg bg-amber-500 px-4 py-3 font-bold text-white transition-colors hover:bg-amber-600 disabled:bg-slate-400">
              Guardar Cambios
            </button>
            <button
              onClick={async () => {
                await handleSaveChanges();
                try {
                  await api.sendOrderToKitchen(order.id);
                  await fetchData();
                  const refreshedOrder = await api.getOrderById(order.id);
                  if (refreshedOrder) {
                    setOrder(refreshedOrder);
                    setOrderItems(refreshedOrder.items);
                  }
                  alert('Pedido enviado a cocina.');
                } catch (err) {
                  console.error('Error sending order to kitchen:', err);
                  alert('Error al enviar a cocina.');
                }
              }}
              disabled={false}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-600 disabled:bg-slate-400"
            >
              Enviar a Cocina
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setSplitBillModalOpen(true)} disabled={false} className="col-span-2 w-full rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-400">
              Dividir y Cobrar
            </button>
            <button onClick={() => setIsCancelModalOpen(true)} disabled={pendingChanges} className="col-span-2 mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-3 font-bold text-white transition-colors hover:bg-rose-600 disabled:bg-slate-400">
              <BanIcon className="h-5 w-5" />
              Cancelar Mesa
            </button>
          </div>
        </Card>
      </div>

      <div className="flex max-h-screen flex-col">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        />
        <Card className="flex-grow p-4">
          <div className="h-full space-y-6 overflow-y-auto pr-2">
            {Object.keys(filteredMenu).map((category) => (
              <div key={category}>
                <h3 className="mb-3 border-b border-slate-200 pb-2 text-lg font-bold dark:border-slate-700">{category}</h3>
                <div className="space-y-3">
                  {filteredMenu[category].map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={() => {
                        if (item.isPromotion) {
                          setPromoToConfigure(item);
                          return;
                        }

                        setOrderItems([
                          ...orderItems,
                          {
                            id: `item-${Date.now()}`,
                            menuItemId: item.id,
                            quantity: 1,
                            price: item.price,
                            name: item.name,
                            status: 'pending',
                          },
                        ]);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {isSplitBillModalOpen && <SplitBillModal order={order} orderItems={orderItems} total={total} onClose={() => setSplitBillModalOpen(false)} />}

      {isCancelModalOpen && (
        <Modal title="Confirmar Cancelacion" onClose={() => setIsCancelModalOpen(false)}>
          <div className="text-center">
            <p className="mb-6 text-lg">Esta accion eliminara la orden completa y liberara la mesa. No se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setIsCancelModalOpen(false)} className="rounded-lg bg-slate-300 px-6 py-2 font-bold text-slate-800 transition-colors hover:bg-slate-400">
                Mantener Orden
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.cancelTable(order.id, currentUser);
                    await fetchData();
                    alert('Mesa y orden canceladas.');
                    navigate('/');
                  } catch (err) {
                    console.error('Error canceling table:', err);
                    alert('Error al cancelar la mesa.');
                  } finally {
                    setIsCancelModalOpen(false);
                  }
                }}
                className="rounded-lg bg-rose-500 px-6 py-2 font-bold text-white transition-colors hover:bg-rose-600"
              >
                Confirmar Cancelacion
              </button>
            </div>
          </div>
        </Modal>
      )}

      {promoToConfigure && (
        <PromotionModal
          promotion={promoToConfigure}
          onClose={() => setPromoToConfigure(null)}
          onConfirm={(promotion, selections) => {
            setOrderItems([
              ...orderItems,
              {
                id: `item-${Date.now()}`,
                menuItemId: promotion.id,
                quantity: 1,
                price: promotion.price,
                name: promotion.name,
                status: 'pending',
                promotionSelections: selections,
              },
            ]);
            setPromoToConfigure(null);
          }}
        />
      )}

      {editingNoteFor && (
        <NoteModal
          item={editingNoteFor}
          onClose={() => setEditingNoteFor(null)}
          onSave={(note) => {
            setOrderItems(orderItems.map((item) => (item.id === editingNoteFor.id ? { ...item, note } : item)));
            setEditingNoteFor(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderView;
