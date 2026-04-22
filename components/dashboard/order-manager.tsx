"use client";

import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
// Using native HTML table with Tailwind classes
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, CheckCircle, Clock, Truck, Package, Eye, Receipt, X, Printer, DollarSign, Package2 } from "lucide-react";
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
  customer_whatsapp?: string;
  total_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'completed' | 'in_progress';
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
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
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
    case 'in_progress':
      return 'in_progress';
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'total_cents' | 'customer_name' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('Store');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // 50 orders per page

  const toggleSelectAll = () => {
    const visibleOrderIds = paginatedOrders.map(o => o.id);
    if (selectedOrders.length === visibleOrderIds.length && selectedOrders.every(id => visibleOrderIds.includes(id))) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(visibleOrderIds);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const bulkUpdateStatus = async (status: Order['status']) => {
    await Promise.all(selectedOrders.map(id => updateOrderStatus(id, status)));
    setSelectedOrders([]);
  };

  const supabase = createBrowserSupabaseClient();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, dateFrom, dateTo]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    console.log('📦 Fetching orders for storeId:', storeId);
    try {
      // Fetch store name
      const { data: storeData } = await supabase
        .from('stores')
        .select('name')
        .eq('id', storeId)
        .single();
      setStoreName(storeData?.name || 'Store');

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

    // Date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(order => new Date(order.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.created_at) <= toDate);
    }

    // Sort
    return filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'total_cents':
          aVal = a.total_cents;
          bVal = b.total_cents;
          break;
        case 'customer_name':
          aVal = a.customer_name.toLowerCase();
          bVal = b.customer_name.toLowerCase();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, activeFilter, searchQuery, dateFrom, dateTo, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / pageSize);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Summary stats
  const summaryStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let totalRevenueToday = 0;
    let pendingDeliveries = 0;
    const totalOrders = orders.length;
    let completedOrders = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= today && orderDate < tomorrow) {
        if (order.status === 'paid' || order.status === 'fulfilled' || order.status === 'completed') {
          totalRevenueToday += order.total_cents;
        }
      }
      if (order.status === 'pending' || order.status === 'in_progress') {
        pendingDeliveries++;
      }
      if (order.status === 'fulfilled') {
        completedOrders++;
      }
    });

    return {
      totalRevenueToday,
      pendingDeliveries,
      totalOrders,
      completedOrders,
    };
  }, [orders]);

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
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-24 flex-shrink-0"
              placeholder="From date"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-24 flex-shrink-0"
              placeholder="To date"
            />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" className="flex-1 min-w-0 sm:flex-none" onClick={() => bulkUpdateStatus('paid')}>
            Mark as Paid ({selectedOrders.length})
          </Button>
          <Button size="sm" className="flex-1 min-w-0 sm:flex-none" onClick={() => bulkUpdateStatus('fulfilled')}>
            Mark as Delivered ({selectedOrders.length})
          </Button>
          <Button size="sm" variant="destructive" className="flex-1 min-w-0 sm:flex-none" onClick={() => bulkUpdateStatus('cancelled')}>
            Archive ({selectedOrders.length})
          </Button>
          <Button size="sm" variant="outline" className="flex-1 min-w-0 sm:flex-none" onClick={() => setSelectedOrders([])}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue Today</p>
                <p className="text-2xl font-bold">{formatMoney(summaryStats.totalRevenueToday, 'BND')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Delivery</p>
                <p className="text-2xl font-bold">{summaryStats.pendingDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{summaryStats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{summaryStats.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg overflow-hidden bg-card terminal-table overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="w-12 p-4">
                <Checkbox
                  checked={selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-muted/50" onClick={() => handleSort('created_at')}>
                Order ID {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-muted/50" onClick={() => handleSort('customer_name')}>
                Customer {sortBy === 'customer_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">Items</th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-muted/50" onClick={() => handleSort('total_cents')}>
                Total {sortBy === 'total_cents' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="text-left p-4 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
               <th className="hidden sm:table-cell text-left p-4 font-mono text-xs font-bold uppercase tracking-wider">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? 'No orders match your search.'
                    : activeFilter === 'all'
                      ? 'No orders found. Orders will appear here after customers make purchases.'
                      : `No orders found for "${activeFilter}" filter.`
                  }
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[getDisplayStatus(order.status)] || STATUS_CONFIG.pending; // Fallback to pending

                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
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
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
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
                           <SelectItem value="in_progress" className="font-mono text-xs">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-500" />
                               In Progress
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
                    <td className="hidden sm:table-cell p-4">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto print-receipt">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-mono">
                  Order {selectedOrder?.id.slice(-8).toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  Order details and customer information
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const printWindow = window.open('', '_blank', 'width=400,height=600');
                  if (printWindow && selectedOrder) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Order Receipt</title>
                          <style>
                            body { font-family: monospace; font-size: 12px; margin: 10px; }
                            h1 { text-align: center; font-size: 14px; margin-bottom: 5px; }
                            p { margin: 3px 0; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { text-align: left; padding: 2px; }
                            .total { font-weight: bold; }
                          </style>
                        </head>
                        <body>
                          <h1>${storeName} Order Receipt</h1>
                          <p>Order ID: ${selectedOrder.id.slice(-8).toUpperCase()}</p>
                          <p>Date: ${new Date(selectedOrder.created_at).toLocaleString()}</p>
                          <p>Customer: ${selectedOrder.customer_name}</p>
                          <p>Address: ${selectedOrder.customer_address}</p>
                          ${selectedOrder.customer_whatsapp ? `<p>WhatsApp: ${selectedOrder.customer_whatsapp}</p>` : ''}
                          ${selectedOrder.customer_notes ? `<p>Notes: ${selectedOrder.customer_notes}</p>` : ''}
                          <table>
                            <thead>
                              <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                              ${selectedOrder.order_items.map(item => `
                                <tr>
                                  <td>${item.name}</td>
                                  <td>${item.quantity}</td>
                                  <td>$${(item.price_cents / 100).toFixed(2)}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                          <p class="total">Total: $${(selectedOrder.total_cents / 100).toFixed(2)}</p>
                          <p>Status: ${selectedOrder.status}</p>
                          <p>Powered by NodeBN</p>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </DialogHeader>

          {/* Print Header - Hidden on screen, visible on print */}
          <div className="print-header" style={{ display: 'none' }}>
            <h1 style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', fontVariant: 'small-caps', letterSpacing: '1px', marginBottom: '5px' }}>
              {storeName} ORDER RECEIPT
            </h1>
            <p style={{ textAlign: 'center', fontSize: '10px', marginBottom: '3px' }}>
              Order #{selectedOrder?.id.slice(-8).toUpperCase()}
            </p>
            <p style={{ textAlign: 'center', fontSize: '9px' }}>
              {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString() : ''}
            </p>
          </div>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_address}</p>
                  {selectedOrder.customer_whatsapp && (
                    <p className="text-sm text-muted-foreground">WhatsApp: {selectedOrder.customer_whatsapp}</p>
                  )}
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

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: auto;
              margin: 5mm;
            }
            body {
              font-family: 'Lucida Console', 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.2;
              color: #000;
            }
            .print-receipt {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 10px !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }
            .print-receipt * {
              font-family: inherit !important;
              font-size: 9px !important;
              line-height: 1.1 !important;
              margin: 0 !important;
              padding: 0 !important;
              color: #000 !important;
            }
            /* Show print header, hide dialog header */
            .print-header {
              display: block !important;
              margin-bottom: 10px !important;
              border-bottom: 1px solid #000 !important;
              padding-bottom: 5px !important;
            }
            .print-receipt [role="dialog"] > div:first-child {
              display: none !important;
            }
            /* Order Info */
            .print-receipt .space-y-6 > div:first-child h4 {
              font-size: 10px !important;
              text-align: center !important;
              margin-bottom: 5px !important;
            }
            .print-receipt .grid {
              display: block !important;
              margin-bottom: 8px !important;
            }
            .print-receipt .grid > div {
              display: block !important;
              margin-bottom: 3px !important;
            }
            .print-receipt .grid > div h4 {
              font-size: 9px !important;
              margin-bottom: 2px !important;
            }
            /* Items Table */
            .print-receipt table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 5px 0 !important;
              font-size: 8px !important;
            }
            .print-receipt table th {
              text-align: left !important;
              padding: 2px 0 !important;
              font-weight: bold !important;
              border-bottom: 1px dashed #000 !important;
            }
            .print-receipt table td {
              padding: 1px 0 !important;
              vertical-align: top !important;
            }
            .print-receipt table .text-right {
              text-align: right !important;
            }
            /* Total Section */
            .print-receipt .space-y-6 > div:last-child {
              border-top: 1px solid #000 !important;
              padding-top: 5px !important;
              margin-top: 8px !important;
            }
            .print-receipt .space-y-6 > div:last-child p {
              margin-bottom: 2px !important;
            }
            .print-receipt .space-y-6 > div:last-child p strong {
              font-weight: bold !important;
            }
            /* Footer */
            .print-receipt::after {
              content: "Thank you for your order!\\A Powered by NodeBN";
              display: block;
              text-align: center !important;
              font-size: 9px !important;
              font-style: italic !important;
              font-weight: bold !important;
              font-variant: small-caps !important;
              letter-spacing: 0.5px !important;
              margin-top: 15px !important;
              white-space: pre-line !important;
              border-top: 2px solid #000 !important;
              padding-top: 10px !important;
            }
            /* Hide UI elements */
            .print-receipt button,
            .print-receipt .hidden,
            .print-receipt [role="dialog"] > * > *:first-child {
              display: none !important;
            }
            /* Force single page */
            .print-receipt {
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
            }
            /* Hide everything else */
            body > *:not(.print-receipt) {
              display: none !important;
            }
          }
        `
      }} />
    </div>
  );
}

export const OrderManager = memo(OrderManagerComponent);