<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderController extends Controller
{
    /**
     * GET LIST ORDER
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $orders = Order::with(['orderItems.menuItem', 'payment', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $orders = Order::with(['orderItems.menuItem', 'payment'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * CREATE ORDER
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();

        DB::beginTransaction();

        try {

            // Hitung total
            $total = 0;
            foreach ($validated['items'] as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                $total += $menu->price * $item['quantity'];
            }

            // Generate order number
            $orderNumber = 'ORD-' . strtoupper(uniqid());

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $total,
                'status' => 'pending'
            ]);

            // Simpan item order
            foreach ($validated['items'] as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                $subtotal = $menu->price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $menu->price,
                    'subtotal' => $subtotal
                ]);
            }

            // Ambil semua admin
            $admins = \App\Models\User::where('role', 'admin')->get();

            // Buat deskripsi order
            $orderDesc = "";
            foreach ($validated['items'] as $item) {
                $menu = MenuItem::find($item['menu_item_id']);
                $orderDesc .= $menu->name . " × " . $item['quantity'] . ", ";
            }
            $orderDesc = rtrim($orderDesc, ", ");

            // Kirim notifikasi ke semua admin
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'Order Baru #' . $order->order_number,
                    'message' => "Pesanan dari {$user->name}: " . $orderDesc,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => Order::with([
                    'orderItems.menuItem',
                    'user',
                    'payment'
                ])->find($order->id)
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * SHOW ORDER + MIDTRANS TOKEN
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $order = Order::with(['orderItems.menuItem', 'payment', 'user'])->find($id);
        } else {
            $order = Order::with(['orderItems.menuItem', 'payment', 'user'])
                ->where('user_id', $user->id)
                ->find($id);
        }

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $payment = $order->payment;
        if ($payment && !empty($payment->snap_token)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $order,
                    'snap_token' => $payment->snap_token
                ]
            ]);
        }

        \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
        // \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        // Transaction Details
        $transaction_details = [
            'order_id' => 'order-' . $order->id . '-' . time(),
            'gross_amount' => (int) $order->total_amount,
        ];

        $customer_details = [
            'first_name' => $order->user->name,
            'email'      => $order->user->email,
            'phone'      => $order->user->phone ?? '',
        ];

        $item_details = [];
        foreach ($order->orderItems as $item) {
            $item_details[] = [
                'id' => $item->menu_item_id,
                'price' => (int) $item->price,
                'quantity' => (int) $item->quantity,
                'name' => $item->menuItem->name,
            ];
        }

        $enable_payments = ['gopay', 'qris', 'bank_transfer', 'credit_card'];

        // MIDTRANS TRANSACTION
        $transaction = [
            'enabled_payments' => $enable_payments,
            'transaction_details' => $transaction_details,
            'customer_details' => $customer_details,
            'item_details' => $item_details,

            'callbacks' => [
                'finish' => 'localhost:5173/payment/finish',
                'error'  => 'localhost:5173/payment/error',
                'pending' => 'localhost:5173/payment/pending',
            ],
        ];


        try {
            $snapToken = \Midtrans\Snap::getSnapToken($transaction);

            // Save to DB
            Payment::create([
                'order_id' => $order->id,
                'snap_token' => $snapToken,
                'amount' => $order->total_amount,
                'status' => 'pending'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Midtrans error: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'snap_token' => $snapToken
            ]
        ]);
    }
    /**
     * UPDATE STATUS ORDER
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }
}
