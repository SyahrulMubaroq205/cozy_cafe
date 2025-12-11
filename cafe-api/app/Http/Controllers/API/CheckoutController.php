<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\MenuItem;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        // Validasi request
        $request->validate([
            'cart' => 'required|array|min:1',
            'payment_method' => 'required|string'
        ]);

        $user = $request->user();
        $cart = $request->cart;

        DB::beginTransaction();
        try {
            // Hitung total
            $total = collect($cart)->sum(fn($i) => $i['price'] * $i['quantity']);

            // Generate order number
            $orderNumber = "ORD-" . now()->format("Ymd") . "-" . strtoupper(Str::random(10));

            // Buat order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $total,
                'status' => 'pending'
            ]);

            // Buat order items & kurangi stok menu item
            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                    'notes' => $item['notes'] ?? null,
                ]);

                // Kurangi stok
                $menuItem = MenuItem::find($item['menu_item_id']);
                if ($menuItem) {
                    $menuItem->stock = max(0, $menuItem->stock - $item['quantity']);
                    $menuItem->save();
                }
            }

            // (Dummy) Snap Token Midtrans
            // Nanti kalau mau real tinggal ganti real Midtrans Snap
            $snapToken = "SNAP-TOKEN-" . strtoupper(Str::random(20));

            // Buat payment data awal
            $payment = Payment::create([
                'order_id' => $order->id,
                'amount' => $total,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
                'transaction_id' => null,
                'paid_at' => null
            ]);

            DB::commit();

            // Load relasi supaya front-end bisa akses orderItems & payment
            $order->load('orderItems', 'payment');

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order,
                'snap_token' => $snapToken 
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
