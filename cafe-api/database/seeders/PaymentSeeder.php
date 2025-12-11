<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $index => $order) {
            $paymentMethods = ['ewallet', 'transfer', 'cash', 'card'];

            Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'payment_method' => $paymentMethods[$index % count($paymentMethods)],
                'status' => 'paid',
                'transaction_id' => 'TRX-' . uniqid(),
                'paid_at' => now(),
            ]);
        }

        echo "✓ Payments seeded successfully!\n";
    }
}
