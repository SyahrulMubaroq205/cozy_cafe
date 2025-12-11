<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customer1 = User::where('email', 'budi@example.com')->first();
        $customer2 = User::where('email', 'siti@example.com')->first();

        $kopi = MenuItem::where('name', 'Kopi Susu')->first();
        $teh = MenuItem::where('name', 'Es Teh Manis')->first();
        $pisangGoreng = MenuItem::where('name', 'Pisang Goreng')->first();
        $nasiGoreng = MenuItem::where('name', 'Nasi Goreng Spesial')->first();
        $latte = MenuItem::where('name', 'Caffe Latte')->first();

        // Order 1 - Customer 1
        $order1 = Order::create([
            'user_id' => $customer1->id,
            'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid()),
            'total_amount' => 50000,
            'status' => 'completed',
            'notes' => 'Tolong dibungkus terpisah',
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'menu_item_id' => $kopi->id,
            'quantity' => 2,
            'price' => $kopi->price,
            'subtotal' => $kopi->price * 2,
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'menu_item_id' => $pisangGoreng->id,
            'quantity' => 1,
            'price' => $pisangGoreng->price,
            'subtotal' => $pisangGoreng->price * 1,
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'menu_item_id' => $teh->id,
            'quantity' => 1,
            'price' => $teh->price,
            'subtotal' => $teh->price * 1,
        ]);

        // Order 2 - Customer 2
        $order2 = Order::create([
            'user_id' => $customer2->id,
            'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid()),
            'total_amount' => 75000,
            'status' => 'processing',
            'notes' => null,
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'menu_item_id' => $nasiGoreng->id,
            'quantity' => 1,
            'price' => $nasiGoreng->price,
            'subtotal' => $nasiGoreng->price * 1,
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'menu_item_id' => $latte->id,
            'quantity' => 2,
            'price' => $latte->price,
            'subtotal' => $latte->price * 2,
        ]);

        echo "✓ Orders seeded successfully!\n";
    }
}
