"use client";

import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Using native HTML table with Tailwind classes
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, CheckCircle, Clock, Truck, Package, Eye, Receipt, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_notes: string;
  total_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'completed';
  whatsapp_message: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

type FilterType = 'all' | 'unpaid' | 'to_deliver' | 'completed';

interface OrderManagerProps {
  storeId: string;
}

// Status configuration for UI display
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  fulfilled: { label: 'Fulfilled', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  completed: { label: 'Pending', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' }, // Map completed to pending for display
} as const;

// Display mapping for dashboard
const getDisplayStatus = (orderStatus: string): keyof typeof STATUS_CONFIG => {
  // Map database statuses to display statuses
  switch (orderStatus) {
    case 'completed':
      return 'pending'; // New orders show as "pending" in dashboard
    case 'paid':
      return 'paid';
    case 'fulfilled':
      return 'fulfilled';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    default:
      return 'pending'; // Default to pending for unknown statuses
  }
};

function OrderManagerComponent({ storeId }: OrderManagerProps) {
  console.log('🎯 OrderManager component loaded for storeId:', storeId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);



  const supabase = createBrowserSupabaseClient();

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    console.log('📦 Fetching orders for storeId:', storeId);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Orders fetched:', data?.length || 0, 'orders');
      setOrders(data || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Status filter
      switch (activeFilter) {
        case 'unpaid':
          return order.status === 'pending';
        case 'to_deliver':
          return order.status === 'paid';
        case 'completed':
          return order.status === 'fulfilled';
        default:
          return true;
      }
    });

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.whatsapp_message?.toLowerCase().includes(query)
      );
    }

    // Sort: Paid orders not fulfilled for >24 hours first, then by newest
    return filtered.sort((a, b) => {
      const aIsOverdue = a.status === 'paid' && (Date.now() - new Date(a.updated_at).getTime()) > 24 * 60 * 60 * 1000;
      const bIsOverdue = b.status === 'paid' && (Date.now() - new Date(b.updated_at).getTime()) > 24 * 60 * 60 * 1000;

      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders, activeFilter, searchQuery]);

  // Manual status update for tracking purposes
  const updateOrderStatus = async (orderId: string, uiStatus: Order['status']) => {
    // Store UI status directly in database (dashboard overrides inventory logic)
    const databaseStatus: string = uiStatus;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: databaseStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state with UI status
      setOrders(prev => {
        const updated = prev.map(order =>
          order.id === orderId
            ? { ...order, status: uiStatus, updated_at: new Date().toISOString() }
            : order
        );
        console.log('✅ Local state updated to:', updated.find(o => o.id === orderId)?.status);
        return updated;
      });

      console.log('✅ Order status updated:', { orderId, uiStatus, databaseStatus });
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Items', 'Total', 'Status', 'Date'];
    const csvData = filteredAndSortedOrders.map(order => [
      order.id,
      order.customer_name,
      order.order_items.map(item => `${item.name} (${item.quantity})`).join('; '),
      `$${(order.total_cents / 100).toFixed(2)}`,
      STATUS_CONFIG[order.status].label,
      new Date(order.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-muted-foreground">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Order Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage customer orders
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          variant="outline"
          size="sm"
          className="high-contrast-button flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { key: 'all', label: 'All', count: orders.length },
            { key: 'unpaid', label: 'Unpaid', count: orders.filter(o => o.status === 'pending').length },
            { key: 'to_deliver', label: 'To Deliver', count: orders.filter(o => o.status === 'paid').length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'fulfilled').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as FilterType)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors high-contrast-button ${
                activeFilter === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden bg-card terminal-table">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Order ID</th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Customer</th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Items</th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Total</th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Status</th>
               <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? 'No orders match your search.'
                    : activeFilter === 'all'
                      ? 'No orders found. Orders will appear here after customers make purchases.'
                      : `No orders found for "${activeFilter}" filter.`
                  }
                </td>
              </tr>
            ) : (
              filteredAndSortedOrders.map((order) => {
                const isOverdue = order.status === 'paid' &&
                  (Date.now() - new Date(order.updated_at).getTime()) > 24 * 60 * 60 * 1000;

                const statusConfig = STATUS_CONFIG[getDisplayStatus(order.status)] || STATUS_CONFIG.pending; // Fallback to pending

                return (
                  <tr
                    key={order.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                      isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-mono text-xs">
                      {order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 font-medium">
                      {order.customer_name}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="p-4 font-mono font-medium">
                      ${(order.total_cents / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <Select
                        value={getDisplayStatus(order.status)}
                        onValueChange={(value: Order['status']) => {
                          console.log('Dropdown change:', { orderId: order.id, from: getDisplayStatus(order.status), to: value });
                          updateOrderStatus(order.id, value);
                        }}
                      >
                        <SelectTrigger className="w-32 h-8 font-mono text-xs border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending" className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value="paid" className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Paid
                            </div>
                          </SelectItem>
                          <SelectItem value="fulfilled" className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-500" />
                              Fulfilled
                            </div>
                          </SelectItem>
                          <SelectItem value="cancelled" className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Cancelled
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {/* View Button - Read-only access */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="minimalist-button font-mono text-xs px-2 py-1 h-7"
                          title="View order details"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">
              Order {selectedOrder?.id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Order details and customer information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_address}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Order Info</h4>
                  <div className="text-sm">
                    Status: <Badge variant="outline" className="ml-1">
                      {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-mono text-sm">${(item.price_cents / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono font-semibold">
                    ${(selectedOrder.total_cents / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Info */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Status</h4>
                <Badge variant="outline" className="text-sm">
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status || 'Unknown'}
                </Badge>
              </div>

              {/* WhatsApp Message */}
              {selectedOrder.whatsapp_message && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">WhatsApp Message</h4>
                  <p className="text-sm bg-muted p-3 rounded font-mono">
                    {selectedOrder.whatsapp_message}
                  </p>
                </div>
              )}

              {/* Customer Notes */}
              {selectedOrder.customer_notes && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Customer Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedOrder.customer_notes}
                  </p>
                </div>
              )}

              {/* Order Timeline */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Order Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <span className="font-medium">Order Created</span>
                      <span className="text-muted-foreground ml-2">
                        {new Date(selectedOrder.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.status !== 'pending' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        selectedOrder.status === 'paid' ? 'bg-green-500' :
                        selectedOrder.status === 'fulfilled' ? 'bg-gray-500' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <span className="font-medium">Status Updated</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(selectedOrder.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.id);
                      alert('Order ID copied to clipboard');
                    }}
                    className="text-xs"
                  >
                    📋 Copy Order ID
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const orderData = {
                        id: selectedOrder.id,
                        customer: selectedOrder.customer_name,
                        items: selectedOrder.order_items.length,
                        total: `$${(selectedOrder.total_cents / 100).toFixed(2)}`,
                        status: selectedOrder.status,
                        date: new Date(selectedOrder.created_at).toLocaleDateString()
                      };
                      const printContent = `
                        Order Details:
                        ID: ${orderData.id}
                        Customer: ${orderData.customer}
                        Items: ${orderData.items}
                        Total: ${orderData.total}
                        Status: ${STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                        Date: ${orderData.date}
                      `;
                      const printWindow = window.open('', '_blank');
                      printWindow?.document.write(`<pre>${printContent}</pre>`);
                      printWindow?.print();
                    }}
                    className="text-xs"
                  >
                    🖨️ Print Details
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const OrderManager = memo(OrderManagerComponent);