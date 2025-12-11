<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    //  GET ALL PAYMENTS
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            // Admin lihat semua payments
            $payments = Payment::with(['order.user'])->orderBy('created_at', 'desc')->get();
        } else {
            // Customer lihat paymentnya sendiri
            $payments = Payment::with(['order.user', 'order.orderItems.menuItem'])
                ->whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // CREATE PAYMENT MANUAL
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:cash,transfer,ewallet,card,qris,gopay,bank_transfer,shopeepay,credit_card',
            'transaction_id' => 'nullable|string',
        ]);

        $order = Order::find($validated['order_id']);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if ($order->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment already exists for this order'
            ], 400);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => $order->total_amount,
            'payment_method' => $validated['payment_method'] ?? 'qris',
            'status' => 'pending',
            'transaction_id' => $validated['transaction_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment created successfully',
            'data' => $payment
        ], 201);
    }

    // SHOW PAYMENT BY ID
    public function show($id)
    {
        $payment = Payment::with(['order.orderItems.menuItem', 'order.user'])->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    // UPDATE PAYMENT STATUS
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,failed'
        ]);

        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        // Update payment status
        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === 'paid') {
            $updateData['paid_at'] = now();

            // Update order status ketika payment berhasil
            $payment->order->update([
                'status' => 'processing'
            ]);
        }

        $payment->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
            'data' => $payment->load('order')
        ]);
    }

    // GET PAYMENT BY ORDER ID
    public function getByOrder($orderId)
    {
        $payment = Payment::with(['order.orderItems.menuItem', 'order.user'])
            ->where('order_id', $orderId)
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    // UPDATE PAYMENT STATUS FROM MIDTRANS
    // Endpoint: POST /payment/update-status
    public function updatePaymentStatus(Request $request)
    {
        $validated = $request->validate([
            'order_id'            => 'required|string',
            'transaction_status'  => 'required|string',
            'payment_type'        => 'nullable|string',
            'transaction_id'      => 'nullable|string', // jika Midtrans kirim
        ]);

        $order = Order::where('order_number', $validated['order_id'])->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        // Buat payment jika belum ada
        if (!$order->payment) {
            Payment::create([
                'order_id'       => $order->id,
                'amount'         => $order->total_amount,
                'payment_method' => $validated['payment_type'] ?? 'midtrans',
                'status'         => 'pending',
                'transaction_id' => $validated['transaction_id'] ?? null,
            ]);
        }

        $payment = $order->payment;
        $trans = $validated['transaction_status'];

         // STATUS = SUCCESS (SETTLEMENT)
        if ($trans === 'settlement') {
            $payment->update([
                'status'          => 'paid',
                'payment_method'  => $validated['payment_type'],  // QRIS, Gopay, VA
                'transaction_id'  => $validated['transaction_id'] ?? $payment->transaction_id,
                'paid_at'         => now(),
            ]);

            $order->update(['status' => 'processing']);
        }

         // STATUS = PENDING
        elseif ($trans === 'pending') {
            $payment->update([
                'status'          => 'pending',
                'transaction_id'  => $validated['transaction_id'] ?? $payment->transaction_id,
            ]);

            $order->update(['status' => 'pending']);
        }

         // STATUS = GAGAL / EXPIRE / CANCEL
        elseif (in_array($trans, ['deny', 'expire', 'cancel'])) {
            $payment->update([
                'status'          => 'failed',
                'transaction_id'  => $validated['transaction_id'] ?? $payment->transaction_id,
            ]);

            $order->update(['status' => 'failed']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
            'data'    => [
                'order'   => $order,
                'payment' => $payment
            ]
        ]);
    }

        // MIDTRANS WEBHOOK (REAL NOTIFICATION)
        // Endpoint: POST /midtrans/webhook
    public function handleWebhook(Request $request)
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? null;
        $transactionId = $payload['transaction_id'] ?? null;

        if (!$orderId) {
            return response()->json(['message' => 'Invalid webhook'], 400);
        }

        // order_id Midtrans format: {order_number}-{timestamp}
        $orderNumber = explode('-', $orderId)[0];

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Create payment if missing
        if (!$order->payment) {
            Payment::create([
                'order_id'       => $order->id,
                'amount'         => $order->total_amount,
                'payment_method' => $paymentType ?? 'midtrans',
                'status'         => 'pending',
                'transaction_id' => $transactionId,
            ]);
        }

        $payment = $order->payment;

        // STATUS SETTLEMENT / SUCCESS
        if ($transactionStatus === 'capture' && $fraudStatus === 'accept') {
            $payment->update([
                'status'         => 'paid',
                'payment_method' => $paymentType,
                'transaction_id' => $transactionId,
                'paid_at'        => now(),
            ]);
            $order->update(['status' => 'processing']);
        }

        elseif ($transactionStatus === 'settlement') {
            $payment->update([
                'status'         => 'paid',
                'payment_method' => $paymentType,
                'transaction_id' => $transactionId,
                'paid_at'        => now(),
            ]);
            $order->update(['status' => 'processing']);
        }

        // STATUS PENDING
        elseif ($transactionStatus === 'pending') {
            $payment->update([
                'status'         => 'pending',
                'transaction_id' => $transactionId,
            ]);

            $order->update(['status' => 'pending']);
        }

        // STATUS FAILED / EXPIRE / CANCEL
        elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $payment->update([
                'status'         => 'failed',
                'transaction_id' => $transactionId,
            ]);

            $order->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }
}


